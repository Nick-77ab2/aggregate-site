package database

import (
	"database/sql"
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
	conn 			*sql.DB
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

func (db Database) InsertEpisode(entry Entry) error {
	var err error
	return err
}
