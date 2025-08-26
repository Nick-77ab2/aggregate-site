package rss

import (
	"aggregate-site/backend/internal/database"
	"log"
	"strings"

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

	ext := item.Extensions[namespace]	// find namespace
	return findKeyValue(ext, keys)
}

func Fetch() {
	fp := gofeed.NewParser()
	feed, _ := fp.ParseURL(feedURL)

	items := feed.Items

	count := 0
	// TODO:rewrite this for concurrency
	for _, item := range items { 
		count++
		log.Println("{ ", findExtensionValue(item, "gdacs:eventid"), ", ", findExtensionValue(item, "gdacs:episodeid"), " }")

		// format the entry, prioritize the episode attr first
		var entry = database.Episode {
			EpisodeID: findExtensionValue(item, "gdacs:episodeid"),
			DisasterID: item.GUID,
			Title: item.Title,
			Description: item.Description,
			Timestamp: item.PublishedParsed.Unix(),
			AlertLevel: findExtensionValue(item, "gdacs:episodealertlevel"),
			Countries: findExtensionValue(item, "gdacs:country"),
			Position: database.Coordinate{
				Latitude: 0, // NOTE: test, need a way to extract value here
				Longitude: 0,
			},
		}


		log.Println(entry)
	}
}
