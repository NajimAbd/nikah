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
    var sigF = JSON.stringify([r.cid, r.statut, r.initiateur, r.messages.map(function (m) { return m.id; })]);
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
      var b = el("div", "bulle " + (m.moi ? "moi" : "autre"));
      b.appendChild(el("div", "", m.texte));
      b.appendChild(el("small", "", heure(m.date)));
      zone.appendChild(b);
    });
    if (enBas) zone.scrollTop = zone.scrollHeight;

    var action = document.getElementById("filAction");
    if (action.getAttribute("data-etat") === r.statut + (r.initiateur ? "1" : "0") && action.firstChild) return;
    action.setAttribute("data-etat", r.statut + (r.initiateur ? "1" : "0"));
    action.innerHTML = "";
    if (r.statut === "demande" && !r.initiateur) {
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
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = champ.value.trim();
        if (!t) return;
        envoyer.disabled = true;
        appel({ action: "send", cid: courante, body: t }).then(function (res) {
          envoyer.disabled = false;
          if (res && res.success) { champ.value = ""; afficherFil(res); chargerListe(); document.getElementById("filMessages").scrollTop = 1e9; }
        }).catch(function () { envoyer.disabled = false; });
      });
      action.appendChild(form);
    }
  }

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
})();
