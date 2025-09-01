package main

import (
	"aggregate-site/backend/controller"
	_ "aggregate-site/backend/docs"
	"aggregate-site/backend/internal/database"
	"aggregate-site/backend/internal/rss"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

var db database.Database

//	@title			aggregate-site-backend
//	@version		1.0
//	@description	Backend for the aggregate-site project
//	@host			localhost:5000
//	@BasePath		/
//	@license.name	MIT

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
	mux.HandleFunc("GET /query", controller.QueryHandler(db))
	mux.HandleFunc("GET /docs/", httpSwagger.Handler(
		httpSwagger.URL("http://localhost:5000/docs/doc.json"),
	))

	log.Println("Server is serving at http://localhost:5000")
	log.Fatal(http.ListenAndServe(":5000", mux))
}

func exampleHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")
}
