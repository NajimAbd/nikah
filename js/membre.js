// Nikah — espace membre (profils de démonstration, filtrage strict)
(function () {
  "use strict";
  var URL_MOI = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-me";
  var CLE_JETON = "nikah_jeton";
  var URL_IDENTITE = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-identity";

  var URL_MSG = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-messages";
  var URL_RECHERCHE = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-search";
  var LIB = {
    croyance: { sunnite: "Sunnite", chiite: "Chiite", soufi: "Soufi", ahmadiyya: "Ahmadiyya", autre_islam: "Islam — autre", en_reversion: "En cours de réversion", ne_pas_repondre: "Non précisé", autre: "Autre" },
    pratique: { tres_pratiquant: "Très pratiquant(e)", pratiquant: "Pratiquant(e)", peu_pratiquant: "Peu pratiquant(e)" },
    situation: { celibataire: "Célibataire", separe: "Séparé(e)", divorce: "Divorcé(e)", veuf_veuve: "Veuf / Veuve", autre: "Autre", ne_pas_repondre: "Non précisé" },
    enfants: { oui: "Oui", pas_sur: "Pas encore sûr(e)", non: "Non" },
    delai: { "1-2_mois": "1-2 mois", "2-4_mois": "2-4 mois", "4-6_mois": "4-6 mois", a_convenir: "À convenir ensemble" }
  };
  function initiale(n) { return String(n || "?").trim().charAt(0).toUpperCase() || "?"; }
  function cercleLettre(nom, couleur, verifie) {
    var fond = verifie && /^#[0-9a-fA-F]{6}$/.test(couleur || "") ? couleur : "#9a9a9a";
    return "<span class='avatar-lettre' style='background:" + fond + "'>" + echapper(initiale(nom)) + "</span>";
  }
  function lib(cat, v) { return v && LIB[cat][v] ? LIB[cat][v] : "Non précisé"; }

  function echapper(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function photoCachee() {
    return "<div class='photo-cachee'><svg viewBox='0 0 24 24' width='34' height='34' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='10' width='16' height='11' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3'/></svg><span>Photo visible après vérification d'identité</span></div>";
  }

  function carte(p) {
    var photo = p.photo ? "<img alt='Photo du profil' src='" + p.photo + "'>" : (p.nom ? "<div class='avatar-grand'>" + cercleLettre(p.nom, p.couleur, true) + "</div>" : photoCachee());
    var lieu = [p.ville, p.region].filter(Boolean).map(echapper).join(", ");
    return "<article class='profil-carte'>" +
      "<div class='profil-photo profil-photo-cliquable' data-ecrire='" + p.id + "' data-nom='" + echapper(p.nom || "") + "' role='button' tabindex='0' title='Écrire à cette personne'>" + photo +
      "<span class='pastille-ecrire'>✉ Écrire</span></div>" +
      "<div class='profil-corps'>" +
      "<h3>" + echapper(p.nom || (p.genre === "femme" ? "Femme" : "Homme")) + ", " + p.age + " ans <span class='badge-verifie' title='Identité vérifiée'>✓</span></h3>" +
      "<p class='profil-lieu'>" + lieu + "</p>" +
      "<ul class='profil-infos'>" +
      "<li><b>Croyance :</b> " + echapper(lib("croyance", p.croyance)) + "</li>" +
      "<li><b>Pratique :</b> " + echapper(lib("pratique", p.pratique)) + "</li>" +
      "<li><b>Situation :</b> " + echapper(lib("situation", p.situation)) + "</li>" +
      "<li><b>Enfants :</b> " + echapper(lib("enfants", p.enfants)) + "</li>" +
      "<li><b>Mariage envisagé :</b> " + echapper(lib("delai", p.delai)) + "</li>" +
      "</ul>" +
      "<div class='contact-zone'><button type='button' class='btn btn-outline btn-contact' data-ecrire='" + p.id + "' data-nom='" + echapper(p.nom || "") + "'>Écrire</button></div>" +
      "</div></article>";
  }

  // Fenêtre de discussion instantanée : s'ouvre en cliquant sur la photo ou sur « Écrire »
  var fen = document.getElementById("fenetreChat");
  var fenNom = document.getElementById("fenetreChatNom");
  var fenTexte = document.getElementById("fenetreChatTexte");
  var fenErreur = document.getElementById("fenetreChatErreur");
  var fenEnvoyer = document.getElementById("fenetreChatEnvoyer");
  var destinataire = 0;
  function fermerChat() { fen.hidden = true; destinataire = 0; document.body.classList.remove("chat-ouvert"); }
  function erreurChat(t) { fenErreur.textContent = t; fenErreur.style.display = t ? "block" : "none"; }
  function ouvrirChat(id, nom) {
    // Conversation déjà commencée avec cette personne ? On l'ouvre directement.
    fetch(URL_MSG, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton(), action: "list" }) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        var deja = r && r.success ? r.conversations.filter(function (c) { return c.autre && c.autre.id === id; })[0] : null;
        if (deja) { window.location.href = "messages.html?c=" + deja.cid; return; }
        montrerChat(id, nom);
      })
      .catch(function () { montrerChat(id, nom); });
  }
  function montrerChat(id, nom) {
    destinataire = id;
    fenNom.textContent = nom ? "Écrire à " + nom : "Nouveau message";
    fenTexte.value = ""; erreurChat(""); fenEnvoyer.disabled = false;
    fen.hidden = false; document.body.classList.add("chat-ouvert");
    setTimeout(function () { fenTexte.focus(); }, 30);
  }
  function envoyerChat() {
    var texte = fenTexte.value.trim();
    erreurChat("");
    if (!texte) { erreurChat("Merci d'écrire un court message."); fenTexte.focus(); return; }
    fenEnvoyer.disabled = true; fenEnvoyer.textContent = "Envoi…";
    fetch(URL_MSG, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton(), action: "start", to: destinataire, body: texte }) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r && r.success) { window.location.href = "messages.html?c=" + r.cid; return; }
        fenEnvoyer.disabled = false; fenEnvoyer.textContent = "Envoyer";
        erreurChat("Le contact n'a pas pu être établi. Votre identité doit être vérifiée et le profil doit correspondre à votre recherche.");
      })
      .catch(function () { fenEnvoyer.disabled = false; fenEnvoyer.textContent = "Envoyer"; erreurChat("Connexion impossible pour le moment."); });
  }
  document.addEventListener("click", function (e) {
    var cible = e.target.closest ? e.target.closest("[data-ecrire]") : null;
    if (cible) { ouvrirChat(parseInt(cible.getAttribute("data-ecrire"), 10), cible.getAttribute("data-nom")); return; }
    if (e.target.closest && e.target.closest("[data-fermer-chat]")) fermerChat();
  });
  fenEnvoyer.addEventListener("click", envoyerChat);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !fen.hidden) { fermerChat(); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("profil-photo-cliquable")) { e.preventDefault(); e.target.click(); return; }
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.target === fenTexte) { e.preventDefault(); envoyerChat(); }
  });

  var TITRE_BASE = document.title;
  function majBadgeMessages() {
    if (document.hidden) return;
    fetch(URL_MSG, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton(), action: "list" }) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        var lien = document.getElementById("lienMessages");
        if (lien && r && r.success) {
          lien.textContent = r.non_lus > 0 ? "Messages (" + r.non_lus + ")" : "Messages";
          lien.classList.toggle("a-lire", r.non_lus > 0);
          document.title = (r.non_lus > 0 ? "(" + r.non_lus + ") " : "") + TITRE_BASE;
        }
      }).catch(function () { /* ignoré */ });
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

  // --- Vérification d'identité ---
  var pieceData = "", selfieData = "";
  function reduire(fichier, cible, apercu, appliquer) {
    if (!fichier) return;
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var img = new Image();
      img.onload = function () {
        var ratio = Math.min(1, 1200 / Math.max(img.width, img.height));
        var cv = document.createElement("canvas");
        cv.width = Math.round(img.width * ratio); cv.height = Math.round(img.height * ratio);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        var url = cv.toDataURL("image/jpeg", 0.8);
        appliquer(url);
        apercu.innerHTML = "";
        var i = document.createElement("img"); i.src = url; i.alt = "Aperçu"; apercu.appendChild(i);
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  }
  function brancherVerification(membre) {
    var carte = document.getElementById("verifCarte");
    if (membre.identity_verified) { carte.style.display = "none"; return; }
    carte.style.display = "block";
    var texte = document.getElementById("verifTexte");
    var form = document.getElementById("verifFormulaire");
    if (membre.docs_envoyes) {
      texte.textContent = "Vos documents ont bien été reçus. L'administrateur va les examiner. Vous pouvez en renvoyer de nouveaux si nécessaire.";
    }
    document.getElementById("fichierPiece").addEventListener("change", function (e) { reduire(e.target.files[0], "piece", document.getElementById("apercuPiece"), function (u) { pieceData = u; }); });
    document.getElementById("fichierSelfie").addEventListener("change", function (e) { reduire(e.target.files[0], "selfie", document.getElementById("apercuSelfie"), function (u) { selfieData = u; }); });
    var erreur = document.getElementById("verifErreur");
    document.getElementById("btnEnvoyerPieces").addEventListener("click", function () {
      var bouton = this;
      erreur.style.display = "none";
      if (!pieceData || !selfieData) { erreur.textContent = "Merci d'ajouter les deux images (pièce d'identité et selfie)."; erreur.style.display = "block"; return; }
      bouton.disabled = true; bouton.textContent = "Envoi en cours…";
      fetch(URL_IDENTITE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton(), piece: pieceData, selfie: selfieData }) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          bouton.disabled = false; bouton.textContent = "Envoyer pour vérification";
          if (r && r.success) {
            pieceData = ""; selfieData = "";
            document.getElementById("apercuPiece").innerHTML = ""; document.getElementById("apercuSelfie").innerHTML = "";
            texte.textContent = "Merci ! Vos documents ont bien été reçus. L'administrateur va les examiner.";
          } else { erreur.textContent = "L'envoi n'a pas abouti. Merci de réessayer avec d'autres images."; erreur.style.display = "block"; }
        })
        .catch(function () { bouton.disabled = false; bouton.textContent = "Envoyer pour vérification"; erreur.textContent = "Connexion impossible pour le moment."; erreur.style.display = "block"; });
    });
  }

  var t = jeton();
  if (!t) { versConnexion(); return; }

  fetch(URL_MOI, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res || !res.success) { oublierJeton(); versConnexion(); return; }
      var cherche = res.member.gender === "homme" ? "femme" : "homme";
      var min = parseInt(res.search.age_min, 10), max = parseInt(res.search.age_max, 10);
      // Filtrage strict : sexe opposé et âge dans la tranche choisie, sans aucune approximation
      var entete = document.getElementById("avatarEntete");
      if (res.member.photo) { var img = document.createElement("img"); img.alt = "Ma photo"; img.src = res.member.photo; entete.appendChild(img); }
      else entete.innerHTML = cercleLettre(res.member.display_name, res.member.avatar_color, res.member.identity_verified);
      if (res.member.display_name) document.getElementById("monNom").textContent = res.member.display_name;
      document.getElementById("monStatut").textContent = res.member.identity_verified
        ? "Identité vérifiée : votre photo est visible par les autres membres."
        : "Identité non vérifiée : votre photo n'est visible que par vous. Elle sera montrée aux autres membres après la vérification de votre identité.";
      if (res.member.avertissements > 0) {
        var n = res.member.avertissements;
        var av = document.createElement("span");
        av.className = "point-noir";
        av.textContent = "● " + n + (n > 1 ? " avertissements officiels inscrits" : " avertissement officiel inscrit") + " à votre dossier. En cas de récidive, votre compte sera suspendu.";
        document.getElementById("monStatut").parentNode.appendChild(av);
      }
      brancherVerification(res.member);
      majBadgeMessages();
      setInterval(majBadgeMessages, 3000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) majBadgeMessages(); });
      return fetch(URL_RECHERCHE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) })
        .then(function (r) { return r.json(); })
        .then(function (rech) {
          var liste = rech && rech.success ? rech.profils : [];
          document.getElementById("resumeRecherche").innerHTML = "Vous recherchez " + (cherche === "femme" ? "une épouse" : "un époux") + " âgé(e) de <b>" + min + " à " + max + " ans</b>. " + liste.length + " profil" + (liste.length > 1 ? "s correspondent" : " correspond") + " exactement à votre recherche.";
          document.getElementById("grille").innerHTML = liste.map(carte).join("");
          document.getElementById("aucun").style.display = liste.length ? "none" : "block";
          document.getElementById("chargement").style.display = "none";
          document.getElementById("contenu").style.display = "block";
        });
    })
    .catch(function () {
      document.getElementById("chargement").textContent = "Connexion impossible pour le moment. Vérifiez votre connexion Internet et rechargez la page.";
    });
})();
