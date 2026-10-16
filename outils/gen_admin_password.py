# Génère n8n/nikah-admin-password-2026-10-17.json (l'administrateur change son mot de passe depuis le panneau)
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED_SQL = {"mySql": {"id": "gcGQgiKQ83lHOaak", "name": "MySQL account 2"}}
CRED_SMTP = {"smtp": {"id": "aZdlgWWAq11USGu7", "name": "SMTP account"}}
HEAD = {"responseHeaders": {"entries": [{"name": "Content-Type", "value": "application/json"}, {"name": "Access-Control-Allow-Origin", "value": "*"}]}}

PREPARE = r"""
const b = $input.first().json.body || {};
const token = String(b.token || '');
if (!/^[a-f0-9]{64}$/.test(token)) return [{ json: { ok: false, error: 'session_invalide' } }];
const actuel = String(b.actuel || ''), nouveau = String(b.nouveau || '');
if (!actuel || actuel.length > 200) return [{ json: { ok: false, error: 'mot_de_passe_incorrect' } }];
if (nouveau.length < 10 || nouveau.length > 200 || !/[^A-Za-z0-9]/.test(nouveau)) return [{ json: { ok: false, error: 'mot_de_passe_faible' } }];
if (nouveau === actuel) return [{ json: { ok: false, error: 'mot_de_passe_identique' } }];
return [{ json: { ok: true, q0: "SELECT a.id, a.pass_hash, (a.locked_until IS NOT NULL AND a.locked_until > NOW()) AS locked FROM (SELECT 1 AS x) d LEFT JOIN admin_access a ON a.id=1 AND a.session_hash=SHA2('" + token + "',256) AND a.session_expires > NOW()" } }];
"""

VERIFIER = r"""
const crypto = require('crypto');
const b = $('Webhook').first().json.body || {};
const row = $input.first().json;
const nope = (error, q) => [{ json: { ok: false, error, q: q || 'SELECT 1' } }];
if (row.id === null || row.id === undefined) return nope('session_invalide');
if (Number(row.locked) === 1) return nope('compte_bloque');
const parts = String(row.pass_hash).split(':');
const calc = crypto.pbkdf2Sync(String(b.actuel || ''), parts[2], parseInt(parts[1], 10), 32, 'sha256');
const expected = Buffer.from(parts[3] || '', 'hex');
const same = calc.length === expected.length && crypto.timingSafeEqual(calc, expected);
if (!same) return nope('mot_de_passe_incorrect', "UPDATE admin_access SET login_failures=login_failures+1, locked_until=IF(login_failures>=5, DATE_ADD(NOW(), INTERVAL 15 MINUTE), locked_until) WHERE id=1");
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(String(b.nouveau), salt, 100000, 32, 'sha256').toString('hex');
const quand = new Date().toLocaleString('fr-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
return [{ json: { ok: true, quand, q: "UPDATE admin_access SET pass_hash='pbkdf2:100000:" + salt + ":" + hash + "', login_failures=0, locked_until=NULL, reset_hash=NULL, reset_expires=NULL WHERE id=1" } }];
"""

def ifnode(name, expr, x, y):
    return {"parameters": {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"id": "c1", "leftValue": expr, "rightValue": True, "operator": {"type": "boolean", "operation": "true", "singleValue": True}}], "combinator": "and"}, "options": {}}, "name": name, "type": "n8n-nodes-base.if", "typeVersion": 2, "position": [x, y]}
def sql(name, q, x, y):
    return {"parameters": {"operation": "executeQuery", "query": q, "options": {}}, "name": name, "type": "n8n-nodes-base.mySql", "typeVersion": 2.4, "position": [x, y], "credentials": CRED_SQL, "alwaysOutputData": True}
def rep(name, body, x, y):
    return {"parameters": {"respondWith": "text", "responseBody": body, "options": HEAD}, "name": name, "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1.1, "position": [x, y]}
def code(name, js, x, y):
    return {"parameters": {"jsCode": js.strip()}, "name": name, "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [x, y]}

TEXTE = "={{ 'Bonjour,\\n\\nLe mot de passe administrateur de Nikah vient d\\'être modifié depuis le panneau d\\'administration (' + $('Verifier').first().json.quand + ').\\n\\nSi c\\'est bien vous, vous n\\'avez rien à faire.\\nSi ce n\\'est pas vous, utilisez tout de suite « Mot de passe oublié » sur la page d\\'administration.\\n\\nNikah — sécurité' }}"
nodes = [
    {"parameters": {"httpMethod": "POST", "path": "nikah-admin-password", "responseMode": "responseNode", "options": {"allowedOrigins": "*"}}, "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 300], "webhookId": "nikah-admin-password-0001"},
    code("Prepare", PREPARE, 220, 300),
    ifnode("Donnees valides", "={{ $json.ok === true }}", 440, 300),
    rep("Reponse invalide", "={{ JSON.stringify({success:false,error:$json.error}) }}", 660, 460),
    sql("Lire admin", "={{ $json.q0 }}", 660, 200),
    code("Verifier", VERIFIER, 880, 200),
    ifnode("Verification ok", "={{ $json.ok === true }}", 1100, 200),
    sql("Changer", "={{ $('Verifier').first().json.q }}", 1320, 100),
    {"parameters": {"fromEmail": "Nikah <contact@roqyasuisse.com>", "toEmail": "info.najim1@gmail.com", "subject": "Nikah — mot de passe administrateur modifié", "emailFormat": "text", "text": TEXTE, "options": {"appendAttribution": False}}, "name": "Envoyer mail", "type": "n8n-nodes-base.emailSend", "typeVersion": 2.1, "position": [1540, 100], "credentials": CRED_SMTP, "continueOnFail": True, "alwaysOutputData": True},
    rep("Reponse ok", "={{ JSON.stringify({success:true}) }}", 1760, 100),
    sql("Noter echec", "={{ $('Verifier').first().json.q }}", 1320, 400),
    rep("Reponse echec", "={{ JSON.stringify({success:false,error:$('Verifier').first().json.error}) }}", 1540, 400),
]
C = lambda *dst: {"main": [[{"node": d, "type": "main", "index": 0}] for d in dst]}
conn = {"Webhook": C("Prepare"), "Prepare": C("Donnees valides"), "Donnees valides": C("Lire admin", "Reponse invalide"),
        "Lire admin": C("Verifier"), "Verifier": C("Verification ok"), "Verification ok": C("Changer", "Noter echec"),
        "Changer": C("Envoyer mail"), "Envoyer mail": C("Reponse ok"), "Noter echec": C("Reponse echec")}
wf = [{"id": "NikahAdminPassword001", "name": "Nikah Admin Password", "nodes": nodes, "connections": conn, "active": False, "settings": {"executionOrder": "v1"}}]
json.dump(wf, open(os.path.join(ROOT, "n8n", "nikah-admin-password-2026-10-17.json"), "w"), ensure_ascii=False, indent=2)
print("ok")
