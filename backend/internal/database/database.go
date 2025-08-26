package database

import (
	"database/sql"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// define schema
var schema string = `
	CREATE TABLE IF NOT EXISTS events (
		gdacsID TEXT PRIMARY KEY,
		name TEXT,
		type TEXT NOT NULL,
		eventID TEXT NOT NULL,
		fromdate INTEGER NOT NULL,
		todate INTEGER NOT NULL,
		timestamp INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS episodes (
		episodeID TEXT NOT NULL,
		gdacsID TEXT NOT NULL,
		timestamp INTEGER NOT NULL,
		title TEXT NOT NULL,
		alertLevel TEXT NOT NULL,
		description TEXT,
		countries TEXT,
		latitude REAL NOT NULL,
		longitude REAL NOT NULL,
		PRIMARY KEY (episodeID, gdacsID),
		FOREIGN KEY (gdacsID) REFERENCES events(gdacsID)
	);
`

// define database structs
type Database struct {
	conn 			*sql.DB
}

type Coordinate struct {
	Latitude 	float32
	Longitude 	float32
}

type Episode struct {
	EpisodeID 	string
	DisasterID 	string
	Timestamp 	int64
	Title		string
	AlertLevel 	string
	Description string
	Countries 	string
	Position 	Coordinate
}

type Event struct {
	GDACSID 	string
	Name 		string
	Type 		string
	EventID 	string
	FromDate   	int64
	ToDate 		int64
	Timestamp 	int64
}

func Open(dbFile string) (Database, error) {
	var (
		err error
		db Database
		needBootstrap = false
	)

	if _, err = os.Stat(dbFile); err != nil {
		needBootstrap = true
	} 

	var (
		dbType					string			= "sqlite3"
		dbOptsURL				string 			= "file:" + dbFile + "?_journal=WAL"
		maxOpenConn				int				= 1 // disable the pool to bypass lock-file problem (SQLite), concurrency will be handled by SQLite itself
		maxIdleConn				int 			= 5
		maxConnLifetime			time.Duration	= 5 * time.Minute
		maxIdleConnLifetime		time.Duration	= 5 * time.Minute
	)
	
	conn, err := sql.Open(dbType, dbOptsURL)
	if err != nil {
		return db, err
	}

	conn.SetMaxIdleConns(maxIdleConn)
	conn.SetMaxOpenConns(maxOpenConn)
	conn.SetConnMaxIdleTime(maxIdleConnLifetime)
	conn.SetConnMaxLifetime(maxConnLifetime)
	db.conn = conn

	// if not bootstrapped, then bootstrap it
	if needBootstrap {
		err = db.bootstrap() 	
	}

	return db, err
}

func (db Database) bootstrap() error {
	// Must only run after checking if it's an empty database
	conn := db.conn
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

func (db Database) Close() {
	db.conn.Close()
}

func (db Database) InsertEpisode(entry Episode) error {
	var err error
	query := `INSERT INTO episodes(
		episodeID, 
		gdacsID,
		timestamp,
		title,
		alertLevel,
		description,
		countries,
		latitude,
		longitude)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`



	return err
}
