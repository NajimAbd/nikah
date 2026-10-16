// Nikah — bandeau de consentement (cookies et données). Choix gardé dans le navigateur.
(function () {
  var CLE = "nikah_consentement_v1";

  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)); } catch (e) { return null; }
  }
  function ecrire(stats) {
    marquerVu();
    var valeur = { necessaires: true, statistiques: !!stats, date: new Date().toISOString() };
    try { localStorage.setItem(CLE, JSON.stringify(valeur)); } catch (e) { /* ignoré */ }
    fermer();
  }
  var AUTO = false;
  var VU = "nikah_consentement_vu";
  function marquerVu() { try { sessionStorage.setItem(VU, "1"); } catch (e) { /* ignoré */ } }
  function dejaVu() { try { return sessionStorage.getItem(VU) === "1"; } catch (e) { return false; } }

  function fermer() {
    var f = document.getElementById("cmpFond");
    if (f) f.parentNode.removeChild(f);
    document.body.classList.remove("cmp-ouvert");
  }

  function afficher(detail) {
    fermer();
    var fond = document.createElement("div");
    fond.id = "cmpFond";
    fond.className = "cmp-fond";
    fond.innerHTML =
      "<div class='cmp-boite' role='dialog' aria-modal='true' aria-labelledby='cmpTitre'>" +
      "<h2 id='cmpTitre'>Votre vie privée compte pour nous</h2>" +
      "<p>Avant de commencer votre inscription, voici ce que vous devez savoir. Nikah est une plateforme de mariage sérieuse. Nous n'affichons <strong>aucune publicité</strong> et ne vendons jamais vos données. " +
      "Nous utilisons uniquement ce qui est nécessaire au fonctionnement du site, et nous vous laissons choisir pour le reste.</p>" +
      "<div class='cmp-info'><strong>Vos informations sont protégées :</strong><ul>" +
      "<li>elles sont conservées de façon sécurisée et ne sont jamais vendues ni partagées à des fins publicitaires ;</li>" +
      "<li>votre photo n'est visible des autres membres qu'après la vérification de votre identité ;</li>" +
      "<li>tous les échanges passent exclusivement par la plateforme ;</li>" +
      "<li>vous pouvez demander la suppression de votre profil et de vos données à tout moment.</li></ul></div>" +
      "<div id='cmpDetail' style='display:" + (detail ? "block" : "none") + ";'>" +
      "<label class='cmp-ligne'><span><strong>Fonctionnement du site</strong><br><small>Mémoriser vos réponses pendant l'inscription et votre choix ici. Toujours actif.</small></span><input type='checkbox' checked disabled></label>" +
      "<label class='cmp-ligne'><span><strong>Statistiques anonymes</strong><br><small>Comprendre comment le site est utilisé pour l'améliorer. Aucune donnée n'est collectée pour l'instant.</small></span><input type='checkbox' id='cmpStats'></label>" +
      "</div>" +
      "<div class='cmp-actions'>" +
      "<button class='btn btn-primary' id='cmpTout'>" + (AUTO ? "J'accepte et je continue" : "Tout accepter") + "</button>" +
      "<button class='btn btn-outline' id='cmpRefus'>" + (AUTO ? "Je refuse et je retourne à l'accueil" : "Tout refuser") + "</button>" +
      "<button class='btn btn-ghost' id='cmpPerso'>" + (detail ? (AUTO ? "Enregistrer mes choix et continuer" : "Enregistrer mes choix") : "Personnaliser") + "</button>" +
      "</div>" +
      "<p class='cmp-lien'><a href='confidentialite.html'>Politique de confidentialité</a></p>" +
      "</div>";
    document.body.appendChild(fond);
    document.body.classList.add("cmp-ouvert");

    document.getElementById("cmpTout").onclick = function () { ecrire(true); };
    document.getElementById("cmpRefus").onclick = function () {
      if (AUTO) { window.location.href = "index.html"; return; }
      ecrire(false);
    };
    document.getElementById("cmpPerso").onclick = function () {
      if (!detail) { afficher(true); return; }
      ecrire(document.getElementById("cmpStats").checked);
    };
  }

  function demarrer() {
    AUTO = document.body.hasAttribute("data-cmp-auto");
    if (AUTO && !dejaVu()) afficher(false);
    var liens = document.querySelectorAll("[data-cookies]");
    for (var i = 0; i < liens.length; i++) {
      liens[i].addEventListener("click", function (e) { e.preventDefault(); var a = AUTO; AUTO = false; afficher(true); AUTO = a; });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
