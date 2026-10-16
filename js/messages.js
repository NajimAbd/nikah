// Nikah — messagerie (demande de contact, acceptation, conversation)
(function () {
  "use strict";
  var URL_MSG = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-messages";
  var CLE_JETON = "nikah_jeton";
  var courante = 0;
  var enCours = false;
  var signatureListe = "";
  var signatureFil = "";
  var TITRE_BASE = document.title;
  function majTitre(n) { document.title = (n > 0 ? "(" + n + ") " : "") + TITRE_BASE; }

  function jeton() {
    try { var t = localStorage.getItem(CLE_JETON); if (t) return t; } catch (e) { /* ignoré */ }
    try { return sessionStorage.getItem(CLE_JETON) || ""; } catch (e) { return ""; }
  }
  function oublier() {
    try { localStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
    try { sessionStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
  }
  function versConnexion() { window.location.replace("connexion.html"); }
  function appel(corps) {
    corps.token = jeton();
    return fetch(URL_MSG, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.error === "session_invalide") { oublier(); versConnexion(); } return r; });
  }
  function el(nom, classe, texte) {
    var e = document.createElement(nom);
    if (classe) e.className = classe;
    if (texte != null) e.textContent = texte;
    return e;
  }
  function nomAffiche(a) {
    if (a.nom) return a.nom;
    return (a.genre === "femme" ? "Femme" : "Homme") + (a.age ? ", " + a.age + " ans" : "");
  }
  function rond(a) {
    var s = el("span", "avatar-lettre", nomAffiche(a).charAt(0).toUpperCase());
    var ok = a.verifie && /^#[0-9a-fA-F]{6}$/.test(a.couleur || "");
    s.style.background = ok ? a.couleur : "#9a9a9a";
    return s;
  }
  function heure(d) {
    var t = String(d || "").replace("T", " ");
    return t.length >= 16 ? t.slice(8, 10) + "." + t.slice(5, 7) + " " + t.slice(11, 16) : "";
  }

  document.getElementById("btnDeconnexion").addEventListener("click", function (e) { e.preventDefault(); oublier(); versConnexion(); });
  document.getElementById("btnRetour").addEventListener("click", function () { courante = 0; document.getElementById("messagerie").classList.remove("fil-ouvert"); chargerListe(); });

  function chargerListe() {
    return appel({ action: "list" }).then(function (r) {
      if (!r || !r.success) return;
      majTitre(r.non_lus);
      var sigL = JSON.stringify(r.conversations) + "|" + courante;
      if (sigL === signatureListe) {
        document.getElementById("chargement").style.display = "none";
        document.getElementById("messagerie").style.display = "";
        return;
      }
      signatureListe = sigL;
      var col = document.getElementById("colListe");
      col.innerHTML = "";
      r.conversations.forEach(function (c) {
        var ligne = el("button", "msg-ligne" + (c.cid === courante ? " actif" : ""));
        ligne.type = "button";
        ligne.appendChild(rond(c.autre));
        var txt = el("span", "msg-ligne-texte");
        txt.appendChild(el("strong", "", nomAffiche(c.autre)));
        // Liste de gauche : visage, nom et quelques informations seulement (les messages restent à droite)
        var infos = [c.autre && c.autre.age ? c.autre.age + " ans" : "", c.autre && (c.autre.ville || c.autre.region) || ""].filter(Boolean).join(" · ");
        if (infos) txt.appendChild(el("span", "", infos));
        ligne.appendChild(txt);
        if (c.non_lus > 0) ligne.appendChild(el("span", "badge-non-lu", String(c.non_lus)));
        ligne.addEventListener("click", function () { ouvrir(c.cid); });
        col.appendChild(ligne);
      });
      document.getElementById("aucune").style.display = r.conversations.length ? "none" : "block";
      document.getElementById("chargement").style.display = "none";
      document.getElementById("messagerie").style.display = "";
    });
  }

  function afficherFil(r) {
    var sigF = JSON.stringify([r.cid, r.statut, r.initiateur, r.blocage, r.deja_signale, r.messages.map(function (m) { return m.id + (m.statut || ""); })]);
    dernierFil = r;
    majMenu(r);
    if (sigF === signatureFil) return;
    signatureFil = sigF;
    var fil = document.getElementById("colFil");
    fil.style.display = "";
    document.getElementById("messagerie").classList.add("fil-ouvert");
    var titre = document.getElementById("filTitre");
    titre.innerHTML = "";
    titre.appendChild(rond(r.autre));
    titre.appendChild(el("strong", "", " " + nomAffiche(r.autre)));
    var zone = document.getElementById("filMessages");
    var enBas = zone.scrollHeight - zone.scrollTop - zone.clientHeight < 60;
    zone.innerHTML = "";
    r.messages.forEach(function (m) {
      var b = el("div", "bulle " + (m.moi ? "moi" : "autre") + (m.statut === "attente" ? " en-attente" : m.statut === "refuse" ? " refuse" : ""));
      var corpsMsg = el("div", "", m.texte); corpsMsg.setAttribute("data-no-i18n", ""); b.appendChild(corpsMsg);
      b.appendChild(el("small", "", heure(m.date) + (m.statut === "attente" ? " · en attente de vérification" : m.statut === "refuse" ? " · non transmis" : "")));
      zone.appendChild(b);
    });
    if (enBas) zone.scrollTop = zone.scrollHeight;

    var action = document.getElementById("filAction");
    var etat = r.statut + (r.initiateur ? "1" : "0") + JSON.stringify(r.blocage || {}) + (r.deja_signale ? "s" : "");
    if (action.getAttribute("data-etat") === etat && action.firstChild) return;
    action.setAttribute("data-etat", etat);
    action.innerHTML = "";
    var blo = r.blocage || {};
    if (r.deja_signale) action.appendChild(el("p", "msg-note", "Vous avez signalé cette conversation. L'administration va l'examiner."));
    if (blo.par_moi) {
      action.appendChild(el("p", "aide", blo.par_moi === "definitif"
        ? "Vous avez bloqué cette personne définitivement. Elle ne peut plus vous écrire et n'apparaît plus dans vos recherches."
        : "Vous avez bloqué cette personne jusqu'au " + dateFin(blo.par_moi) + ". Elle ne peut pas vous écrire d'ici là."));
      var deb = el("button", "btn btn-outline", "Débloquer"); deb.type = "button";
      deb.addEventListener("click", function () { agir({ action: "unblock", cid: courante }); });
      action.appendChild(deb);
    } else if (blo.par_lui) {
      action.appendChild(el("p", "aide", "Vous ne pouvez plus écrire à cette personne pour le moment."));
    } else if (r.statut === "demande" && !r.initiateur) {
      action.appendChild(el("p", "aide", "Cette personne souhaite entrer en contact avec vous. Souhaitez-vous répondre ?"));
      var oui = el("button", "btn btn-primary", "Accepter"); oui.type = "button";
      var non = el("button", "btn btn-outline", "Refuser"); non.type = "button";
      oui.addEventListener("click", function () { repondre(true); });
      non.addEventListener("click", function () { repondre(false); });
      var rangee = el("div", "admin-actions"); rangee.appendChild(oui); rangee.appendChild(non); action.appendChild(rangee);
    } else if (r.statut === "moderation") {
      action.appendChild(el("p", "aide", "Pour la sécurité de tous, votre premier message est vérifié avant d'être transmis. Vous serez informé(e) dès qu'il sera envoyé."));
    } else if (r.statut === "rejetee") {
      action.appendChild(el("p", "aide", "Votre message n'a pas pu être transmis car il ne respecte pas la charte de la plateforme."));
    } else if (r.statut === "demande") {
      action.appendChild(el("p", "aide", "Votre demande a été envoyée. Vous pourrez continuer la conversation dès qu'elle sera acceptée."));
    } else if (r.statut === "refusee") {
      action.appendChild(el("p", "aide", "Cette demande a été refusée."));
    } else {
      var form = el("form", "msg-saisie");
      var champ = el("textarea"); champ.maxLength = 1000; champ.rows = 2; champ.placeholder = "Votre message…";
      var envoyer = el("button", "btn btn-primary", "Envoyer"); envoyer.type = "submit";
      champ.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (form.requestSubmit) form.requestSubmit(); else envoyer.click(); }
      });
      form.appendChild(champ); form.appendChild(envoyer);
      var alerte = el("p", "alerte-filtre"); alerte.style.display = "none";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = champ.value.trim();
        if (!t) return;
        alerte.style.display = "none";
        var miens = dernierFil && dernierFil.messages ? dernierFil.messages.filter(function (m) { return m.moi; }).map(function (m) { return m.texte; }) : [];
        // Le serveur décide : il enregistre la tentative pour l'administration. On signale seulement un numéro coupé en plusieurs messages.
        var suite = !!(window.NikahFiltre && !NikahFiltre.detecter(t) && NikahFiltre.detecterSuite(t, miens));
        envoyer.disabled = true;
        appel({ action: "send", cid: courante, body: t, suite: suite }).then(function (res) {
          envoyer.disabled = false;
          if (res && res.success) {
            champ.value = ""; afficherFil(res); chargerListe(); document.getElementById("filMessages").scrollTop = 1e9;
            if (res.retenu) { alerte.textContent = window.NikahFiltre ? NikahFiltre.MESSAGE_RETENU : "Message retenu pour vérification."; alerte.style.display = "block"; }
          }
          else if (res && res.error === "coordonnees_interdites") { champ.value = ""; alerte.textContent = window.NikahFiltre ? NikahFiltre.MESSAGE : "Message bloqué et signalé à l'administration."; alerte.style.display = "block"; }
          else if (res && res.error === "compte_suspendu") { alerte.textContent = window.NikahFiltre ? NikahFiltre.MESSAGE_SUSPENDU : "Votre compte est suspendu."; alerte.style.display = "block"; champ.disabled = true; envoyer.disabled = true; setTimeout(function () { window.location.replace("connexion.html"); }, 8000); }
        }).catch(function () { envoyer.disabled = false; });
      });
      action.appendChild(form);
      action.appendChild(alerte);
    }
  }

  // Blocage et signalement
  var dernierFil = null;
  var menu = document.getElementById("menuOptions");
  var btnOptions = document.getElementById("btnOptions");
  function dateFin(t) { var p = String(t).split(/[-T:]/); return p.length >= 5 ? p[2] + "." + p[1] + "." + p[0] + ", " + p[3] + ":" + p[4] : t; }
  function fermerMenu() { menu.hidden = true; btnOptions.setAttribute("aria-expanded", "false"); }
  function majMenu(r) {
    var bloque = !!(r.blocage && r.blocage.par_moi);
    Array.prototype.forEach.call(menu.querySelectorAll("[data-bloquer]"), function (b) { b.hidden = bloque; });
    document.getElementById("btnDebloquer").hidden = !bloque;
    document.getElementById("btnSignaler").hidden = !!r.deja_signale;
  }
  function agir(corps) {
    fermerMenu();
    return appel(corps).then(function (r) {
      if (r && r.success) { document.getElementById("filAction").removeAttribute("data-etat"); signatureFil = ""; afficherFil(r); chargerListe(); }
      return r;
    });
  }
  btnOptions.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btnOptions.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
  });
  document.addEventListener("click", function (e) { if (!menu.hidden && !menu.contains(e.target)) fermerMenu(); });
  var LIB_DUREE = { "24h": "pendant 24 heures", "7j": "pendant 7 jours", "30j": "pendant 30 jours", "definitif": "définitivement" };
  Array.prototype.forEach.call(menu.querySelectorAll("[data-bloquer]"), function (b) {
    b.addEventListener("click", function () {
      var d = b.getAttribute("data-bloquer");
      var nom = dernierFil && dernierFil.autre ? nomAffiche(dernierFil.autre) : "cette personne";
      if (!window.confirm("Bloquer " + nom + " " + LIB_DUREE[d] + " ? Elle ne pourra plus vous écrire et n'apparaîtra plus dans vos recherches.")) { fermerMenu(); return; }
      agir({ action: "block", cid: courante, duree: d });
    });
  });
  document.getElementById("btnDebloquer").addEventListener("click", function () { agir({ action: "unblock", cid: courante }); });

  var fenSignal = document.getElementById("fenetreSignal");
  var sigMotif = document.getElementById("signalMotif"), sigDetails = document.getElementById("signalDetails");
  var sigErreur = document.getElementById("signalErreur"), sigEnvoyer = document.getElementById("signalEnvoyer");
  function fermerSignal() { fenSignal.hidden = true; }
  document.getElementById("btnSignaler").addEventListener("click", function () {
    fermerMenu();
    sigMotif.value = ""; sigDetails.value = ""; sigErreur.style.display = "none"; sigEnvoyer.disabled = false; sigEnvoyer.textContent = "Envoyer le signalement";
    fenSignal.hidden = false; sigMotif.focus();
  });
  fenSignal.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-fermer-signal]")) fermerSignal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { fermerSignal(); fermerMenu(); } });
  sigEnvoyer.addEventListener("click", function () {
    sigErreur.style.display = "none";
    if (!sigMotif.value) { sigErreur.textContent = "Merci de choisir un motif."; sigErreur.style.display = "block"; sigMotif.focus(); return; }
    sigEnvoyer.disabled = true; sigEnvoyer.textContent = "Envoi…";
    agir({ action: "report", cid: courante, motif: sigMotif.value, details: sigDetails.value.trim() }).then(function (r) {
      if (r && r.success) { fermerSignal(); return; }
      sigEnvoyer.disabled = false; sigEnvoyer.textContent = "Envoyer le signalement";
      sigErreur.textContent = "Le signalement n'a pas pu être envoyé. Réessayez dans un instant."; sigErreur.style.display = "block";
    }).catch(function () { sigEnvoyer.disabled = false; sigEnvoyer.textContent = "Envoyer le signalement"; sigErreur.textContent = "Connexion impossible pour le moment."; sigErreur.style.display = "block"; });
  });

  function ouvrir(cid) {
    courante = cid;
    signatureFil = ""; signatureListe = "";
    document.getElementById("filAction").removeAttribute("data-etat");
    return appel({ action: "open", cid: cid }).then(function (r) {
      if (r && r.success) { afficherFil(r); document.getElementById("filMessages").scrollTop = 1e9; }
      return chargerListe();
    });
  }
  function repondre(accepte) {
    appel({ action: "answer", cid: courante, accept: accepte }).then(function (r) {
      if (r && r.success) { document.getElementById("filAction").removeAttribute("data-etat"); afficherFil(r); chargerListe(); }
    });
  }

  if (!jeton()) { versConnexion(); return; }
  var depart = parseInt((window.location.search.match(/[?&]c=(\d+)/) || [])[1], 10);
  chargerListe().then(function () { if (depart) ouvrir(depart); });

  // Actualisation automatique (toutes les 3 secondes, et dès le retour sur l'onglet)
  function actualiser() {
    if (enCours || document.hidden) return;
    enCours = true;
    var suite = courante ? appel({ action: "open", cid: courante }).then(function (r) { if (r && r.success) afficherFil(r); }) : Promise.resolve();
    suite.then(chargerListe).then(function () { enCours = false; }, function () { enCours = false; });
  }
  setInterval(actualiser, 3000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) actualiser(); });
  // Ma photo (ou mon cercle à lettre) en haut à droite, comme dans « Mon espace »
  (function () {
    var t = jeton(); if (!t) return;
    fetch("https://n8n.srv936251.hstgr.cloud/webhook/nikah-me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var ent = document.getElementById("avatarEntete");
        if (!ent || !res || !res.success || !res.member) return;
        var m = res.member;
        if (m.photo) { var img = document.createElement("img"); img.alt = "Ma photo"; img.src = m.photo; ent.appendChild(img); return; }
        var fond = m.identity_verified && /^#[0-9a-fA-F]{6}$/.test(m.avatar_color || "") ? m.avatar_color : "#9a9a9a";
        var c = document.createElement("span"); c.className = "avatar-lettre"; c.style.background = fond;
        c.textContent = String(m.display_name || "?").charAt(0).toUpperCase();
        ent.appendChild(c);
      }).catch(function () { /* ignoré */ });
  })();
})();
