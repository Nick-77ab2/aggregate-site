import sqlite3
from time import gmtime, strptime
from calendar import timegm
import feedparser

feed_url = "https://www.gdacs.org/xml/rss.xml"
db_file = "feed.db" 
database = sqlite3.connect(db_file, check_same_thread=False) # python's 3.11's sqlite3 is compiled with threadsafety already

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
        cursor = database.cursor()
        cursor.executescript(entries_table)
        database.commit()
    
    except sqlite3.Error as e:
        print(e)

def populate_entries():
    try:
        newsfeed = feedparser.parse(feed_url)
        cursor = database.cursor()
        insert_entry_statement = '''
                                INSERT OR IGNORE
                                INTO entries(timestamp, title, disasterID, alertLevel, summary, countries, latitude, longitude)
                                VALUES(?,?,?,?,?,?,?,?);
                                '''

        upsert_disaster_statement = '''
                                    INSERT INTO disasters(disasterID, name, type, eventID, fromdate, todate) 
                                    VALUES(?,?,?,?,?,?)
                                    ON CONFLICT(disasterID) DO UPDATE SET
                                        todate = excluded.todate
                                    WHERE excluded.todate > disasters.todate
                                    '''
        for entry in newsfeed.entries:
            # entries table's value
            disasterid = entry.id
            unixTimestamp = int(timegm(entry.published_parsed))
            title = entry.title
            alertLevel = entry.gdacs_alertlevel
            summary = entry.summary
            countries = entry.gdacs_country # comma separated if multiple
            lat = entry.geo_lat
            long = entry.geo_long

            # disasters table's value
            name = entry.gdacs_eventname
            typ = entry.gdacs_eventtype
            eventID = entry.gdacs_eventid 
            fromdate = int(timegm(strptime(entry.gdacs_fromdate, '%a, %d %b %Y %H:%M:%S GMT')))
            todate = int(timegm(strptime(entry.gdacs_todate, '%a, %d %b %Y %H:%M:%S GMT')))

            cursor.execute(insert_entry_statement, (unixTimestamp, 
                                                    title,
                                                    disasterid,
                                                    alertLevel,
                                                    summary, 
                                                    countries,
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

def generate_proximity(lat, long, prox):
    '''calculate raw proximity, then normalize the result'''

    # upper and lower limit to make sure range stays sane as coordinates wrap all the way around
    lat_upper_limit = lat
    lat_lower_limit = lat 
    long_upper_limit = long
    long_lower_limit = long

    lat_start = lat - prox
    lat_end = lat + prox

    # normalize latitude
    if lat_start < -90:
        lat_start += 180
        lat_upper_limit = 90
        lat_lower_limit = -90
    elif lat_end >= 90:
        lat_end -= 180
        lat_upper_limit = 90
        lat_lower_limit = -90
    
    long_start = long - prox
    long_end = long + prox
    
    # normalize longitude
    if long_start < -180:
        long_start += 360
        long_upper_limit = 180
        long_lower_limit = -180
    elif long_end >= 180:
        long_end -= 360
        long_upper_limit = 180
        long_lower_limit = -180

    return (lat_start, lat_upper_limit, lat_lower_limit, lat_end, long_start, long_upper_limit, long_lower_limit, long_end)

def query(latitude, longitude):
    cursor = database.cursor()

    lat = float(latitude)
    long = float(longitude)
    
    # TC range is +-3, otherwise +-1
    sql_inputs = generate_proximity(lat, long, 3) + generate_proximity(lat, long, 1) 

    query = '''
                SELECT * FROM (entries LEFT JOIN disasters ON entries.disasterID = disasters.disasterID) 
                WHERE CASE  
                WHEN type = "TC" THEN
                ((latitude BETWEEN ? AND ?) OR (latitude BETWEEN ? AND ?)) AND ((longitude BETWEEN ? AND ?) OR (longitude BETWEEN ? AND ?)) 
                ELSE
                ((latitude BETWEEN ? AND ?) OR (latitude BETWEEN ? AND ?)) AND ((longitude BETWEEN ? AND ?) OR (longitude BETWEEN ? AND ?))
                END
                ORDER BY timestamp DESC;
            '''
    cursor.execute(query, sql_inputs)

    headers = list(map(lambda attr : attr[0], cursor.description))
    results = [{header:row[i] for i, header in enumerate(headers)} for row in cursor]

    # converting all timestamps to ISO format
    # split countries into a list for easy access
    return results


def bootstrapping():
    create_entries_table()
    populate_entries()


