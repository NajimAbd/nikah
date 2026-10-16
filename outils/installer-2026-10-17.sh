#!/bin/bash
# Nikah — installation du 17.10.2026 : mon compte (mot de passe, suppression), alerte de connexion admin, messagerie (compte supprimé)
B=https://raw.githubusercontent.com/NajimAbd/nikah/main
# Le mot de passe MySQL est donné dans la commande (variable P), jamais écrit dans ce fichier
DB="docker exec -i mysql_crm_new mysql -u root -p$P nikah_db"
echo "== Base de données"
if [ "$($DB -N -e "SHOW COLUMNS FROM members LIKE 'deleted_at'" 2>/dev/null | wc -l)" = "0" ]; then
  curl -fsSL "$B/sql/2026-10-17-migration-15.sql" | $DB 2>&1 | grep -v Warning
fi
echo "== Workflows"
for f in nikah-account-2026-10-17 nikah-admin-login-2026-10-14 nikah-messages-2026-10-15; do
  curl -fsSL "$B/n8n/$f.json?$(date +%s)" -o /tmp/$f.json && docker cp /tmp/$f.json root-n8n-1:/tmp/$f.json && docker exec root-n8n-1 n8n import:workflow --input=/tmp/$f.json 2>&1 | tail -1
done
for id in NikahAccount001 NikahAdminLogin001 NikahMessages001; do docker exec root-n8n-1 n8n publish:workflow --id=$id 2>&1 | tail -1; done
docker restart root-n8n-1 >/dev/null && echo "== Redémarrage de n8n (30 secondes)" && sleep 30
echo "== Vérification"
C=$($DB -N -e "SHOW COLUMNS FROM members LIKE 'deleted_at'" 2>/dev/null | wc -l)
R=$(curl -s -X POST https://n8n.srv936251.hstgr.cloud/webhook/nikah-account -H 'Content-Type: application/json' -d "{\"action\":\"password\",\"token\":\"$(printf 'a%.0s' $(seq 64))\",\"actuel\":\"x\",\"nouveau\":\"Essai!12345\"}")
A=$(docker exec root-n8n-1 n8n export:workflow --id=NikahAdminLogin001 2>/dev/null | grep -c "Mail alerte")
M=$(docker exec root-n8n-1 n8n export:workflow --id=NikahMessages001 2>/dev/null | grep -c "ostatut")
[ "$C" = "1" ] && echo "Base : OK" || echo "Base : ERREUR"
echo "$R" | grep -q session_invalide && echo "Mon compte : OK" || echo "Mon compte : ERREUR ($R)"
[ "$A" -gt 0 ] && echo "Alerte admin : OK" || echo "Alerte admin : ERREUR"
[ "$M" -gt 0 ] && echo "Messagerie : OK" || echo "Messagerie : ERREUR"
