package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"foulees12/backend/internal/config"
	"foulees12/backend/internal/db"
	"foulees12/backend/internal/httpapi"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	conn, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer conn.Close()

	router := httpapi.NewRouter(conn, cfg)

	log.Printf("Foulées du 12 API listening on :%s", cfg.AppPort)
	if err := http.ListenAndServe(":"+cfg.AppPort, router); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
