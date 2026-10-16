# Génère n8n/nikah-account-2026-10-17.json (changer son mot de passe, supprimer son compte)
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED_SQL = {"mySql": {"id": "gcGQgiKQ83lHOaak", "name": "MySQL account 2"}}
CRED_SMTP = {"smtp": {"id": "aZdlgWWAq11USGu7", "name": "SMTP account"}}
HEAD = {"responseHeaders": {"entries": [{"name": "Content-Type", "value": "application/json"}, {"name": "Access-Control-Allow-Origin", "value": "*"}]}}

PREPARE = r"""
const b = $input.first().json.body || {};
const action = String(b.action || '');
const token = String(b.token || '');
if (!/^[a-f0-9]{64}$/.test(token)) return [{ json: { ok: false, error: 'session_invalide' } }];
if (['password', 'delete', 'criteria'].indexOf(action) === -1) return [{ json: { ok: false, error: 'requete_invalide' } }];
if (action === 'criteria') {
  const min = parseInt(b.age_min, 10), max = parseInt(b.age_max, 10);
  if (!(min >= 18 && max >= min && max <= 99)) return [{ json: { ok: false, error: 'tranche_age_invalide' } }];
}
const actuel = String(b.actuel || '');
if (action !== 'criteria' && (!actuel || actuel.length > 200)) return [{ json: { ok: false, error: 'mot_de_passe_incorrect' } }];
if (action === 'password') {
  const nouveau = String(b.nouveau || '');
  if (nouveau.length < 10 || nouveau.length > 200 || !/[^A-Za-z0-9]/.test(nouveau)) return [{ json: { ok: false, error: 'mot_de_passe_faible' } }];
  if (nouveau === actuel) return [{ json: { ok: false, error: 'mot_de_passe_identique' } }];
}
const q0 = "SELECT m.id, m.email, m.display_name, m.password_hash, (m.locked_until IS NOT NULL AND m.locked_until > NOW()) AS locked FROM (SELECT 1 AS x) d LEFT JOIN members m ON m.session_hash=SHA2('" + token + "',256) AND m.session_expires > NOW() AND m.status='actif'";
return [{ json: { ok: true, action, q0 } }];
"""

VERIFIER = r"""
const crypto = require('crypto');
const b = $('Webhook').first().json.body || {};
const action = $('Prepare').first().json.action;
const row = $input.first().json;
const S = 'SELECT 1';
const nope = (error, q) => [{ json: { ok: false, error, q1: q || S } }];
if (row.id === null || row.id === undefined) return nope('session_invalide');
const id = parseInt(row.id, 10);
// Critères de recherche : pas besoin du mot de passe (la session suffit), pas d'e-mail
if (action === 'criteria') {
  const min = parseInt(b.age_min, 10), max = parseInt(b.age_max, 10);
  return [{ json: { ok: true, email: '', sujet: '', texte: '', min, max,
    q1: 'UPDATE search_preferences SET age_min=' + min + ', age_max=' + max + ' WHERE member_id=' + id,
    q2: S, q3: S, q4: S, q5: S, q6: S } }];
}
if (Number(row.locked) === 1) return nope('compte_bloque');
const parts = String(row.password_hash).split(':');
const calc = crypto.pbkdf2Sync(String(b.actuel || ''), parts[2], parseInt(parts[1], 10), 32, 'sha256');
const expected = Buffer.from(parts[3] || '', 'hex');
const same = calc.length === expected.length && crypto.timingSafeEqual(calc, expected);
if (!same) return nope('mot_de_passe_incorrect', 'UPDATE members SET login_failures=login_failures+1, locked_until=IF(login_failures>=5, DATE_ADD(NOW(), INTERVAL 15 MINUTE), locked_until) WHERE id=' + id);
const nom = row.display_name ? ' ' + row.display_name : '';
const fin = "\n\nQue Allah facilite votre chemin vers un mariage béni.\n\nNikah — mariageislamique.ch\n(Message automatique, merci de ne pas y répondre. Pour nous écrire : https://mariageislamique.ch/contact.html)";
if (action === 'password') {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(b.nouveau), salt, 100000, 32, 'sha256').toString('hex');
  return [{ json: { ok: true, email: row.email,
    sujet: 'Nikah — votre mot de passe a été modifié',
    texte: 'Assalamou alaykoum' + nom + ',\n\nLe mot de passe de votre compte Nikah vient d\'être modifié.\n\nSi c\'est bien vous, vous n\'avez rien à faire.\n\nSi ce n\'est pas vous, choisissez tout de suite un nouveau mot de passe ici :\nhttps://mariageislamique.ch/oubli.html\npuis prévenez-nous depuis la page Contact.' + fin,
    q1: "UPDATE members SET password_hash='pbkdf2:100000:" + salt + ":" + hash + "', login_failures=0, locked_until=NULL, reset_hash=NULL, reset_expires=NULL WHERE id=" + id,
    q2: S, q3: S, q4: S, q5: S, q6: S } }];
}
// Suppression : les données du profil sont effacées ; les conversations restent dans l'archive sécurisée (2 ans, voir la politique de confidentialité)
return [{ json: { ok: true, email: row.email,
  sujet: 'Nikah — votre compte a été supprimé',
  texte: 'Assalamou alaykoum' + nom + ',\n\nVotre compte Nikah a bien été supprimé, à votre demande.\n\nVotre profil, vos photos, vos documents et vos critères de recherche ont été effacés. Vous n\'apparaissez plus dans les recherches et plus personne ne peut vous écrire.\n\nComme prévu par notre politique de confidentialité, vos conversations sont conservées dans une archive sécurisée pendant deux ans, uniquement pour la protection des membres (signalement, litige ou demande d\'une autorité), puis supprimées.\n\nSi vous n\'êtes pas à l\'origine de cette suppression, écrivez-nous rapidement depuis la page Contact.' + fin,
  q1: 'DELETE FROM member_photos WHERE member_id=' + id,
  q2: 'DELETE FROM member_documents WHERE member_id=' + id,
  q3: 'DELETE FROM practice_priorities WHERE member_id=' + id,
  q4: 'DELETE FROM search_preferences WHERE member_id=' + id,
  q5: 'DELETE FROM profiles WHERE member_id=' + id,
  q6: "UPDATE members SET status='supprime', deleted_at=NOW(), email=CONCAT('supprime-', id, '@supprime.invalid'), password_hash='supprime', session_hash=NULL, session_expires=NULL, reset_hash=NULL, reset_expires=NULL, identity_verified=0 WHERE id=" + id } }];
"""

def ifnode(name, expr, x, y):
    return {"parameters": {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"id": "c1", "leftValue": expr, "rightValue": True, "operator": {"type": "boolean", "operation": "true", "singleValue": True}}], "combinator": "and"}, "options": {}}, "name": name, "type": "n8n-nodes-base.if", "typeVersion": 2, "position": [x, y]}
def sql(name, q, x, y):
    return {"parameters": {"operation": "executeQuery", "query": q, "options": {}}, "name": name, "type": "n8n-nodes-base.mySql", "typeVersion": 2.4, "position": [x, y], "credentials": CRED_SQL, "alwaysOutputData": True}
def rep(name, body, x, y):
    return {"parameters": {"respondWith": "text", "responseBody": body, "options": HEAD}, "name": name, "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1.1, "position": [x, y]}
def code(name, js, x, y):
    return {"parameters": {"jsCode": js.strip()}, "name": name, "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [x, y]}

nodes = [
    {"parameters": {"httpMethod": "POST", "path": "nikah-account", "responseMode": "responseNode", "options": {"allowedOrigins": "*"}}, "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 300], "webhookId": "nikah-account-0001"},
    code("Prepare", PREPARE, 220, 300),
    ifnode("Donnees valides", "={{ $json.ok === true }}", 440, 300),
    rep("Reponse invalide", "={{ JSON.stringify({success:false,error:$json.error}) }}", 660, 460),
    sql("Lire membre", "={{ $json.q0 }}", 660, 200),
    code("Verifier", VERIFIER, 880, 200),
    ifnode("Verification ok", "={{ $json.ok === true }}", 1100, 200),
    sql("Noter echec", "={{ $('Verifier').first().json.q1 }}", 1320, 400),
    rep("Reponse echec", "={{ JSON.stringify({success:false,error:$('Verifier').first().json.error}) }}", 1540, 400),
]
x = 1320
for i in range(1, 7):
    nodes.append(sql("Ecrire %d" % i, "={{ $('Verifier').first().json.q%d }}" % i, x, 100)); x += 200
nodes.append({"parameters": {"fromEmail": "Nikah <contact@roqyasuisse.com>", "toEmail": "={{ $('Verifier').first().json.email }}", "subject": "={{ $('Verifier').first().json.sujet }}", "emailFormat": "text", "text": "={{ $('Verifier').first().json.texte }}", "options": {"appendAttribution": False}}, "name": "Envoyer mail", "type": "n8n-nodes-base.emailSend", "typeVersion": 2.1, "position": [x, 100], "credentials": CRED_SMTP, "continueOnFail": True, "alwaysOutputData": True})
nodes.append(ifnode("Mail a envoyer", "={{ !!$('Verifier').first().json.sujet }}", x, 300))
nodes.append(rep("Reponse ok", "={{ JSON.stringify({success:true,action:$('Prepare').first().json.action}) }}", x + 220, 100))

C = lambda *dst: {"main": [[{"node": d, "type": "main", "index": 0}] for d in dst]}
conn = {
    "Webhook": C("Prepare"), "Prepare": C("Donnees valides"),
    "Donnees valides": C("Lire membre", "Reponse invalide"),
    "Lire membre": C("Verifier"), "Verifier": C("Verification ok"),
    "Verification ok": C("Ecrire 1", "Noter echec"),
    "Noter echec": C("Reponse echec"),
    "Ecrire 1": C("Ecrire 2"), "Ecrire 2": C("Ecrire 3"), "Ecrire 3": C("Ecrire 4"), "Ecrire 4": C("Ecrire 5"), "Ecrire 5": C("Ecrire 6"),
    "Ecrire 6": C("Mail a envoyer"), "Mail a envoyer": C("Envoyer mail", "Reponse ok"), "Envoyer mail": C("Reponse ok"),
}
wf = [{"id": "NikahAccount001", "name": "Nikah Account", "nodes": nodes, "connections": conn, "active": False, "settings": {"executionOrder": "v1"}}]
json.dump(wf, open(os.path.join(ROOT, "n8n", "nikah-account-2026-10-17.json"), "w"), ensure_ascii=False, indent=2)
print("ok")
