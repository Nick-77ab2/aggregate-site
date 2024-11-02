from flask import Flask;
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
    return "";
