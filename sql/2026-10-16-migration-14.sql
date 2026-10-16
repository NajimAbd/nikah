-- Migration 14 : messages soupçonnés retenus en attente d'approbation par l'administration
USE nikah_db;
ALTER TABLE messages
  ADD COLUMN moderation VARCHAR(20) NOT NULL DEFAULT 'ok',
  ADD COLUMN moderation_reason VARCHAR(40) NULL,
  ADD INDEX idx_moderation (moderation);
