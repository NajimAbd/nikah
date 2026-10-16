// Nikah — contestation d'une sanction (lien reçu par e-mail)
(function () {
  "use strict";
  var URL = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-contest";
  var jeton = (new URLSearchParams(window.location.search)).get("t") || "";
  var form = document.getElementById("formContest");
  var champ = document.getElementById("champTexte");
  var err = document.getElementById("messageErreur");
  var fin = document.getElementById("messageFin");
  var bouton = document.getElementById("btnEnvoyer");
  var chargement = document.getElementById("chargement");

  function terminer(texte) { chargement.style.display = "none"; form.style.display = "none"; fin.textContent = texte; fin.style.display = "block"; }
  function erreur(t) { err.textContent = t; err.style.display = t ? "block" : "none"; }
  function appel(corps) {
    return fetch(URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) }).then(function (r) { return r.json(); });
  }
  var DEJA = { contestee: "Votre contestation a déjà été transmise. La Commission disciplinaire l'examine et vous répondra par e-mail.", maintenue: "Cette décision a été réexaminée et maintenue par la Commission disciplinaire.", annulee: "Cette décision a été annulée par la Commission disciplinaire." };

  if (!/^[a-f0-9]{64}$/.test(jeton)) { terminer("Ce lien n'est pas valide."); return; }

  appel({ token: jeton, action: "info" }).then(function (r) {
    if (!r || !r.success) { terminer("Ce lien n'est pas valide."); return; }
    if (r.statut !== "active") { terminer(DEJA[r.statut] || "Cette décision ne peut plus être contestée."); return; }
    document.getElementById("titre").textContent = "Contester : " + String(r.libelle).toLowerCase() + (r.jours ? " de " + r.jours + " jours" : "");
    document.getElementById("resume").textContent = "Décision du " + r.date + ".";
    chargement.style.display = "none";
    form.style.display = "";
    champ.focus();
  }).catch(function () { chargement.textContent = "Connexion impossible pour le moment. Rechargez la page dans un instant."; });

  champ.addEventListener("input", function () { erreur(""); champ.classList.remove("invalide"); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = champ.value.trim();
    if (t.length < 10) { champ.classList.add("invalide"); erreur("Merci d'écrire une explication d'au moins 10 caractères."); return; }
    bouton.disabled = true; bouton.textContent = "Envoi…";
    appel({ token: jeton, action: "submit", texte: t }).then(function (r) {
      if (r && r.success) { terminer("Votre contestation a bien été transmise à la Commission disciplinaire. Elle relira la conversation et vous répondra par e-mail."); return; }
      if (r && r.error === "deja_traite") { terminer(DEJA[r.statut] || "Cette décision ne peut plus être contestée."); return; }
      bouton.disabled = false; bouton.textContent = "Envoyer ma contestation";
      erreur("L'envoi n'a pas abouti. Merci de réessayer dans un instant.");
    }).catch(function () { bouton.disabled = false; bouton.textContent = "Envoyer ma contestation"; erreur("Connexion impossible pour le moment."); });
  });
})();
