package main

import (
	"aggregate-site/backend/internal/database"
	"aggregate-site/backend/internal/rss"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/joho/godotenv"
)

var db database.Database

func main() {
	// loading envvar
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values...")
	} else {
		log.Println("Loaded .env file")
	}

	dbFile, exists := os.LookupEnv("DB_FILE")
	if !exists {
		dbFile = path.Join("feed.db")
	}

	// Database
	db, err := database.Open(dbFile)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = rss.Fetch(db)
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	// Router
	mux.HandleFunc("GET /", exampleHandler)
	mux.HandleFunc("GET /query", queryHandler)
	
	log.Println("Server is serving at http://localhost:5000")
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
