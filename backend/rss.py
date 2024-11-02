import sqlite3
import feedparser
from time import mktime

def create_entries_table():
    # initialize table
    # currently only stores title, summary, gdacs_country
    entries_table = '''CREATE TABLE IF NOT EXISTS entries (
                    id TEXT NOT NULL,
                    unixTimetamp INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    country TEXT NOT NULL,
                    image TEXT NOT NULL
                );'''
    try:
        cursor = database.cursor()
        cursor.execute(entries_table)
        database.commit()
    
    except sqlite3.Error as e:
        print(e)

def populate_entries():
    try:
        cursor = database.cursor()
        insert_statement = '''INSERT INTO entries(id, unixTimetamp,title,summary,country,image)
                                VALUES(?,?,?,?,?,?) '''
        for entry in newsfeed.entries:
            eid = entry.id
            unixTimetamp = int(mktime(entry.published_parsed))
            title = entry.title
            summary = entry.summary
            country = entry.gdacs_country # comma separated if multiple
            image = entry.gdacs_mapimage

            cursor.execute(insert_statement, (eid, 
                                              unixTimetamp, 
                                              title, 
                                              summary, 
                                              country, 
                                              image))

            database.commit()

    except sqlite3.Error as e:
        print(e, "from popEn")

def bootstrapping():
    create_entries_table()
    populate_entries()

feed_url = "https://www.gdacs.org/xml/rss.xml"
db_file = "feed.db" 
newsfeed = feedparser.parse(feed_url)
database = sqlite3.connect(db_file)
