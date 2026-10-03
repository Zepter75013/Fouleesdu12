package httpapi

import (
	"database/sql"
	"net/http"

	"foulees12/backend/internal/config"
	"foulees12/backend/internal/edition"
	"foulees12/backend/internal/httpx"
)

func NewRouter(db *sql.DB, cfg config.Config) http.Handler {
	mux := http.NewServeMux()

	editionHandler := edition.NewHandler(edition.NewRepository(db))

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Édition à venir (date, départs, tarifs, retrait des dossards, lien d'inscription)
	// et archives des éditions passées (résultats, albums photos, vidéos).
	mux.HandleFunc("GET /api/edition", editionHandler.Current)
	mux.HandleFunc("GET /api/editions", editionHandler.Archives)

	return httpx.CORS(cfg.FrontendURL, mux)
}
