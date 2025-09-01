package database

import (
	"database/sql"
	"errors"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// define schema
var schema string = `
CREATE TABLE IF NOT EXISTS disasters (
	disasterID TEXT PRIMARY KEY,
	name TEXT,
	type TEXT NOT NULL,
	eventID TEXT NOT NULL,
	fromdate INTEGER NOT NULL,
	todate INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
	timestamp INTEGER NOT NULL,
	title TEXT NOT NULL,
	disasterID TEXT NOT NULL,
	alertLevel TEXT NOT NULL,
	summary TEXT,
	countries TEXT,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	PRIMARY KEY (timestamp, title),
	FOREIGN KEY (disasterID) REFERENCES disasters(disasterID)
);
`

const (
	LAT_LIMIT  float64 = 90
	LONG_LIMIT float64 = 180
)

type geoRangeIndex int

const (
	Start geoRangeIndex = iota
	StartLimit
	EndLimit
	End
)

// define database structs
type Database struct {
	readOnly  *sql.DB
	readWrite *sql.DB
}

type Disaster struct {
	DisasterID string `json:"disasterID"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	EventID    string `json:"eventID"`
	FromDate   int64  `json:"fromdate"`
	ToDate     int64  `json:"todate"`
}

type Entry struct {
	DisasterID string  `json:"disasterID"`
	Timestamp  int64   `json:"timestamp"`
	Title      string  `json:"title"`
	AlertLevel string  `json:"alertLevel"`
	Summary    string  `json:"summary"`
	Countries  string  `json:"countries"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}

type QueryResult struct {
	DisasterID string  `json:"disasterID"`
	Timestamp  int64   `json:"timestamp"`
	Title      string  `json:"title"`
	AlertLevel string  `json:"alertLevel"`
	Summary    string  `json:"summary"`
	Countries  string  `json:"countries"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Name       string  `json:"name"`
	Type       string  `json:"type"`
	EventID    string  `json:"eventID"`
	FromDate   int64   `json:"fromdate"`
	ToDate     int64   `json:"todate"`
}

func Open(filename string) (Database, error) {
	var (
		db            Database
		err           error
		needBootstrap bool = false
	)

	if filename == "" {
		err = errors.New("Empty filename")
		return db, err
	}

	if _, err = os.Stat(filename); err != nil {
		needBootstrap = true
	}

	// database general config
	dbOptsURL := "file:" + filename + "?_journal=WAL"
	dbType := "sqlite3"
	maxConnLifetime := 5 * time.Minute
	maxIdleConnLifetime := 5 * time.Minute

	// read-only conn pool specific config
	maxOpenConnRO := 10
	maxIdleConnRO := 5

	// read-write conn pool specific config
	dbOptsURLRW := dbOptsURL + "&_txlock=immediate&_timeout=5000"
	maxOpenConnRW := 1
	maxIdleConnRW := 1

	// read-only pool
	db.readOnly, err = sql.Open(dbType, dbOptsURL)
	if err != nil {
		return db, err
	}
	db.readOnly.SetMaxIdleConns(maxIdleConnRO)
	db.readOnly.SetMaxOpenConns(maxOpenConnRO)
	db.readOnly.SetConnMaxIdleTime(maxIdleConnLifetime)
	db.readOnly.SetConnMaxLifetime(maxConnLifetime)

	// read-write pool
	db.readWrite, err = sql.Open(dbType, dbOptsURLRW)
	if err != nil {
		return db, err
	}
	db.readWrite.SetMaxIdleConns(maxIdleConnRW)
	db.readWrite.SetMaxOpenConns(maxOpenConnRW)
	db.readWrite.SetConnMaxIdleTime(maxIdleConnLifetime)
	db.readWrite.SetConnMaxLifetime(maxConnLifetime)

	if needBootstrap {
		db.bootstrap()
	}

	return db, err
}

func (db Database) Close() {
	db.readOnly.Close()
	db.readWrite.Close()
}

func (db Database) bootstrap() error {
	// Must only run after checking if it's an empty database
	conn := db.readWrite
	tx, err := conn.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec(schema)
	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return err
}

func (db Database) InsertEntries(entries []Entry) error {
	var err error

	query := `
		INSERT OR IGNORE
		INTO entries(timestamp, title, disasterID, alertLevel, summary, countries, latitude, longitude)
		VALUES(?,?,?,?,?,?,?,?);
	`

	conn := db.readWrite
	tx, err := conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, entry := range entries {
		_, err = tx.Exec(query,
			entry.Timestamp,
			entry.Title,
			entry.DisasterID,
			entry.AlertLevel,
			entry.Summary,
			entry.Countries,
			entry.Latitude,
			entry.Longitude,
		)
		if err != nil {
			return err
		}
	}

	tx.Commit()
	return err
}

func (db Database) InsertDisaster(disasters []Disaster) error {
	var err error

	query := `
		INSERT INTO disasters(disasterID, name, type, eventID, fromdate, todate) 
		VALUES(?,?,?,?,?,?)
		ON CONFLICT(disasterID) DO UPDATE SET
			todate = excluded.todate
		WHERE excluded.todate > disasters.todate
	`

	conn := db.readWrite
	tx, err := conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, disaster := range disasters {
		_, err = tx.Exec(query,
			disaster.DisasterID,
			disaster.Name,
			disaster.Type,
			disaster.EventID,
			disaster.FromDate,
			disaster.ToDate,
		)
		if err != nil {
			return err
		}
	}

	tx.Commit()
	return err
}

func (db Database) Query(lat float64, long float64) ([]QueryResult, error) {
	var (
		results = []QueryResult{}
		err     error
	)

	latRange := geoRangeGenerator(lat, float64(1), LAT_LIMIT)
	longRange := geoRangeGenerator(long, float64(1), LONG_LIMIT)

	latTCRange := geoRangeGenerator(lat, float64(3), LAT_LIMIT)
	longTCRange := geoRangeGenerator(long, float64(3), LONG_LIMIT)

	query := `
	SELECT 
		entries.timestamp,
		entries.title,
		entries.disasterID,
		entries.alertLevel,
		entries.summary,
		entries.countries,
		entries.latitude,
		entries.longitude,	
		disasters.name,
		disasters.type,
		disasters.eventID,
		disasters.fromdate,
		disasters.todate
	FROM (
		entries LEFT JOIN disasters ON entries.disasterID = disasters.disasterID) 
	WHERE CASE
	WHEN type = "TC" THEN
		((latitude BETWEEN ? AND ?) OR (latitude BETWEEN ? AND ?)) 
		AND 
		((longitude BETWEEN ? AND ?) OR (longitude BETWEEN ? AND ?)) 
	ELSE
		((latitude BETWEEN ? AND ?) OR (latitude BETWEEN ? AND ?)) 
		AND 
		((longitude BETWEEN ? AND ?) OR (longitude BETWEEN ? AND ?))
	END
	ORDER BY timestamp DESC;
	`

	conn := db.readOnly
	tx, err := conn.Begin()
	if err != nil {
		return results, err
	}
	defer tx.Rollback()

	rows, err := tx.Query(
		query,
		latTCRange[Start], latTCRange[StartLimit], latTCRange[EndLimit], latTCRange[End],
		longTCRange[Start],
		longTCRange[StartLimit], longTCRange[EndLimit], longTCRange[End],
		latRange[Start], latRange[StartLimit], latRange[EndLimit], latRange[End],
		longRange[Start], longRange[StartLimit], longRange[EndLimit], longRange[End],
	)
	if err != nil {
		return results, err
	}
	defer rows.Close()

	for rows.Next() {
		var entry QueryResult
		err := rows.Scan(
			&entry.Timestamp,
			&entry.Title,
			&entry.DisasterID,
			&entry.AlertLevel,
			&entry.Summary,
			&entry.Countries,
			&entry.Latitude,
			&entry.Longitude,
			&entry.Name,
			&entry.Type,
			&entry.EventID,
			&entry.FromDate,
			&entry.ToDate,
		)
		if err != nil {
			return results, err
		}

		results = append(results, entry)
	}

	err = tx.Commit()
	return results, err
}

func geoRangeGenerator(point float64, delta float64, limit float64) [4]float64 {
	var result = [4]float64{}
	if limit < 0 {
		// normalize the limit by taking its absolute value
		limit = -limit
	}
	oppLimit := -limit

	// initial values, in case we do not need to account for wrap around case
	result[Start] = point - delta
	result[End] = point + delta
	result[StartLimit] = point
	result[EndLimit] = point

	if result[Start] < oppLimit {
		result[StartLimit] = oppLimit
		result[Start] = result[Start] + limit*2 // normalize the overflow value
	} else if result[End] > limit {
		result[EndLimit] = limit
		result[End] = result[End] + oppLimit*2
	}

	return result
}
