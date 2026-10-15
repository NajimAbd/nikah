-- Migration 7 : nom d'affichage et couleur du cercle (comptes de test sans photo)
USE nikah_db;
ALTER TABLE members
  ADD COLUMN display_name VARCHAR(50) NULL,
  ADD COLUMN avatar_color VARCHAR(10) NULL;
