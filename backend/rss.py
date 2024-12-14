import sqlite3
from time import mktime, strptime
import feedparser

def create_entries_table():
    #TODO: NEEDS reasonable schema here

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
                    unixTimetamp INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    disasterID TEXT NOT NULL,
                    alertLevel TEXT NOT NULL,
                    summary TEXT,
                    country TEXT,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    PRIMARY KEY (unixTimetamp, title),
                    FOREIGN KEY (disasterID) REFERENCES disasters(disasterID)
                );


                '''
    try:
        cursor = database.cursor()
        cursor.executescript(entries_table)
        database.commit()
    
    except sqlite3.Error as e:
        print(e)

def populate_entries():
    try:
        cursor = database.cursor()
        insert_entry_statement = '''INSERT INTO entries(unixTimetamp, title, disasterID, alertLevel, summary, country, latitude, longitude)
                                VALUES(?,?,?,?,?,?,?,?);'''

        upsert_disaster_statement = '''INSERT INTO disasters(disasterID, name, type, eventID, fromdate, todate) 
                                            VALUES(?,?,?,?,?,?)
                                            ON CONFLICT(disasterID) DO UPDATE SET
                                                todate = excluded.todate
                                            WHERE excluded.todate > todate
                                            '''
        for entry in newsfeed.entries:
            # entries table's value
            disasterid = entry.id
            unixTimetamp = int(mktime(entry.published_parsed))
            title = entry.title
            alertLevel = entry.gdacs_alertlevel
            summary = entry.summary
            country = entry.gdacs_country # comma separated if multiple
            lat = entry.geo_lat
            long = entry.geo_long

            # disasters table's value
            name = entry.gdacs_eventname
            typ = entry.gdacs_eventtype
            eventID = entry.gdacs_eventid 
            fromdate = int(mktime(strptime(entry.gdacs_fromdate, '%a, %d %b %Y %H:%M:%S GMT')))
            todate = int(mktime(strptime(entry.gdacs_todate, '%a, %d %b %Y %H:%M:%S GMT')))

            cursor.execute(insert_entry_statement, (unixTimetamp, 
                                                    title,
                                                    disasterid,
                                                    alertLevel,
                                                    summary, 
                                                    country,
                                                    lat,
                                                    long
                                                    ))
            cursor.execute(upsert_disaster_statement, (disasterid,
                                                       name,
                                                       typ,
                                                       eventID,
                                                       fromdate,
                                                       todate
                                                       ))

            database.commit()

    except sqlite3.Error as e:
        print(e, " from popEn")

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
    
    # normalize longitude
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
