import sqlite3
from time import mktime
import feedparser

def create_entries_table():
    #TODO: NEEDS reasonable schema here

    # initialize table
    # currently only stores title, summary, gdacs_country
    entries_table = '''CREATE TABLE IF NOT EXISTS entries (
                    unixTimetamp INTEGER,
                    title TEXT NOT NULL,
                    disasterID TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    country TEXT NOT NULL,
                    PRIMARY KEY (unixTimetamp, title)
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
        insert_statement = '''INSERT INTO entries(unixTimetamp,title,disasterID,summary,country)
                                VALUES(?,?,?,?,?) '''
        for entry in newsfeed.entries:
            disasterid = entry.id
            unixTimetamp = int(mktime(entry.published_parsed))
            title = entry.title
            summary = entry.summary
            country = entry.gdacs_country # comma separated if multiple

            cursor.execute(insert_statement, (unixTimetamp, 
                                              title,
                                              disasterid,
                                              summary, 
                                              country, 
                                              ))

            database.commit()

    except sqlite3.Error as e:
        print(e, "from popEn")

#TODO: a way to query news based on: 
#   - countries
#   - regions
#   - ID?
def query():
    return 0;


def bootstrapping():
    create_entries_table()
    populate_entries()

feed_url = "https://www.gdacs.org/xml/rss.xml"
db_file = "feed.db" 
newsfeed = feedparser.parse(feed_url)
database = sqlite3.connect(db_file, check_same_thread=False) # python's 3.11's sqlite3 is compiled with threadsafety already

