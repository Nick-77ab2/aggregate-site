import sqlite3
from time import mktime
import feedparser

def create_entries_table():
    #TODO: NEEDS reasonable schema here

    # initialize table
    # currently only stores title, summary, gdacs_country
    entries_table = '''CREATE TABLE IF NOT EXISTS entries (
                    unixTimetamp INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    disasterID TEXT NOT NULL,
                    summary TEXT,
                    country TEXT,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
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
        insert_statement = '''INSERT INTO entries(unixTimetamp,title,disasterID,summary,country, latitude, longitude)
                                VALUES(?,?,?,?,?,?,?) '''
        for entry in newsfeed.entries:
            disasterid = entry.id
            unixTimetamp = int(mktime(entry.published_parsed))
            title = entry.title
            summary = entry.summary
            country = entry.gdacs_country # comma separated if multiple
            lat = entry.geo_lat
            long = entry.geo_long

            cursor.execute(insert_statement, (unixTimetamp, 
                                              title,
                                              disasterid,
                                              summary, 
                                              country,
                                              lat,
                                              long
                                              ))

            database.commit()

    except sqlite3.Error as e:
        print(e, "from popEn")

def query(latitude, longitude):
    cursor = database.cursor()

    lat = float(latitude)
    long = float(longitude)
    lat_upper_limit = lat
    lat_lower_limit = lat 
    long_upper_limit = long
    long_lower_limit = long

    lat_start = lat - 3
    lat_end = lat + 3

    # normalize latitude
    if lat_start < -90:
        lat_start += 180
        lat_upper_limit = 90
        lat_lower_limit = -90
    elif lat_end >= 90:
        lat_end -= 180
        lat_upper_limit = 90
        lat_lower_limit = -90
    
    long_start = long - 3
    long_end = long + 3
    
    # normalize the longitude
    if long_start < -180:
        long_start += 360
        long_upper_limit = 180
        long_lower_limit = -180
    elif long_end >= 180:
        long_end -= 360
        long_upper_limit = 180
        long_lower_limit = -180

    sql_inputs = (lat_start, lat_upper_limit, lat_lower_limit, lat_end, long_start, long_upper_limit, long_lower_limit, long_end )
    print(sql_inputs)

    query = '''SELECT * FROM entries WHERE ((latitude BETWEEN ? AND ?) OR (latitude BETWEEN ? AND ?)) AND ((longitude BETWEEN ? AND ?) OR (longitude BETWEEN ? AND ?)) '''
    cursor.execute(query, sql_inputs)

    headers = list(map(lambda attr : attr[0], cursor.description))
    results = [{header:row[i] for i, header in enumerate(headers)} for row in cursor]
    
    return results


def bootstrapping():
    create_entries_table()
    populate_entries()

feed_url = "https://www.gdacs.org/xml/rss.xml"
db_file = "feed.db" 
newsfeed = feedparser.parse(feed_url)
database = sqlite3.connect(db_file, check_same_thread=False) # python's 3.11's sqlite3 is compiled with threadsafety already

