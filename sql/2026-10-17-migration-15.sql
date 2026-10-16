-- Migration 15 : suppression de compte par le membre (le profil est effacé, les conversations restent dans l'archive 2 ans)
USE nikah_db;
ALTER TABLE members ADD COLUMN deleted_at DATETIME NULL;
