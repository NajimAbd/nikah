// Nikah — mon compte : changer son mot de passe, supprimer son compte
(function () {
  "use strict";
  var URL_MOI = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-me";
  var URL_COMPTE = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-account";
  var CLE_JETON = "nikah_jeton";
  function lireJeton() {
    var t = null;
    try { t = localStorage.getItem(CLE_JETON) || sessionStorage.getItem(CLE_JETON); } catch (e) { /* ignoré */ }
    return t && /^[a-f0-9]{64}$/.test(t) ? t : null;
  }
  function oublierJeton() {
    try { localStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
    try { sessionStorage.removeItem(CLE_JETON); } catch (e) { /* ignoré */ }
  }
  function versConnexion() { window.location.replace("connexion.html"); }
  var jeton = lireJeton();
  if (!jeton) { versConnexion(); return; }

  document.getElementById("btnDeconnexion").addEventListener("click", function (e) { e.preventDefault(); oublierJeton(); versConnexion(); });

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

  var ERREURS = {
    mot_de_passe_incorrect: "Le mot de passe actuel n'est pas correct.",
    mot_de_passe_faible: "Le mot de passe doit contenir au moins 10 caractères, dont un caractère spécial.",
    mot_de_passe_identique: "Le nouveau mot de passe doit être différent de l'ancien.",
    compte_bloque: "Trop de tentatives. Pour votre sécurité, réessayez dans 15 minutes."
  };
  var ERREUR_GENERALE = "Une erreur est survenue. Merci de réessayer dans un instant.";
  var ERREUR_RESEAU = "Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.";

  function message(id, texte, ok) {
    var p = document.getElementById(id);
    p.textContent = texte || "";
    p.className = "compte-message" + (texte ? (ok ? " ok" : " erreur") : "");
  }
  function marquer(champs, liste) {
    champs.forEach(function (c) { c.classList.toggle("invalide", liste.indexOf(c) !== -1); });
  }
  function appeler(donnees) {
    donnees.token = jeton;
    return fetch(URL_COMPTE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donnees) }).then(function (r) { return r.json(); });
  }

  // Vérifie la session avant d'afficher la page
  fetch(URL_MOI, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: jeton }) })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res || !res.success) { oublierJeton(); versConnexion(); return; }
      if (res.search) {
        if (res.search.age_min) document.getElementById("ageMin").value = String(parseInt(res.search.age_min, 10));
        if (res.search.age_max) document.getElementById("ageMax").value = String(parseInt(res.search.age_max, 10));
      }
      document.getElementById("chargement").style.display = "none";
      document.getElementById("contenu").style.display = "";
    })
    .catch(function () { document.getElementById("chargement").textContent = ERREUR_RESEAU; });

  // --- Critères de recherche (âge) ---
  var selMin = document.getElementById("ageMin"), selMax = document.getElementById("ageMax");
  for (var an = 18; an <= 99; an++) {
    [selMin, selMax].forEach(function (sel) { var o = document.createElement("option"); o.value = String(an); o.textContent = String(an); sel.appendChild(o); });
  }
  selMin.value = "25"; selMax.value = "45";
  [selMin, selMax].forEach(function (sel) { sel.addEventListener("change", function () { message("criteresMessage", ""); }); });
  var btnCrit = document.getElementById("btnCriteres");
  var texteBtnCrit = btnCrit.textContent;
  document.getElementById("formCriteres").addEventListener("submit", function (e) {
    e.preventDefault();
    var min = parseInt(selMin.value, 10), max = parseInt(selMax.value, 10);
    if (max < min) { message("criteresMessage", "L'âge maximum doit être plus grand que l'âge minimum."); return; }
    btnCrit.disabled = true; btnCrit.textContent = "Enregistrement…";
    appeler({ action: "criteria", age_min: min, age_max: max })
      .then(function (res) {
        btnCrit.disabled = false; btnCrit.textContent = texteBtnCrit;
        if (res && res.success) { message("criteresMessage", "Vos critères ont bien été enregistrés.", true); return; }
        if (res && res.error === "session_invalide") { oublierJeton(); versConnexion(); return; }
        message("criteresMessage", ERREUR_GENERALE);
      })
      .catch(function () { btnCrit.disabled = false; btnCrit.textContent = texteBtnCrit; message("criteresMessage", ERREUR_RESEAU); });
  });

  // --- Changer le mot de passe ---
  var a = document.getElementById("mdpActuel"), n1 = document.getElementById("mdpNouveau"), n2 = document.getElementById("mdpNouveau2");
  var champsMdp = [a, n1, n2];
  champsMdp.forEach(function (c) { c.addEventListener("input", function () { message("mdpMessage", ""); marquer(champsMdp, []); }); });
  var btnMdp = document.getElementById("btnMdp");
  var texteBtnMdp = btnMdp.textContent;
  document.getElementById("formMdp").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!a.value) { message("mdpMessage", "Indiquez votre mot de passe actuel."); marquer(champsMdp, [a]); return; }
    if (n1.value.length < 10 || !/[^A-Za-z0-9]/.test(n1.value)) { message("mdpMessage", ERREURS.mot_de_passe_faible); marquer(champsMdp, [n1]); return; }
    if (n1.value !== n2.value) { message("mdpMessage", "Les deux mots de passe ne sont pas identiques."); marquer(champsMdp, [n2]); return; }
    if (n1.value === a.value) { message("mdpMessage", ERREURS.mot_de_passe_identique); marquer(champsMdp, [n1]); return; }
    btnMdp.disabled = true; btnMdp.textContent = "Enregistrement…";
    appeler({ action: "password", actuel: a.value, nouveau: n1.value })
      .then(function (res) {
        btnMdp.disabled = false; btnMdp.textContent = texteBtnMdp;
        if (res && res.success) {
          champsMdp.forEach(function (c) { c.value = ""; });
          message("mdpMessage", "Votre mot de passe a bien été modifié. Un e-mail de confirmation vous a été envoyé.", true);
          return;
        }
        if (res && res.error === "session_invalide") { oublierJeton(); versConnexion(); return; }
        message("mdpMessage", ERREURS[res && res.error] || ERREUR_GENERALE);
        if (res && res.error === "mot_de_passe_incorrect") marquer(champsMdp, [a]);
      })
      .catch(function () { btnMdp.disabled = false; btnMdp.textContent = texteBtnMdp; message("mdpMessage", ERREUR_RESEAU); });
  });

  // --- Supprimer le compte ---
  var ms = document.getElementById("mdpSuppr"), cs = document.getElementById("caseSuppr");
  ms.addEventListener("input", function () { message("supprMessage", ""); ms.classList.remove("invalide"); });
  cs.addEventListener("change", function () { message("supprMessage", ""); });
  var btnSuppr = document.getElementById("btnSuppr");
  var texteBtnSuppr = btnSuppr.textContent;
  document.getElementById("formSuppr").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!ms.value) { message("supprMessage", "Indiquez votre mot de passe pour confirmer."); ms.classList.add("invalide"); return; }
    if (!cs.checked) { message("supprMessage", "Cochez la case pour confirmer que vous avez compris."); return; }
    if (!window.confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est définitive.")) return;
    btnSuppr.disabled = true; btnSuppr.textContent = "Suppression…";
    appeler({ action: "delete", actuel: ms.value })
      .then(function (res) {
        if (res && res.success) {
          oublierJeton();
          document.getElementById("contenu").style.display = "none";
          document.getElementById("blocSupprime").style.display = "";
          var nav = document.querySelector(".site-nav"); if (nav) nav.style.visibility = "hidden";
          window.scrollTo(0, 0);
          return;
        }
        btnSuppr.disabled = false; btnSuppr.textContent = texteBtnSuppr;
        if (res && res.error === "session_invalide") { oublierJeton(); versConnexion(); return; }
        message("supprMessage", ERREURS[res && res.error] || ERREUR_GENERALE);
        if (res && res.error === "mot_de_passe_incorrect") ms.classList.add("invalide");
      })
      .catch(function () { btnSuppr.disabled = false; btnSuppr.textContent = texteBtnSuppr; message("supprMessage", ERREUR_RESEAU); });
  });
})();
