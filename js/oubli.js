// Nikah — demande de lien de réinitialisation du mot de passe
(function () {
  "use strict";
  var URL_OUBLI = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-forgot";
  var form = document.getElementById("formOubli");
  var champ = document.getElementById("champEmail");
  var err = document.getElementById("messageErreur");
  var ok = document.getElementById("messageOk");
  var bouton = document.getElementById("btnEnvoyer");

  function montrer(el, texte) { el.textContent = texte; el.style.display = texte ? "block" : "none"; }
  champ.addEventListener("input", function () { champ.classList.remove("invalide"); montrer(err, ""); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    montrer(err, ""); montrer(ok, "");
    var email = champ.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      champ.classList.add("invalide");
      montrer(err, "Cette adresse e-mail ne semble pas valide.");
      return;
    }
    bouton.disabled = true; bouton.textContent = "Envoi…";
    fetch(URL_OUBLI, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          montrer(ok, "Si un profil existe avec cette adresse, un e-mail vient d'être envoyé. Pensez à vérifier vos courriers indésirables.");
          bouton.textContent = "Lien envoyé";
        } else {
          bouton.disabled = false; bouton.textContent = "Envoyer le lien";
          montrer(err, "Une erreur est survenue. Merci de réessayer dans un instant.");
        }
      })
      .catch(function () {
        bouton.disabled = false; bouton.textContent = "Envoyer le lien";
        montrer(err, "Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.");
      });
  });
})();
