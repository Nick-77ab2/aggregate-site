package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	// Router
	mux.HandleFunc("GET /", exampleFunc)
	
	log.Fatal(http.ListenAndServe(":5000", mux))
}

func exampleFunc(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")
}
