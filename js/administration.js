// Nikah — espace administrateur (privé)
(function () {
  "use strict";
  var BASE = "https://n8n.srv936251.hstgr.cloud/webhook/";
  var CLE = "nikah_admin_jeton";
  var blocConnexion = document.getElementById("blocConnexion");
  var blocListe = document.getElementById("blocListe");
  var liste = document.getElementById("listeAdmin");
  var resume = document.getElementById("resumeAdmin");
  var erreur = document.getElementById("erreurAdmin");
  var btnSortir = document.getElementById("btnSortir");

  function lire() { try { return sessionStorage.getItem(CLE) || ""; } catch (e) { return ""; } }
  function ecrire(v) { try { if (v) sessionStorage.setItem(CLE, v); else sessionStorage.removeItem(CLE); } catch (e) { /* ignoré */ } }
  function montrerErreur(t) { erreur.textContent = t; erreur.style.display = t ? "block" : "none"; }
  function post(chemin, corps) {
    return fetch(BASE + chemin, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) })
      .then(function (r) { return r.json(); });
  }
  function texte(t) { return document.createTextNode(t == null ? "" : String(t)); }
  function el(nom, classe, contenu) {
    var e = document.createElement(nom);
    if (classe) e.className = classe;
    if (contenu != null) e.appendChild(texte(contenu));
    return e;
  }

  function age(annee) { var a = parseInt(annee, 10); return a ? (new Date().getFullYear() - a) + " ans" : ""; }

  function carte(m) {
    var c = el("div", "admin-carte");
    var photo = el("div", "admin-photo");
    if (m.photo) { var img = document.createElement("img"); img.src = m.photo; img.alt = "Photo du membre " + m.id; photo.appendChild(img); }
    else if (m.nom) {
      var fond = m.verifie && /^#[0-9a-fA-F]{6}$/.test(m.couleur || "") ? m.couleur : "#9a9a9a";
      var rond = el("span", "avatar-lettre", String(m.nom).charAt(0).toUpperCase()); rond.style.background = fond; photo.appendChild(rond);
    }
    else photo.appendChild(el("span", "", "Pas de photo"));
    c.appendChild(photo);
    var infos = el("div", "admin-infos");
    infos.appendChild(el("strong", "", "#" + m.id + " — " + (m.nom ? m.nom + " — " : "") + (m.genre === "homme" ? "Homme" : m.genre === "femme" ? "Femme" : m.genre || "")));
    infos.appendChild(el("span", "", m.email));
    infos.appendChild(el("span", "", [age(m.annee), m.ville, m.region, m.pays].filter(Boolean).join(" · ")));
    infos.appendChild(el("span", "", "Inscrit le " + (m.inscrit || "")));
    infos.appendChild(el("span", m.verifie ? "badge-ok" : "badge-attente", m.verifie ? "Identité vérifiée" : "En attente de vérification"));
    if (m.piece && m.selfie) {
      var docs = el("div", "admin-docs");
      [["Pièce d'identité", m.piece], ["Selfie", m.selfie]].forEach(function (d) {
        var f = el("figure", "admin-doc"); var i = document.createElement("img"); i.src = d[1]; i.alt = d[0];
        f.appendChild(i); f.appendChild(el("figcaption", "", d[0])); docs.appendChild(f);
      });
      infos.appendChild(docs);
    } else if (!m.verifie) {
      infos.appendChild(el("span", "", "Aucun document reçu pour le moment."));
    }
    var rangee = el("div", "admin-actions");
    function bouton(libelle, classe, action, confirmation) {
      var b = el("button", "btn " + classe, libelle); b.type = "button";
      b.addEventListener("click", function () {
        if (confirmation && !window.confirm(confirmation)) return;
        b.disabled = true;
        post("nikah-admin-set", { token: lire(), member_id: m.id, action: action })
          .then(function () { charger(); })
          .catch(function () { b.disabled = false; alert("Action impossible pour le moment."); });
      });
      rangee.appendChild(b);
    }
    if (m.verifie) bouton("Retirer la vérification", "btn-outline", "unverify");
    else {
      bouton("Marquer comme vérifié", "btn-primary", "verify", m.piece ? "Valider ce membre ? Ses documents seront supprimés." : "Ce membre n'a envoyé aucun document. Valider quand même ?");
      if (m.piece) bouton("Refuser les documents", "btn-outline", "reject", "Supprimer ces documents ? Le membre pourra en renvoyer.");
    }
    infos.appendChild(rangee);
    c.appendChild(infos);
    return c;
  }

  function afficherConnexion() { blocListe.style.display = "none"; document.getElementById("blocMessagesAdmin").style.display = "none"; document.getElementById("blocOnglets").style.display = "none"; blocConnexion.style.display = ""; btnSortir.style.display = "none"; }

  var ongletCourant = "profils";
  var donneesMessages = null;
  var ONGLETS = { profils: "ongletProfils", controler: "ongletMessages", approuves: "ongletApprouves", refuses: "ongletRefuses" };
  var TITRES = { controler: "Messages à contrôler", approuves: "Messages approuvés", refuses: "Messages refusés" };
  var FILTRES = {
    controler: function (c) { return c.statut === "moderation"; },
    approuves: function (c) { return c.statut === "demande" || c.statut === "acceptee" || c.statut === "refusee"; },
    refuses: function (c) { return c.statut === "rejetee"; }
  };
  function montrerOnglet(nom) {
    ongletCourant = nom;
    blocListe.style.display = nom === "profils" ? "" : "none";
    document.getElementById("blocMessagesAdmin").style.display = nom === "profils" ? "none" : "";
    Object.keys(ONGLETS).forEach(function (k) { document.getElementById(ONGLETS[k]).className = k === nom ? "actif" : ""; });
    if (nom !== "profils") { document.getElementById("titreMessages").textContent = TITRES[nom]; afficherMessages(); }
  }
  Object.keys(ONGLETS).forEach(function (k) { document.getElementById(ONGLETS[k]).addEventListener("click", function () { montrerOnglet(k); }); });

  function nomMembre(m) { return (m.nom ? m.nom + " " : "") + "(" + (m.genre === "femme" ? "femme" : "homme") + ", " + m.email + ")"; }
  var LIB_STATUT = { moderation: "À contrôler", demande: "Transmise, en attente de réponse", acceptee: "Conversation acceptée", refusee: "Refusée par le destinataire", rejetee: "Refusée par la modération" };

  function carteConversation(c) {
    var boite = el("div", "admin-conv" + (c.statut === "moderation" ? " a-controler" : ""));
    boite.appendChild(el("strong", "", nomMembre(c.a) + " → " + nomMembre(c.b)));
    boite.appendChild(el("span", c.statut === "moderation" ? "badge-attente" : "", LIB_STATUT[c.statut] || c.statut));
    var fil = el("div", "admin-fil");
    c.messages.forEach(function (m) {
      var l = el("div", "admin-msg " + (m.de_a ? "de-a" : "de-b"));
      l.appendChild(el("small", "", (m.de_a ? (c.a.nom || "A") : (c.b.nom || "B")) + " — " + String(m.date || "").replace("T", " ").slice(0, 16)));
      l.appendChild(el("div", "", m.texte));
      fil.appendChild(l);
    });
    boite.appendChild(fil);
    if (c.statut === "moderation") {
      var rangee = el("div", "admin-actions");
      [["Approuver et transmettre", "btn-primary", "approve", null], ["Refuser", "btn-outline", "reject", "Refuser ce message ? Il ne sera pas transmis."]].forEach(function (d) {
        var b = el("button", "btn " + d[1], d[0]); b.type = "button";
        b.addEventListener("click", function () {
          if (d[3] && !window.confirm(d[3])) return;
          b.disabled = true;
          post("nikah-admin-messages", { token: lire(), action: "moderate", cid: c.cid, decision: d[2] }).then(function (r) { rendreMessages(r); }).catch(function () { b.disabled = false; });
        });
        rangee.appendChild(b);
      });
      boite.appendChild(rangee);
    }
    return boite;
  }
  function afficherMessages() {
    if (!donneesMessages || ongletCourant === "profils") return;
    var zone = document.getElementById("listeMessagesAdmin");
    zone.innerHTML = "";
    var liste = donneesMessages.conversations.filter(FILTRES[ongletCourant]);
    liste.forEach(function (c) { zone.appendChild(carteConversation(c)); });
    document.getElementById("resumeMessages").textContent = liste.length ? liste.length + (liste.length > 1 ? " conversations" : " conversation") : "Aucune conversation dans cette liste pour le moment.";
  }
  function rendreMessages(r) {
    if (!r || !r.success) return;
    var sig = JSON.stringify(r.conversations.map(function (c) { return [c.cid, c.statut, c.messages.length]; }));
    if (donneesMessages && sig === donneesMessages._sig) return;
    r._sig = sig;
    donneesMessages = r;
    document.getElementById("ongletMessages").textContent = r.a_moderer > 0 ? "Messages à contrôler (" + r.a_moderer + ")" : "Messages à contrôler";
    afficherMessages();
  }
  function chargerMessages() {
    post("nikah-admin-messages", { token: lire(), action: "list" }).then(rendreMessages).catch(function () { /* ignoré */ });
  }

  function charger() {
    post("nikah-admin-list", { token: lire() }).then(function (res) {
      if (!res || !res.success) { ecrire(""); afficherConnexion(); return; }
      blocConnexion.style.display = "none";
      document.getElementById("blocOnglets").style.display = "";
      montrerOnglet(ongletCourant);
      chargerMessages();
      btnSortir.style.display = "";
      liste.innerHTML = "";
      var n = res.membres.length;
      resume.textContent = n + (n > 1 ? " profils" : " profil") + " au total.";
      res.membres.forEach(function (m) { liste.appendChild(carte(m)); });
    }).catch(function () { afficherConnexion(); montrerErreur("Connexion impossible pour le moment."); });
  }

  document.getElementById("formAdmin").addEventListener("submit", function (e) {
    e.preventDefault();
    montrerErreur("");
    var champ = document.getElementById("champMdpAdmin");
    var bouton = document.getElementById("btnAdmin");
    if (!champ.value) { montrerErreur("Merci d'indiquer le mot de passe."); return; }
    bouton.disabled = true;
    post("nikah-admin-login", { password: champ.value }).then(function (res) {
      bouton.disabled = false;
      if (res && res.success && res.token) { ecrire(res.token); champ.value = ""; charger(); }
      else montrerErreur(res && res.error === "compte_bloque" ? "Trop de tentatives. Réessayez dans 15 minutes." : "Mot de passe incorrect.");
    }).catch(function () { bouton.disabled = false; montrerErreur("Connexion impossible pour le moment."); });
  });

  btnSortir.addEventListener("click", function (e) { e.preventDefault(); ecrire(""); afficherConnexion(); });

  if (lire()) charger();
  setInterval(function () { if (lire() && !document.hidden && blocConnexion.style.display === "none") chargerMessages(); }, 4000);
  // Œil : afficher / masquer le mot de passe
  var OEIL = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z'/><circle cx='12' cy='12' r='3'/></svg>";
  var OEIL_BARRE = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M17.94 17.94A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94'/><path d='M9.9 4.24A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19'/><path d='M14.12 14.12A3 3 0 1 1 9.88 9.88'/><line x1='1' y1='1' x2='23' y2='23'/></svg>";
  var oeilAdmin = document.getElementById("oeilAdmin");
  if (oeilAdmin) {
    oeilAdmin.innerHTML = OEIL;
    oeilAdmin.addEventListener("click", function () {
      var c = document.getElementById("champMdpAdmin");
      var visible = c.type === "text";
      c.type = visible ? "password" : "text";
      oeilAdmin.innerHTML = visible ? OEIL : OEIL_BARRE;
      oeilAdmin.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe");
    });
  }

  // Mot de passe oublié : lien envoyé à l'adresse de l'administrateur (valable 5 minutes)
  var lienOubli = document.getElementById("lienOubliAdmin");
  var okOubli = document.getElementById("okOubliAdmin");
  if (lienOubli) {
    lienOubli.addEventListener("click", function (e) {
      e.preventDefault();
      if (lienOubli.getAttribute("data-envoi") === "1") return;
      lienOubli.setAttribute("data-envoi", "1");
      montrerErreur("");
      okOubli.style.display = "none";
      post("nikah-admin-forgot", {})
        .then(function (r) {
          if (r && r.success) {
            okOubli.textContent = "Un lien vient d'être envoyé à l'adresse e-mail de l'administrateur. Il est valable 5 minutes. Pensez à vérifier les courriers indésirables.";
            okOubli.style.display = "block";
          } else montrerErreur("Envoi impossible pour le moment. Réessayez dans un instant.");
        })
        .catch(function () { montrerErreur("Connexion impossible pour le moment. Réessayez dans un instant."); })
        .then(function () { setTimeout(function () { lienOubli.removeAttribute("data-envoi"); }, 30000); });
    });
  }
})();
