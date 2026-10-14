-- Migration 6 : pièces de vérification d'identité (privées, supprimées dès la décision de l'administrateur)
USE nikah_db;
CREATE TABLE IF NOT EXISTS member_documents (
  member_id INT NOT NULL PRIMARY KEY,
  id_data MEDIUMBLOB NOT NULL,
  selfie_data MEDIUMBLOB NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.member_documents TO 'nikah_user'@'%';
