import sqlite3
from dataclasses import dataclass

@dataclass
class Entry:
    timestamp: int
    title: str
    disasterID: str
    alertLevel: str
    summary: str
    countries: str
    lat: float


def initDatabase(db_file):
    return sqlite3.connect(db_file, check_same_thread=False) # python's 3.11's sqlite3 is compiled with threadsafety already

def create_entries_table(db):
    # initialize table
    entries_table = '''
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


                '''
    try:
        cursor = db.cursor()
        cursor.executescript(entries_table)
        db.commit()
    
    except sqlite3.Error as e:
        print(e)


