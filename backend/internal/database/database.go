package database

import (
	"database/sql"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// define schema and queries
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


func Open(dbFile string) (*sql.DB, error) {
	var needBootstrap = false
	if _, err := os.Stat(dbFile); err != nil {
		needBootstrap = true
	} 

	var (
		dbType					string			= "sqlite3"
		dbOptsURL				string 			= "file:" + dbFile + "?_journal=WAL"
		maxOpenConn				int				= 10
		maxIdleConn				int 			= 5
		maxConnLifetime			time.Duration	= 5 * time.Minute
		maxIdleConnLifetime		time.Duration	= 5 * time.Minute
	)
	
	db, err := sql.Open(dbType, dbOptsURL)
	if err != nil {
		return db, err
	}

	db.SetMaxIdleConns(maxIdleConn)
	db.SetMaxOpenConns(maxOpenConn)
	db.SetConnMaxIdleTime(maxIdleConnLifetime)
	db.SetConnMaxLifetime(maxConnLifetime)

	// if not bootstrapped, then bootstrap it
	if needBootstrap {
		err = bootstrap(db)
	}

	return db, err
}

func bootstrap(db *sql.DB) error {
	// Must only run after checking if it's an empty database

	tx, err := db.Begin()
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
