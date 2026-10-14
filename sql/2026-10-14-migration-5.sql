-- Migration 5 : accès administrateur (un seul mot de passe, jamais écrit en clair)
USE nikah_db;
CREATE TABLE IF NOT EXISTS admin_access (
  id TINYINT NOT NULL PRIMARY KEY,
  pass_hash VARCHAR(255) NOT NULL,
  session_hash CHAR(64) NULL,
  session_expires DATETIME NULL,
  login_failures INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.admin_access TO 'nikah_user'@'%';
