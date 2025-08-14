package main

import (
	"aggregate-site/backend/internal/database"
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Database
	_, err := database.Open("feed.db")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	// Router
	mux.HandleFunc("GET /", exampleHandler)
	mux.HandleFunc("GET /query", queryHandler)
	
	log.Fatal(http.ListenAndServe(":5000", mux))
}

func exampleHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")
}

func queryHandler(w http.ResponseWriter, r *http.Request) {
	lat := r.URL.Query().Get("lat")
	long := r.URL.Query().Get("long")
	current := r.URL.Query().Get("current")

	fmt.Fprintln(w, lat, long, current)
}
