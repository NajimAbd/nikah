#!/bin/bash
# Nikah — installation 17.10.2026 (2) : critères de recherche dans « Mon compte », mot de passe administrateur dans le panneau
B=https://raw.githubusercontent.com/NajimAbd/nikah/main
echo "== Workflows"
for f in nikah-account-2026-10-17 nikah-admin-password-2026-10-17; do
  curl -fsSL "$B/n8n/$f.json?$(date +%s)" -o /tmp/$f.json && docker cp /tmp/$f.json root-n8n-1:/tmp/$f.json && docker exec root-n8n-1 n8n import:workflow --input=/tmp/$f.json 2>&1 | tail -1
done
for id in NikahAccount001 NikahAdminPassword001; do docker exec root-n8n-1 n8n publish:workflow --id=$id 2>&1 | tail -1; done
docker restart root-n8n-1 >/dev/null && echo "== Redémarrage de n8n (30 secondes)" && sleep 30
echo "== Vérification"
T=$(printf 'a%.0s' $(seq 64))
R1=$(curl -s -X POST https://n8n.srv936251.hstgr.cloud/webhook/nikah-account -H 'Content-Type: application/json' -d "{\"action\":\"criteria\",\"token\":\"$T\",\"age_min\":25,\"age_max\":40}")
R2=$(curl -s -X POST https://n8n.srv936251.hstgr.cloud/webhook/nikah-admin-password -H 'Content-Type: application/json' -d "{\"token\":\"$T\",\"actuel\":\"x\",\"nouveau\":\"Essai#12345\"}")
echo "$R1" | grep -q session_invalide && echo "Critères de recherche : OK" || echo "Critères de recherche : ERREUR ($R1)"
echo "$R2" | grep -q session_invalide && echo "Mot de passe admin : OK" || echo "Mot de passe admin : ERREUR ($R2)"
