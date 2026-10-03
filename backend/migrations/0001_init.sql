-- Les accents doivent être lus en UTF-8 quel que soit le client mysql (celui de bdd-mysql est en latin1 par défaut).
SET NAMES utf8mb4;

-- Foulées du 12ème : éditions de la course (la plus récente est l'édition à venir),
-- avec ses départs et créneaux de retrait des dossards, et pour les éditions passées
-- les liens vers résultats, albums photos et vidéos, rangés par groupe.

CREATE TABLE IF NOT EXISTS editions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  annee INT NOT NULL,
  numero INT NULL,
  date_course DATE NULL,
  titre VARCHAR(255) NOT NULL DEFAULT '',
  texte TEXT NOT NULL,
  resultats_url VARCHAR(1024) NOT NULL DEFAULT '',
  inscription_url VARCHAR(1024) NOT NULL DEFAULT '',
  -- Année dont les horaires et tarifs sont repris, tant que ceux de l'édition ne sont pas confirmés.
  horaires_reference INT NULL,
  option_chimps VARCHAR(64) NOT NULL DEFAULT '',
  UNIQUE KEY uq_editions_annee (annee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS edition_departs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  ordre INT NOT NULL,
  heure VARCHAR(16) NOT NULL,
  course VARCHAR(64) NOT NULL,
  detail VARCHAR(255) NOT NULL DEFAULT '',
  prix VARCHAR(64) NOT NULL DEFAULT '',
  UNIQUE KEY uq_departs_ordre (edition_id, ordre),
  CONSTRAINT fk_departs_edition FOREIGN KEY (edition_id) REFERENCES editions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS edition_retraits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  ordre INT NOT NULL,
  jour VARCHAR(32) NOT NULL,
  horaire VARCHAR(64) NOT NULL,
  lieu VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_retraits_ordre (edition_id, ordre),
  CONSTRAINT fk_retraits_edition FOREIGN KEY (edition_id) REFERENCES editions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS edition_groupes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT NOT NULL,
  ordre INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_groupes_ordre (edition_id, ordre),
  CONSTRAINT fk_groupes_edition FOREIGN KEY (edition_id) REFERENCES editions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS edition_liens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupe_id INT NOT NULL,
  ordre INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(1024) NOT NULL,
  UNIQUE KEY uq_liens_ordre (groupe_id, ordre),
  CONSTRAINT fk_liens_groupe FOREIGN KEY (groupe_id) REFERENCES edition_groupes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
