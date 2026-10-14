// Nikah — bandeau de consentement (cookies et données). Choix gardé dans le navigateur.
(function () {
  var CLE = "nikah_consentement_v1";

  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)); } catch (e) { return null; }
  }
  function ecrire(stats) {
    var valeur = { necessaires: true, statistiques: !!stats, date: new Date().toISOString() };
    try { localStorage.setItem(CLE, JSON.stringify(valeur)); } catch (e) { /* ignoré */ }
    fermer();
  }
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
      "<p>Nikah est une plateforme non lucrative. Nous n'affichons <strong>aucune publicité</strong> et ne vendons jamais vos données. " +
      "Nous utilisons uniquement ce qui est nécessaire au fonctionnement du site, et nous vous laissons choisir pour le reste.</p>" +
      "<p class='cmp-info'>Vos informations personnelles restent confidentielles : elles ne sont visibles que par les membres autorisés, et votre photo n'est montrée qu'après vérification de votre identité.</p>" +
      "<div id='cmpDetail' style='display:" + (detail ? "block" : "none") + ";'>" +
      "<label class='cmp-ligne'><span><strong>Fonctionnement du site</strong><br><small>Mémoriser vos réponses pendant l'inscription et votre choix ici. Toujours actif.</small></span><input type='checkbox' checked disabled></label>" +
      "<label class='cmp-ligne'><span><strong>Statistiques anonymes</strong><br><small>Comprendre comment le site est utilisé pour l'améliorer. Aucune donnée n'est collectée pour l'instant.</small></span><input type='checkbox' id='cmpStats'></label>" +
      "</div>" +
      "<div class='cmp-actions'>" +
      "<button class='btn btn-primary' id='cmpTout'>Tout accepter</button>" +
      "<button class='btn btn-outline' id='cmpRefus'>Tout refuser</button>" +
      "<button class='btn btn-ghost' id='cmpPerso'>" + (detail ? "Enregistrer mes choix" : "Personnaliser") + "</button>" +
      "</div>" +
      "<p class='cmp-lien'><a href='confidentialite.html'>Politique de confidentialité</a></p>" +
      "</div>";
    document.body.appendChild(fond);
    document.body.classList.add("cmp-ouvert");

    document.getElementById("cmpTout").onclick = function () { ecrire(true); };
    document.getElementById("cmpRefus").onclick = function () { ecrire(false); };
    document.getElementById("cmpPerso").onclick = function () {
      if (!detail) { afficher(true); return; }
      ecrire(document.getElementById("cmpStats").checked);
    };
  }

  function demarrer() {
    if (!lire()) afficher(false);
    var liens = document.querySelectorAll("[data-cookies]");
    for (var i = 0; i < liens.length; i++) {
      liens[i].addEventListener("click", function (e) { e.preventDefault(); afficher(true); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
