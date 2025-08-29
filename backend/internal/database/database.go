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

// define database structs
type Database struct {
	readOnly 	*sql.DB
	readWrite 	*sql.DB
}

type Disaster struct {
	DisasterID 	string		`json:"disasterID"`
	Name 		string		`json:"name"`
	Type 		string		`json:"type"`
	EventID 	string		`json:"eventID"`
	FromDate   	int64		`json:"fromdate"`
	ToDate 		int64		`json:"todate"`
}

type Entry struct {
	DisasterID 	string  	`json:"disasterID"`	 
	Timestamp 	int64		`json:"timestamp"`
	Title		string		`json:"title"`
	AlertLevel 	string		`json:"alertLevel"`
	Summary 	string		`json:"summary"`
	Countries 	string		`json:"countries"`
	Latitude 	float64		`json:"latitude"`
	Longitude 	float64		`json:"longitude"`
}


func Open(filename string) (Database, error) {
	var (
		db Database
		err error
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
	dbOptsURL 				:= "file:" + filename + "?_journal=WAL"
	dbType					:= "sqlite3"
	maxConnLifetime     	:= 5 * time.Minute
	maxIdleConnLifetime 	:= 5 * time.Minute
	
	// read-only conn pool specific config
	maxOpenConnRO			:= 10
	maxIdleConnRO         	:= 5
	
	// read-write conn pool specific config
	dbOptsURLRW 			:= dbOptsURL + "&_txlock=immediate&_timeout=5000"
	maxOpenConnRW 			:= 1
	maxIdleConnRW 			:= 1

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

	if (needBootstrap) {
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

func (db Database) InsertEpisode(entries []Entry) error {
	var err error
	
	query := `
		INSERT OR IGNORE
		INTO entries(timestamp, title, disasterID, alertLevel, summary, countries, latitude, longitude)
		VALUES(?,?,?,?,?,?,?,?);
	`

	conn := db.readWrite
	tx, err :=  conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	for i:=0; i<len(entries); i++ {
		entry := entries[i]
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
