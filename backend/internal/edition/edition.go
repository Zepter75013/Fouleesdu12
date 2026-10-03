package edition

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"foulees12/backend/internal/httpx"
)

// Depart : une course de l'édition (heure, distance, tarif).
type Depart struct {
	Heure  string `json:"heure"`
	Course string `json:"course"`
	Detail string `json:"detail"`
	Prix   string `json:"prix"`
}

// Retrait : un créneau de retrait des dossards.
type Retrait struct {
	Jour  string `json:"jour"`
	Quand string `json:"quand"`
	Ou    string `json:"ou"`
}

// Courante : l'édition à venir, telle que l'affiche le site.
type Courante struct {
	Annee          int       `json:"annee"`
	Numero         *int      `json:"numero"`
	Date           *string   `json:"date"` // AAAA-MM-JJ
	InscriptionURL string    `json:"inscriptionUrl"`
	Reference      int       `json:"reference"` // année dont les horaires et tarifs sont repris tant qu'ils ne sont pas confirmés
	OptionChimps   string    `json:"optionChimps"`
	Departs        []Depart  `json:"departs"`
	Retrait        []Retrait `json:"retrait"`
}

type Lien struct {
	Label string `json:"label"`
	Href  string `json:"href"`
}

type Groupe struct {
	Titre string `json:"titre"`
	Liens []Lien `json:"liens"`
}

// Archive : une édition passée, avec ses résultats, albums et vidéos.
type Archive struct {
	Annee     int      `json:"annee"`
	Titre     string   `json:"titre"`
	Texte     string   `json:"texte"`
	Resultats string   `json:"resultats"`
	Groupes   []Groupe `json:"groupes"`
}

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// Current renvoie l'édition la plus récente (la prochaine à courir).
func (r *Repository) Current() (*Courante, error) {
	var (
		id        int64
		e         Courante
		numero    sql.NullInt64
		date      sql.NullTime
		reference sql.NullInt64
	)
	err := r.db.QueryRow(`
		SELECT id, annee, numero, date_course, inscription_url, horaires_reference, option_chimps
		FROM editions
		ORDER BY annee DESC
		LIMIT 1`).Scan(&id, &e.Annee, &numero, &date, &e.InscriptionURL, &reference, &e.OptionChimps)
	if err != nil {
		return nil, err
	}
	if numero.Valid {
		n := int(numero.Int64)
		e.Numero = &n
	}
	if date.Valid {
		d := date.Time.Format(time.DateOnly)
		e.Date = &d
	}
	e.Reference = e.Annee
	if reference.Valid {
		e.Reference = int(reference.Int64)
	}

	e.Departs = []Depart{}
	rows, err := r.db.Query(`
		SELECT heure, course, detail, prix FROM edition_departs
		WHERE edition_id = ? ORDER BY ordre`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var d Depart
		if err := rows.Scan(&d.Heure, &d.Course, &d.Detail, &d.Prix); err != nil {
			return nil, err
		}
		e.Departs = append(e.Departs, d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	e.Retrait = []Retrait{}
	rrows, err := r.db.Query(`
		SELECT jour, horaire, lieu FROM edition_retraits
		WHERE edition_id = ? ORDER BY ordre`, id)
	if err != nil {
		return nil, err
	}
	defer rrows.Close()
	for rrows.Next() {
		var rt Retrait
		if err := rrows.Scan(&rt.Jour, &rt.Quand, &rt.Ou); err != nil {
			return nil, err
		}
		e.Retrait = append(e.Retrait, rt)
	}
	return &e, rrows.Err()
}

// Archives renvoie les éditions passées (toutes sauf la plus récente), de la plus récente à la plus ancienne.
func (r *Repository) Archives() ([]Archive, error) {
	rows, err := r.db.Query(`
		SELECT e.annee, e.titre, e.texte, e.resultats_url, g.titre, l.label, l.href
		FROM editions e
		LEFT JOIN edition_groupes g ON g.edition_id = e.id
		LEFT JOIN edition_liens l ON l.groupe_id = g.id
		WHERE e.annee < (SELECT MAX(annee) FROM editions)
		ORDER BY e.annee DESC, g.ordre, g.id, l.ordre, l.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	archives := []Archive{}
	for rows.Next() {
		var (
			a                   Archive
			gTitre, label, href sql.NullString
		)
		if err := rows.Scan(&a.Annee, &a.Titre, &a.Texte, &a.Resultats, &gTitre, &label, &href); err != nil {
			return nil, err
		}
		if n := len(archives); n == 0 || archives[n-1].Annee != a.Annee {
			a.Groupes = []Groupe{}
			archives = append(archives, a)
		}
		cur := &archives[len(archives)-1]
		if !gTitre.Valid {
			continue
		}
		if n := len(cur.Groupes); n == 0 || cur.Groupes[n-1].Titre != gTitre.String {
			cur.Groupes = append(cur.Groupes, Groupe{Titre: gTitre.String, Liens: []Lien{}})
		}
		if label.Valid {
			g := &cur.Groupes[len(cur.Groupes)-1]
			g.Liens = append(g.Liens, Lien{Label: label.String, Href: href.String})
		}
	}
	return archives, rows.Err()
}

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) Current(w http.ResponseWriter, r *http.Request) {
	e, err := h.repo.Current()
	if errors.Is(err, sql.ErrNoRows) {
		httpx.Error(w, http.StatusNotFound, "aucune édition enregistrée")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "impossible de charger l'édition")
		return
	}
	httpx.JSON(w, http.StatusOK, e)
}

func (h *Handler) Archives(w http.ResponseWriter, r *http.Request) {
	archives, err := h.repo.Archives()
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "impossible de charger les archives")
		return
	}
	httpx.JSON(w, http.StatusOK, archives)
}
