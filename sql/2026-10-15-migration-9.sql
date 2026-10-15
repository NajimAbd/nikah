-- Migration 9 : modération des messages (le premier message est contrôlé avant d'être transmis)
USE nikah_db;
ALTER TABLE conversations
  MODIFY status ENUM('moderation','demande','acceptee','refusee','rejetee') NOT NULL DEFAULT 'moderation';
