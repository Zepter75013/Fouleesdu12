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

Le site est servi par le NAS QNAP (même machine que SAM Paris 12, Finance et Record-manager)
sous le nom de domaine **https://foulees.juliotte-app.fr** (domaine `juliotte-app.fr` chez OVH).

1. **DNS (OVH)** — zone `juliotte-app.fr` : entrée `CNAME` `foulees` →
   `samparis12-qnap.mycloudnas.com.` (suit automatiquement l'IP de la box, comme les noms
   myQNAPcloud). Attendre la propagation : `dig +short foulees.juliotte-app.fr` doit renvoyer
   l'IP de la box.
2. **Fichiers** — depuis le Mac :

   ```bash
   rsync -avz --delete -e "ssh -p 2222" --exclude='.env' --exclude='.env.*' --exclude='frontend/node_modules/' --exclude='frontend/dist/' --exclude='.git/' --exclude='.claude/' --exclude='/_ancien/' --exclude='/videos/' --exclude='.DS_Store' ~/Documents/Developpement/Fouléesdu12/ Laurent@192.168.1.79:/share/CACHEDEV1_DATA/Container/Fouleesdu12/
   ```

3. **Base** — créer la base et l'utilisateur dans `bdd-mysql` (hôte `'%'`), puis appliquer
   `backend/migrations/0001_init.sql` et `0002_seed.sql` (copie dans le conteneur avec
   `docker cp`, puis `source` dans le client mysql).
4. **`.env`** sur le NAS (`/share/CACHEDEV1_DATA/Container/Fouleesdu12/.env`) à partir de
   `.env.example`, puis `docker compose up -d --build` dans ce dossier (`bdd-mysql` n'est pas un
   service de ce compose : il n'est pas touché). Le site écoute sur le port **8096**.
5. **Proxy inverse + HTTPS** — dans l'outil qui sert déjà les trois noms myQNAPcloud : règle
   `foulees.juliotte-app.fr` (HTTPS 443) → `http://localhost:8096`, avec un certificat
   Let's Encrypt pour `foulees.juliotte-app.fr` et la redirection HTTP → HTTPS.

`_ancien/` contient une copie du contenu de l'ancien site (articles et images d'origine) ;
il n'est ni versionné ni déployé.
