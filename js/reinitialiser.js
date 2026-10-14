// Nikah — choix d'un nouveau mot de passe (lien reçu par e-mail)
(function () {
  "use strict";
  var URL_RESET = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-reset";
  var jeton = (new URLSearchParams(window.location.search)).get("t") || "";
  var form = document.getElementById("formReset");
  var m1 = document.getElementById("champMdp"), m2 = document.getElementById("champMdp2");
  var err = document.getElementById("messageErreur");
  var bouton = document.getElementById("btnValider");

  var OEIL = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z'/><circle cx='12' cy='12' r='3'/></svg>";
  var OEIL_BARRE = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M17.94 17.94A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94'/><path d='M9.9 4.24A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19'/><path d='M14.12 14.12A3 3 0 1 1 9.88 9.88'/><line x1='1' y1='1' x2='23' y2='23'/></svg>";
  Array.prototype.forEach.call(document.querySelectorAll(".mdp-oeil"), function (b) {
    b.innerHTML = OEIL;
    b.addEventListener("click", function () {
      var c = document.getElementById(b.getAttribute("data-cible"));
      var visible = c.type === "text";
      c.type = visible ? "password" : "text";
      b.innerHTML = visible ? OEIL : OEIL_BARRE;
    });
  });

  function erreur(t, champs) {
    err.textContent = t; err.style.display = t ? "block" : "none";
    [m1, m2].forEach(function (c) { c.classList.remove("invalide"); });
    (champs || []).forEach(function (c) { c.classList.add("invalide"); });
  }
  [m1, m2].forEach(function (c) { c.addEventListener("input", function () { erreur(""); }); });

  if (!/^[a-f0-9]{64}$/.test(jeton)) {
    form.style.display = "none";
    erreur("Ce lien n'est pas valide. Demandez un nouveau lien depuis la page « Mot de passe oublié ».");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (m1.value.length < 10 || !/[^A-Za-z0-9]/.test(m1.value)) { erreur("Le mot de passe doit contenir au moins 10 caractères, dont un caractère spécial.", [m1]); return; }
    if (m1.value !== m2.value) { erreur("Les deux mots de passe ne sont pas identiques.", [m2]); return; }
    bouton.disabled = true; bouton.textContent = "Enregistrement…";
    fetch(URL_RESET, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton, password: m1.value }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          form.style.display = "none";
          document.getElementById("blocSucces").style.display = "block";
          return;
        }
        bouton.disabled = false; bouton.textContent = "Enregistrer";
        if (res && res.error === "lien_invalide") erreur("Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien depuis la page « Mot de passe oublié ».");
        else if (res && res.error === "mot_de_passe_faible") erreur("Le mot de passe doit contenir au moins 10 caractères, dont un caractère spécial.", [m1]);
        else erreur("Une erreur est survenue. Merci de réessayer dans un instant.");
      })
      .catch(function () {
        bouton.disabled = false; bouton.textContent = "Enregistrer";
        erreur("Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.");
      });
  });
})();
