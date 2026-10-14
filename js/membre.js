// Nikah — espace membre (profils de démonstration, filtrage strict)
(function () {
  "use strict";
  var URL_MOI = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-me";
  var CLE_JETON = "nikah_jeton";

  // Profils fictifs, uniquement pour tester l'affichage. "verifie" = identité vérifiée (photo visible).
  var DEMO = [
    { prenom: "Amina",   genre: "femme", age: 27, canton: "Vaud",     ville: "Lausanne",  croyance: "Sunnite", pratique: "Pratiquante",       situation: "Célibataire", enfants: "Oui, un jour",       delai: "2-4 mois",       verifie: true,  teinte: 150 },
    { prenom: "Yasmine", genre: "femme", age: 24, canton: "Genève",   ville: "Genève",    croyance: "Sunnite", pratique: "Très pratiquante",  situation: "Célibataire", enfants: "Oui",                delai: "1-2 mois",       verifie: true,  teinte: 28 },
    { prenom: "Khadija", genre: "femme", age: 31, canton: "Fribourg", ville: "Fribourg",  croyance: "Sunnite", pratique: "Pratiquante",       situation: "Divorcée",    enfants: "Oui",                delai: "À convenir",     verifie: false, teinte: 200 },
    { prenom: "Samira",  genre: "femme", age: 22, canton: "Neuchâtel",ville: "Neuchâtel", croyance: "Sunnite", pratique: "Pratiquante",       situation: "Célibataire", enfants: "Oui, un jour",       delai: "4-6 mois",       verifie: true,  teinte: 340 },
    { prenom: "Nadia",   genre: "femme", age: 36, canton: "Berne",    ville: "Berne",     croyance: "Soufie",  pratique: "Peu pratiquante",   situation: "Divorcée",    enfants: "Pas sûre",           delai: "À convenir",     verifie: true,  teinte: 95 },
    { prenom: "Lina",    genre: "femme", age: 29, canton: "Valais",   ville: "Sion",      croyance: "Sunnite", pratique: "Pratiquante",       situation: "Célibataire", enfants: "Oui",                delai: "2-4 mois",       verifie: true,  teinte: 260 },
    { prenom: "Meriem",  genre: "femme", age: 41, canton: "Zurich",   ville: "Zurich",    croyance: "Sunnite", pratique: "Pratiquante",       situation: "Veuve",       enfants: "Non",                delai: "À convenir",     verifie: true,  teinte: 15 },
    { prenom: "Hajar",   genre: "femme", age: 26, canton: "Bâle-Ville",ville: "Bâle",     croyance: "Sunnite", pratique: "Très pratiquante",  situation: "Célibataire", enfants: "Oui",                delai: "1-2 mois",       verifie: false, teinte: 310 },
    { prenom: "Karim",   genre: "homme", age: 30, canton: "Genève",   ville: "Genève",    croyance: "Sunnite", pratique: "Pratiquant",        situation: "Célibataire", enfants: "Oui",                delai: "2-4 mois",       verifie: true,  teinte: 210 },
    { prenom: "Yassine", genre: "homme", age: 27, canton: "Vaud",     ville: "Lausanne",  croyance: "Sunnite", pratique: "Très pratiquant",   situation: "Célibataire", enfants: "Oui, un jour",       delai: "4-6 mois",       verifie: true,  teinte: 170 },
    { prenom: "Omar",    genre: "homme", age: 34, canton: "Fribourg", ville: "Fribourg",  croyance: "Sunnite", pratique: "Pratiquant",        situation: "Divorcé",     enfants: "Oui",                delai: "À convenir",     verifie: true,  teinte: 40 },
    { prenom: "Bilal",   genre: "homme", age: 25, canton: "Vaud",     ville: "Yverdon-les-Bains", croyance: "Sunnite", pratique: "Pratiquant", situation: "Célibataire", enfants: "Oui",               delai: "1-2 mois",       verifie: false, teinte: 285 },
    { prenom: "Idriss",  genre: "homme", age: 38, canton: "Neuchâtel",ville: "La Chaux-de-Fonds", croyance: "Soufi", pratique: "Pratiquant", situation: "Célibataire", enfants: "Pas sûr",           delai: "À convenir",     verifie: true,  teinte: 120 },
    { prenom: "Walid",   genre: "homme", age: 29, canton: "Zurich",   ville: "Zurich",    croyance: "Sunnite", pratique: "Pratiquant",        situation: "Célibataire", enfants: "Oui",                delai: "2-4 mois",       verifie: true,  teinte: 330 },
    { prenom: "Hamza",   genre: "homme", age: 45, canton: "Berne",    ville: "Berne",     croyance: "Sunnite", pratique: "Peu pratiquant",    situation: "Veuf",        enfants: "Non",                delai: "À convenir",     verifie: true,  teinte: 60 }
  ];

  function echapper(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  // Silhouette générée (pas une vraie photo)
  function avatar(p) {
    var h = p.teinte;
    var fond1 = "hsl(" + h + ",32%,82%)", fond2 = "hsl(" + h + ",30%,68%)", corps = "hsl(" + h + ",28%,40%)", tete = "hsl(" + h + ",24%,34%)";
    var epaules = p.genre === "homme" ? "M10 100 Q10 70 50 66 Q90 70 90 100 Z" : "M16 100 Q16 72 50 68 Q84 72 84 100 Z";
    var cheveux = p.genre === "femme" ? "<path d='M30 40 Q30 18 50 18 Q70 18 70 40 Q70 60 64 66 L36 66 Q30 60 30 40 Z' fill='" + corps + "' opacity='.55'/>" : "";
    return "<svg viewBox='0 0 100 100' role='img' aria-label='Photo de démonstration'>" +
      "<defs><linearGradient id='g" + h + p.age + "' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + fond1 + "'/><stop offset='1' stop-color='" + fond2 + "'/></linearGradient></defs>" +
      "<rect width='100' height='100' fill='url(#g" + h + p.age + ")'/>" + cheveux +
      "<circle cx='50' cy='40' r='15' fill='" + tete + "'/><path d='" + epaules + "' fill='" + corps + "'/></svg>";
  }

  function photoCachee() {
    return "<div class='photo-cachee'><svg viewBox='0 0 24 24' width='34' height='34' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='10' width='16' height='11' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3'/></svg><span>Photo visible après vérification d'identité</span></div>";
  }

  function carte(p) {
    return "<article class='profil-carte'>" +
      "<div class='profil-photo'>" + (p.verifie ? avatar(p) : photoCachee()) + "</div>" +
      "<div class='profil-corps'>" +
      "<h3>" + echapper(p.prenom) + ", " + p.age + " ans" + (p.verifie ? " <span class='badge-verifie' title='Identité vérifiée'>✓</span>" : "") + "</h3>" +
      "<p class='profil-lieu'>" + echapper(p.ville) + " (" + echapper(p.canton) + ")</p>" +
      "<ul class='profil-infos'>" +
      "<li><b>Croyance :</b> " + echapper(p.croyance) + "</li>" +
      "<li><b>Pratique :</b> " + echapper(p.pratique) + "</li>" +
      "<li><b>Situation :</b> " + echapper(p.situation) + "</li>" +
      "<li><b>Enfants :</b> " + echapper(p.enfants) + "</li>" +
      "<li><b>Mariage envisagé :</b> " + echapper(p.delai) + "</li>" +
      "</ul></div></article>";
  }

  function jeton() {
    try { var t = localStorage.getItem(CLE_JETON); if (t) return t; } catch (e) { /* ignoré */ }
    try { return sessionStorage.getItem(CLE_JETON) || ""; } catch (e) { return ""; }
  }
  function oublierJeton() {
    try { localStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
    try { sessionStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
  }
  function versConnexion() { window.location.replace("connexion.html"); }

  document.getElementById("btnDeconnexion").addEventListener("click", function (e) {
    e.preventDefault();
    oublierJeton();
    versConnexion();
  });

  var t = jeton();
  if (!t) { versConnexion(); return; }

  fetch(URL_MOI, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res || !res.success) { oublierJeton(); versConnexion(); return; }
      var cherche = res.member.gender === "homme" ? "femme" : "homme";
      var min = parseInt(res.search.age_min, 10), max = parseInt(res.search.age_max, 10);
      // Filtrage strict : sexe opposé et âge dans la tranche choisie, sans aucune approximation
      var liste = DEMO.filter(function (p) { return p.genre === cherche && p.age >= min && p.age <= max; });
      document.getElementById("resumeRecherche").innerHTML = "Vous recherchez " + (cherche === "femme" ? "une épouse" : "un époux") + " âgé(e) de <b>" + min + " à " + max + " ans</b>. " + liste.length + " profil" + (liste.length > 1 ? "s correspondent" : " correspond") + " exactement à votre recherche.";
      document.getElementById("grille").innerHTML = liste.map(carte).join("");
      document.getElementById("aucun").style.display = liste.length ? "none" : "block";
      document.getElementById("chargement").style.display = "none";
      document.getElementById("contenu").style.display = "block";
    })
    .catch(function () {
      document.getElementById("chargement").textContent = "Connexion impossible pour le moment. Vérifiez votre connexion Internet et rechargez la page.";
    });
})();
