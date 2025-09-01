package controller

import (
	"aggregate-site/backend/internal/database"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type Currentness int8

const (
	PRESENT Currentness = iota
	PAST
	ALL
)

type QueryResponse struct {	
	DisasterID string  `json:"disasterID"`
	Timestamp  string  `json:"timestamp"`
	Title      string  `json:"title"`
	AlertLevel string  `json:"alertLevel"`
	Summary    string  `json:"summary"`
	Countries  []string  `json:"countries"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`	
	Name       string  `json:"name"`
	Type       string  `json:"type"`
	EventID    string  `json:"eventID"`
	FromDate   string  `json:"fromdate"`
	ToDate     string  `json:"todate"`
}

func parseQueryResult(res database.QueryResult) QueryResponse {
	var qr QueryResponse
	qr.DisasterID = res.DisasterID
	//qr.Timestamp = res.Timestamp // needs parsing
	qr.Title = res.Title
	qr.AlertLevel = res.AlertLevel
	qr.Summary = res.Summary
	//qr.Countries = res.Countries
	qr.Latitude = res.Latitude
	qr.Longitude = res.Longitude
	qr.Name = res.Name
	qr.Type = res.Type
	qr.EventID = res.EventID
	//qr.FromDate = res.FromDate // needs parsing
	//qr.ToDate = res.ToDate

	// parse out the timestamp
	layout := "2006-01-02T15:04:05Z"

	timestamp := time.Unix(res.Timestamp,0 ).UTC()
	qr.Timestamp = timestamp.Format(layout)

	fromDate := time.Unix(res.FromDate, 0).UTC()
	qr.FromDate = fromDate.Format(layout)

	toDate := time.Unix(res.ToDate, 0).UTC()
	qr.ToDate = toDate.Format(layout)

	// split the countries
	qr.Countries = strings.Split(res.Countries, ", ")

	return qr
}

// QueryHandler godoc
//
//	@Summary		Query the backend for relevant events surrounding a coordinate
//	@Description	Consume lat, long, and current params, and return a list of events that are separated by categories
//	@Tags			query
//	@Param			lat query float64 true "latitude of the place"
//	@Param			long query float64 true "longitude of the place"
//	@Param			current query int false "1 for present, 0 for past, any for all"
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

		rawEntries, err := db.Query(lat, long)
		if err != nil {
			log.Println(err)
			w.WriteHeader(400)
			return
		}

		// sort into past and current
		var (
			current = []database.QueryResult{}
			past = []database.QueryResult{}
		)
		
		today := time.Now()
		// set the time to 0:00
		today = time.Date(
			today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

		for _, rawEntry := range rawEntries {
			if rawEntry.Timestamp >= today.Unix() {
				current = append(current, rawEntry)
			} else {
				past = append(past, rawEntry)
			}
		}

		var usableSet []database.QueryResult
		switch isCurrent {
		case PRESENT:
			usableSet = current
		case PAST:
			usableSet = past
		default:
			usableSet = rawEntries
		}
			

		res := []QueryResponse{}
		for _, rawEntry := range usableSet {
			var result QueryResponse
			result = parseQueryResult(rawEntry)
			res = append(res, result)
		}

		enc := json.NewEncoder(w)
		enc.Encode(res)
	}
}
