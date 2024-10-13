import sqlite3
import feedparser
from time import mktime

def create_entries_table(database):
    # initialize table
    # currently only stores title, summary, gdacs_country
    entries_table = '''CREATE TABLE IF NOT EXISTS entries (
                    unixTimetamp INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    country TEXT NOT NULL
                );'''
    try:
        cursor = database.cursor()
        cursor.execute(entries_table)
        database.commit()
    
    except sqlite3.Error as e:
        print(e)

def populate_entries(newsfeed, database):
    try:
        cursor = database.cursor()
        insert_statement = '''INSERT INTO entries(unixTimetamp,title,summary,country)
                                VALUES(?,?,?,?) '''
        for entry in newsfeed.entries:
            unixTimetamp = int(mktime(entry.published_parsed))
            title = entry.title
            summary = entry.summary
            country = entry.gdacs_country # string separated if multiple

            cursor.execute(insert_statement, [unixTimetamp, title, summary, country])

            database.commit()

    except sqlite3.Error as e:
        print(e, "from popEn")

                     
if __name__ == "__main__":
    feed_url = "https://www.gdacs.org/xml/rss.xml"
    db_file = "feed.db" 
    newsfeed = feedparser.parse(feed_url)
    database = sqlite3.connect(db_file)
    create_entries_table(database)
    populate_entries(newsfeed, database)
