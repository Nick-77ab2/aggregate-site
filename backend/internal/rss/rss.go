package rss

import (
	"fmt"

	"github.com/mmcdole/gofeed"
)

var feedURL string = "https://www.gdacs.org/xml/rss.xml"

func Fetch() {
	fp := gofeed.NewParser()
	feed, _ := fp.ParseURL(feedURL)

	items := feed.Items

	count := 0
	for _, item := range items { 
		count++
		fmt.Println(item.Extensions["gdacs"]["eventid"][0].Value)
	}

}
