-- Migration 1 : nouveau questionnaire (délai 1-6 mois, question santé)
USE nikah_db;
UPDATE profiles SET marriage_timeframe=NULL WHERE marriage_timeframe NOT IN ('2-4_mois','a_convenir');
ALTER TABLE profiles
  MODIFY marriage_timeframe ENUM('1-2_mois','2-4_mois','4-6_mois','a_convenir') NULL,
  ADD COLUMN health_obstacle ENUM('non','oui','plus_tard') NULL;
