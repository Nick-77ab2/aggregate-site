from flask import Flask;
import rss

app = Flask("rss");

@app.route("/")
def hello_world():
    return "<p>Hello world!</p>"

@app.route("/update")
def update():
    rss.populate_entries()
    return "<p> Updating entries...</p>"
