// Nikah — traduction du site (FR, DE, IT, EN, SQ)
// Le site est écrit en français. Ce script remplace les textes français par leur traduction
// (js/langues/xx.js), y compris les textes ajoutés plus tard par les autres scripts.
(function () {
  "use strict";
  var LANGUES = [
    { code: "fr", nom: "Français", drapeau: "fr" },
    { code: "de", nom: "Deutsch", drapeau: "de" },
    { code: "it", nom: "Italiano", drapeau: "it" },
    { code: "en", nom: "English", drapeau: "gb" },
    { code: "sq", nom: "Shqip", drapeau: "al" }
  ];
  var CLE = "nikah_langue";
  var codes = LANGUES.map(function (l) { return l.code; });
  // Drapeaux (img/drapeaux, icônes flag-icons, licence MIT)
  function drapeau(l) { return "<img class='drapeau' src='img/drapeaux/" + l.drapeau + ".svg' alt='' width='20' height='15'>"; }

  function langueChoisie() {
    var l = null;
    try { l = localStorage.getItem(CLE); } catch (e) { /* ignoré */ }
    if (l && codes.indexOf(l) !== -1) return l;
    var nav = String((navigator.languages && navigator.languages[0]) || navigator.language || "fr").slice(0, 2).toLowerCase();
    if (nav === "al") nav = "sq";
    return codes.indexOf(nav) !== -1 ? nav : "fr";
  }
  var langue = langueChoisie();
  document.documentElement.lang = langue;
  window.NikahLangue = langue;

  // Dictionnaire de la langue choisie (rempli par js/langues/xx.js)
  window.NikahLangues = window.NikahLangues || {};
  var dico = null, modeles = [];

  function norm(t) { return String(t).replace(/\s+/g, " ").trim(); }
  function traduire(texte) {
    if (!dico || texte == null) return texte;
    var n = norm(texte);
    if (!n) return null;
    if (Object.prototype.hasOwnProperty.call(dico, n)) return dico[n];
    for (var i = 0; i < modeles.length; i++) {
      var m = n.match(modeles[i][0]);
      if (m) return modeles[i][1].replace(/\$(\d)/g, function (_, k) { return m[k] !== undefined ? m[k] : ""; });
    }
    return null;
  }
  window.NikahT = function (texte) { var t = traduire(texte); return t == null ? texte : t; };

  var INTERDIT = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  var INLINE = { B: 1, STRONG: 1, EM: 1, I: 1, BR: 1, SMALL: 1, U: 1 };
  function protege(el) { return el.closest && el.closest("[data-no-i18n]"); }

  function traduireAttributs(el) {
    ["placeholder", "title", "aria-label", "alt"].forEach(function (a) {
      if (el.hasAttribute && el.hasAttribute(a)) {
        var t = traduire(el.getAttribute(a));
        if (t != null && t !== el.getAttribute(a)) el.setAttribute(a, t);
      }
    });
    if (el.tagName === "INPUT" && (el.type === "button" || el.type === "submit") && el.value) {
      var v = traduire(el.value); if (v != null) el.value = v;
    }
  }
  // Un élément dont le contenu (avec <strong>, <b>…) correspond à une phrase connue est remplacé d'un bloc
  function traduireBloc(el) {
    if (!el.children || !el.children.length) return false;
    for (var i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      if (!INLINE[c.tagName] || c.children.length) return false;
    }
    var cle = norm(el.innerHTML.replace(/\s*class="[^"]*"/g, "").replace(/<br\s*\/?>/g, "<br>"));
    var t = traduire(cle);
    if (t != null) { if (t !== cle) el.innerHTML = t; return true; }
    return false;
  }
  function parcourir(racine) {
    if (!dico || !racine) return;
    if (racine.nodeType === 3) {
      if (racine.parentNode && !INTERDIT[racine.parentNode.tagName] && !protege(racine.parentNode)) {
        var t = traduire(racine.nodeValue);
        if (t != null && t !== norm(racine.nodeValue)) {
          // Une option de liste sans « value » garde sa valeur française (c'est elle qui est enregistrée)
          var par = racine.parentNode;
          if (par.tagName === "OPTION" && !par.hasAttribute("value")) par.setAttribute("value", norm(racine.nodeValue));
          racine.nodeValue = racine.nodeValue.replace(norm(racine.nodeValue), t);
        }
      }
      return;
    }
    if (racine.nodeType !== 1 || protege(racine)) return;
    if (racine.tagName === "TEXTAREA") { traduireAttributs(racine); return; }
    if (INTERDIT[racine.tagName]) return;
    traduireAttributs(racine);
    if (traduireBloc(racine)) return;
    var enfants = Array.prototype.slice.call(racine.childNodes);
    for (var i = 0; i < enfants.length; i++) parcourir(enfants[i]);
  }

  // Sélecteur de langue en haut de chaque page
  function selecteur() {
    var cont = document.querySelector(".site-header .container");
    if (!cont || document.getElementById("choixLangue")) return;
    var boite = document.createElement("div");
    boite.className = "choix-langue";
    boite.id = "choixLangue";
    boite.setAttribute("data-no-i18n", "");
    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "choix-langue-bouton";
    bouton.setAttribute("aria-haspopup", "true");
    bouton.setAttribute("aria-label", "Langue / Sprache / Lingua / Language / Gjuha");
    var actuelle = LANGUES[codes.indexOf(langue)];
    bouton.innerHTML = drapeau(actuelle) + "<span>" + langue.toUpperCase() + "</span><span class='choix-langue-fleche' aria-hidden='true'>▾</span>";
    var liste = document.createElement("div");
    liste.className = "choix-langue-liste";
    liste.hidden = true;
    LANGUES.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = drapeau(l) + "<span>" + l.nom + "</span>";
      if (l.code === langue) b.className = "actif";
      b.addEventListener("click", function () {
        try { localStorage.setItem(CLE, l.code); } catch (e) { /* ignoré */ }
        window.location.reload();
      });
      liste.appendChild(b);
    });
    bouton.addEventListener("click", function (e) { e.stopPropagation(); liste.hidden = !liste.hidden; });
    document.addEventListener("click", function () { liste.hidden = true; });
    boite.appendChild(bouton);
    boite.appendChild(liste);
    var nav = cont.querySelector(".site-nav");
    if (nav) cont.insertBefore(boite, nav); else cont.appendChild(boite);
  }

  function demarrer() {
    selecteur();
    if (langue === "fr") return;
    var s = document.createElement("script");
    s.src = "js/langues/" + langue + ".js?v=20261017d";
    s.onload = function () {
      var L = window.NikahLangues[langue] || {};
      dico = L.textes || {};
      modeles = (L.modeles || []).map(function (m) { return [new RegExp("^" + m[0] + "$"), m[1]]; });
      document.title = window.NikahT(document.title);
      parcourir(document.body);
      new MutationObserver(function (liste) {
        liste.forEach(function (m) {
          if (m.type === "characterData") parcourir(m.target);
          else if (!protege(m.target) && traduireBloc(m.target)) return;
          else Array.prototype.forEach.call(m.addedNodes, parcourir);
        });
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    document.head.appendChild(s);
    // Les fenêtres de confirmation et d'alerte sont aussi traduites
    var conf = window.confirm, alerte = window.alert;
    window.confirm = function (m) { return conf.call(window, window.NikahT(m)); };
    window.alert = function (m) { return alerte.call(window, window.NikahT(m)); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
