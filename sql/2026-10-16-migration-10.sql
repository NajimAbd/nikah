-- Migration 10 : récupération du mot de passe administrateur par e-mail (lien valable 5 minutes)
USE nikah_db;
ALTER TABLE admin_access ADD COLUMN reset_hash CHAR(64) NULL, ADD COLUMN reset_expires DATETIME NULL;
