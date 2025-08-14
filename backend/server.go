package main

import (
	"aggregate-site/backend/internal/database"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/joho/godotenv"
)

var db *sql.DB

func main() {
	// loading envvar
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default values...")
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
