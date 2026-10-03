# Les Foulées du 12ème — nouveau site

Refonte du site https://foulees.samparis12.org/ (5 km, 10 km et courses enfants dans le Bois de
Vincennes, organisés par la SAM Paris 12), dans la même ligne que la refonte du site du club
(`../SamParis12`) : mêmes polices, couleurs, thème clair/sombre, bornes kilométriques et petit
coureur en maillot SAM.

## Stack

- **Backend** : Go (stdlib `net/http`), MySQL (`go-sql-driver/mysql`)
- **Frontend** : React + Vite, React Router, CSS repris de la refonte SAM Paris 12
  (`frontend/src/index.css`)
- **Déploiement** : Docker Compose, sur le même NAS que les autres apps
  (conteneur MySQL partagé `bdd-mysql`)

## Ce qui est en base, ce qui est dans le code

- **En base** (via l'API) : ce qui change à chaque édition.
  - `GET /api/edition` : l'édition à venir (la plus récente de la table `editions`) — date,
    numéro, départs et tarifs (`edition_departs`), retrait des dossards (`edition_retraits`),
    lien d'inscription Protiming (`inscription_url` : tant qu'il est vide, le site affiche
    « Inscriptions bientôt »).
  - `GET /api/editions` : les éditions passées, avec résultats, albums photos et vidéos
    (`edition_groupes`, `edition_liens`).
- **Dans le code** (`frontend/src/pages`, `frontend/src/data`) : les textes de présentation
  (la course, le parcours, I Run for Chimps, etc.) et les liens fixes (règlement, fiche descriptive).

Contenu initial : `backend/migrations/0002_seed.sql`, repris de l'ancien site. Les horaires et
tarifs de l'édition 2027 sont ceux de 2026 (`horaires_reference = 2026`), affichés comme tels.

### Préparer une nouvelle édition

```sql
-- l'édition qui vient de se courir passe automatiquement dans les archives
INSERT INTO editions (annee, numero, date_course, texte, horaires_reference, option_chimps)
VALUES (2028, 23, '2028-06-11', '', 2027, '+18 €');
-- puis ses départs / retraits (copier ceux de l'année précédente et ajuster),
-- et le lien Protiming dès l'ouverture des inscriptions :
UPDATE editions SET inscription_url = 'https://protiming.fr/Runnings/detail/XXXX' WHERE annee = 2028;
```

Après la course : `UPDATE editions SET resultats_url = …` et ajouter groupes et liens
(albums, vidéos) dans `edition_groupes` / `edition_liens`.

## Développement local

Comme pour SAM Paris 12, le développement se fait **sans Docker** (Docker est réservé au
déploiement NAS). Il faut un serveur MySQL local (`localhost:3306`) avec une base et un
utilisateur dédiés :

```sql
CREATE DATABASE IF NOT EXISTS foulees12db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'Foulees12Admin'@'localhost' IDENTIFIED BY '...';
GRANT ALL PRIVILEGES ON foulees12db.* TO 'Foulees12Admin'@'localhost';
FLUSH PRIVILEGES;
```

Renseigner ces identifiants dans `backend/.env` (non versionné : `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, voir `internal/config/config.go`), puis :

```bash
cd backend
go run ./cmd/migrate   # crée les tables + contenu initial (idempotent)
go run ./cmd/api        # démarre l'API sur :8080
```

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend appelle `http://localhost:8080/api` (voir `frontend/.env.local`, non versionné).

## Déploiement (NAS)

Copier `.env.example` en `.env` et renseigner les identifiants de la base (à créer dans
`bdd-mysql`, comme ci-dessus mais avec `'%'` comme hôte), puis
`docker compose up -d --build`. Le frontend écoute sur le port **8096**, l'API (debug) sur
**8095** ; nginx du frontend renvoie `/api/` vers le backend en interne.

Migrations : copier `backend/migrations/*.sql` dans `bdd-mysql` et les appliquer dans l'ordre
(même procédure que pour SAM Paris 12).

`_ancien/` contient une copie du contenu de l'ancien site (articles et images d'origine) ;
il n'est ni versionné ni déployé.
