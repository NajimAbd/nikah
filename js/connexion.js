// Nikah — page de connexion
(function () {
  "use strict";
  var URL_CONNEXION = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-login";
  var CLE_JETON = "nikah_jeton";

  var form = document.getElementById("formConnexion");
  var champEmail = document.getElementById("champEmail");
  var champMdp = document.getElementById("champMotDePasse");
  var message = document.getElementById("messageErreur");
  var bouton = document.getElementById("btnConnexion");
  var oeil = document.getElementById("oeilMdp");

  var SVG_OEIL = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z'/><circle cx='12' cy='12' r='3'/></svg>";
  var SVG_OEIL_BARRE = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M17.94 17.94A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94'/><path d='M9.9 4.24A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19'/><path d='M14.12 14.12A3 3 0 1 1 9.88 9.88'/><line x1='1' y1='1' x2='23' y2='23'/></svg>";

  var MESSAGES = {
    identifiants_invalides: "Adresse e-mail ou mot de passe incorrect.",
    compte_bloque: "Trop de tentatives. Pour votre sécurité, réessayez dans 15 minutes."
  };

  function erreur(texte, champ) {
    message.textContent = texte;
    message.style.display = texte ? "block" : "none";
    if (champ) champ.classList.add("invalide");
  }
  function effacer() {
    champEmail.classList.remove("invalide");
    champMdp.classList.remove("invalide");
    erreur("");
  }

  oeil.innerHTML = SVG_OEIL;
  oeil.addEventListener("click", function () {
    var visible = champMdp.type === "text";
    champMdp.type = visible ? "password" : "text";
    oeil.innerHTML = visible ? SVG_OEIL : SVG_OEIL_BARRE;
    oeil.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe");
  });
  champEmail.addEventListener("input", effacer);
  champMdp.addEventListener("input", effacer);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    effacer();
    var email = champEmail.value.trim();
    var mdp = champMdp.value;
    if (!email) { erreur("Merci d'indiquer votre adresse e-mail.", champEmail); return; }
    if (!mdp) { erreur("Merci d'indiquer votre mot de passe.", champMdp); return; }

    bouton.disabled = true;
    bouton.textContent = "Connexion…";
    fetch(URL_CONNEXION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: mdp })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success && res.token) {
          try { localStorage.setItem(CLE_JETON, res.token); } catch (err) { /* ignoré */ }
          try { sessionStorage.setItem(CLE_JETON, res.token); } catch (err) { /* ignoré */ }
          window.location.href = "membre.html";
          return;
        }
        bouton.disabled = false;
        bouton.textContent = "Se connecter";
        erreur(MESSAGES[res && res.error] || "Une erreur est survenue. Merci de réessayer dans un instant.");
        if (res && res.error === "identifiants_invalides") { champEmail.classList.add("invalide"); champMdp.classList.add("invalide"); }
      })
      .catch(function () {
        bouton.disabled = false;
        bouton.textContent = "Se connecter";
        erreur("Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.");
      });
  });
})();
