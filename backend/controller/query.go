package controller

import (
	"aggregate-site/backend/internal/database"
	"log"
	"net/http"
	"strconv"
)

type Currentness int8

const (
	PRESENT Currentness = iota
	PAST
	ALL
)

// QueryHandler godoc
//
//	@Summary		Query the backend for relevant events surrounding a coordinate
//	@Description	Consume lat, long, and current params, and return a list of events that are separated by categories
//	@Tags			query
//	@Params			lat query float64 true "latitude of the place"
//	@Params			long query float64 true "longitude of the place"
//	@Params			current query int false "1 for present, 0 for past, any for all"
//	@Produce		json
//	@Success		200
//	@Failure		400
//	@Router			/query [get]
func QueryHandler(db database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var (
			latParam       string = r.URL.Query().Get("lat")
			longParam      string = r.URL.Query().Get("long")
			isCurrentParam string = r.URL.Query().Get("current")
		)

		lat, err := strconv.ParseFloat(latParam, 64)
		if err != nil {
			log.Println("Invalid lat param detected: ", latParam)
			return
		}

		long, err := strconv.ParseFloat(longParam, 64)
		if err != nil {
			log.Println("Invalid long param detected: ", longParam)
			return
		}

		var isCurrent Currentness
		switch isCurrentParam {
		case "1":
			isCurrent = PRESENT
		case "0":
			isCurrent = PAST
		default:
			isCurrent = ALL
		}

		rawEntries := db.Query(lat, long)
		//	TODO: do the formatting here
		log.Println(isCurrent, rawEntries)
	}
}
