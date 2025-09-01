package rss

import (
	"aggregate-site/backend/internal/database"
	"strconv"
	"strings"
	"time"

	"github.com/mmcdole/gofeed"
	ext "github.com/mmcdole/gofeed/extensions"
)

var feedURL string = "https://www.gdacs.org/xml/rss.xml"

func findKeyValue(ext map[string][]ext.Extension, keys []string) string {

	// pop the first key
	key, remainingKeys := keys[0], keys[1:]

	valArr := ext[key]
	// for now there is no multiple extensions in one key,
	// so we just take first item
	val := valArr[0]
	if len(remainingKeys) == 0 {
		return val.Value
	}
	return findKeyValue(val.Children, remainingKeys)
}

func findExtensionValue(item *gofeed.Item, key string) string {
	keys := strings.Split(key, ":")
	namespace, keys := keys[0], keys[1:]

	ext := item.Extensions[namespace] // find namespace
	return findKeyValue(ext, keys)
}

func Fetch(db database.Database) error {
	var err error

	fp := gofeed.NewParser()
	feed, _ := fp.ParseURL(feedURL)

	items := feed.Items

	entries := []database.Entry{}
	disasters := []database.Disaster{}
	// TODO:rewrite this for concurrency
	for _, item := range items {
		lat, err := strconv.ParseFloat(findExtensionValue(item, "geo:Point:lat"), 64)
		if err != nil {
			return err
		}
		long, err := strconv.ParseFloat(findExtensionValue(item, "geo:Point:long"), 64)
		if err != nil {
			return err
		}

		// format the entry
		var entry = database.Entry{
			DisasterID: item.GUID,
			Title:      item.Title,
			Summary:    item.Description,
			Timestamp:  item.PublishedParsed.Unix(),
			AlertLevel: findExtensionValue(item, "gdacs:episodealertlevel"),
			Countries:  findExtensionValue(item, "gdacs:country"),
			Latitude:   lat,
			Longitude:  long,
		}
		entries = append(entries, entry)

		fromDate, err := time.Parse(
			time.RFC1123,
			findExtensionValue(item, "gdacs:fromdate"),
		)
		if err != nil {
			return err
		}

		toDate, err := time.Parse(
			time.RFC1123,
			findExtensionValue(item, "gdacs:todate"),
		)
		if err != nil {
			return err
		}

		// format the disaster
		var disaster = database.Disaster{
			DisasterID: item.GUID,
			Name:       findExtensionValue(item, "gdacs:eventname"),
			Type:       findExtensionValue(item, "gdacs:eventtype"),
			EventID:    findExtensionValue(item, "gdacs:eventid"),
			FromDate:   fromDate.Unix(),
			ToDate:     toDate.Unix(),
		}
		disasters = append(disasters, disaster)
	}
	err = db.InsertEntries(entries)
	if err != nil {
		return err
	}
	err = db.InsertDisaster(disasters)
	return err
}
