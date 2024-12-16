from flask import Flask, request;
from time import strftime, gmtime
from datetime import datetime, timedelta
import rss

rss.bootstrapping()

app = Flask("rss");

@app.route("/")
def hello_world():
    return "<p>Hello world!</p>"

@app.route("/update")
def update():
    rss.populate_entries()
    return "<p> Updating entries...</p>"

@app.route("/query")
def query():
    #TODO: call rss.query() here, interpret the result, and send back probably JSON
    # should assume IP of request as location/country if not specified
    entries = rss.query(request.args.get('lat'), request.args.get('long'))

    # if requested current, return only disasters that has a todate within today
    # else return everything else
    
    today = datetime.today()
    yesterday = today - timedelta(days=1)
    current = []
    past = []

    for entry in entries:
        todate = datetime.fromtimestamp(entry["todate"])
        if (todate.date() == today.date() or todate.date() == yesterday.date()):
            current.append(entry)
            print("current: '" + entry["title"] + " " + str(todate.date()) + "'")
        else:
            past.append(entry)
            print("past: '" + entry["title"] + " " + str(todate.date()) + "'")

    try:
        isCurrent = request.args.get('current')
    except:
        isCurrent = '-1'

    if isCurrent=='1':
        results = current
    elif isCurrent=='0':
        results = past
    else:
        results = current + past

            

    def isoformat(unixTimestamp):
        return strftime("%Y-%m-%dT%H:%M:%SZ", gmtime(unixTimestamp))
    
    for result in results:
        result["timestamp"] = isoformat(result["timestamp"])
        result["fromdate"] = isoformat(result["fromdate"])
        result["todate"] = isoformat(result["todate"])
        result["countries"] = result["countries"].split(', ')
    
 
    return results
