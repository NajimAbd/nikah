// Nikah — logique du parcours d'inscription (questions, compte, consentement)
// Version simple côté client : les réponses sont conservées dans sessionStorage.
// Aucun backend n'est encore connecté ; cet écran sert à valider le parcours
// et la structure des questions avant la mise en place de la base de données
// sur le serveur (nikah_db).

(function () {
  "use strict";

  var STORAGE_KEY = "nikah_inscription";
  var URL_INSCRIPTION = "https://n8n.srv936251.hstgr.cloud/webhook/nikah-register";

  var reponses = chargerReponses();
  // Le mot de passe reste uniquement en mémoire : il n'est jamais écrit dans sessionStorage.
  var motDePasse = "";
  var motDePasseConfirmation = "";
  // La photo reste en mémoire dans le navigateur (jamais dans sessionStorage).
  var photoData = "";
  var fluxCamera = null;

  var MESSAGES_ERREUR = {
    email_invalide: "Cette adresse e-mail ne semble pas valide.",
    mot_de_passe_faible: "Votre mot de passe doit contenir au moins 10 caractères, dont un caractère spécial (par exemple ! ? # @ -).",
    genre_manquant: "Merci d'indiquer si vous êtes un homme ou une femme.",
    age_invalide: "Merci d'indiquer une année de naissance valide (majeur(e) uniquement).",
    consentement_manquant: "Votre consentement est nécessaire pour créer votre profil.",
    questionnaire_incomplet: "Certaines réponses essentielles manquent (ce que vous recherchez, vos croyances, votre situation familiale). Revenez en arrière pour les compléter.",
    tranche_age_invalide: "La tranche d'âge recherchée n'est pas valide. Revenez à l'étape 2.",
    email_existe: "Un profil existe déjà avec cette adresse e-mail."
  };

  var etapes = [
    {
      id: "photo",
      numero: 1,
      titre: "Ajoutez votre plus belle photo",
      aide: "Utilisez une photo récente, nette et bien éclairée, où l'on vous voit seul(e). Évitez les photos floues, sombres ou retouchées.",
      type: "photo"
    },
    {
      id: "age_recherche",
      numero: 2,
      titre: "Dans quelle tranche d'âge recherchez-vous votre futur(e) époux(se) ?",
      aide: "Affinez votre recherche pour trouver des profils compatibles avec vos critères.",
      type: "age-range"
    },
    {
      id: "type_relation",
      numero: 4,
      titre: "Que recherchez-vous ?",
      aide: "La sincérité aide chacun à trouver ce qu'il cherche. Vous pourrez modifier ce choix à tout moment.",
      type: "checkbox",
      multiple: true,
      options: ["Mariage", "Échange sérieux en vue du mariage"]
    },
    {
      id: "delai_mariage",
      numero: 6,
      titre: "Dans quel délai envisagez-vous de vous marier ?",
      type: "radio",
      options: ["1-2 mois", "2-4 mois", "4-6 mois", "À convenir ensemble"]
    },
    {
      id: "origine",
      numero: 8,
      titre: "Votre origine est principalement :",
      type: "radio",
      options: ["Arabe (Moyen-Orient)", "Asiatique", "Afro-descendante", "Caucasienne", "Hispanique / Latino", "Indienne", "Mixte", "Autre", "Je préfère ne pas répondre"]
    },
    {
      id: "croyance",
      numero: 9,
      titre: "Laquelle de ces propositions décrit le mieux vos croyances ?",
      type: "radio",
      options: ["Islam — Sunnite", "Islam — Chiite", "Islam — Soufi", "Islam — Ahmadiyya", "Islam — Autre", "En cours de réversion (conversion à l'Islam)", "Je préfère ne pas répondre", "Autre"]
    },
    {
      id: "pratique",
      numero: 10,
      titre: "Comment décririez-vous votre pratique religieuse ?",
      type: "radio",
      options: ["Très pratiquant(e)", "Pratiquant(e)", "Peu pratiquant(e)"]
    },
    {
      id: "alcool",
      numero: 12,
      titre: "Consommez-vous de l'alcool ?",
      type: "radio",
      options: ["Oui", "Occasionnellement", "Non", "Je préfère ne pas répondre"]
    },
    {
      id: "tabac",
      numero: 13,
      titre: "Fumez-vous ?",
      type: "radio",
      options: ["Oui", "Non", "Occasionnellement"]
    },
    {
      id: "enfants",
      numero: 14,
      titre: "Souhaitez-vous avoir des enfants (ou en avoir d'autres) ?",
      type: "radio",
      options: ["Oui", "Je ne sais pas encore", "Non"]
    },
    {
      id: "situation_familiale",
      numero: 15,
      titre: "Quelle est votre situation familiale actuelle ?",
      type: "radio",
      options: ["Célibataire", "Séparé(e)", "Divorcé(e)", "Veuf / Veuve", "Autre", "Je préfère ne pas répondre"]
    },
    {
      id: "apparence",
      numero: 16,
      titre: "Comment décririez-vous votre apparence ?",
      type: "radio",
      options: ["En dessous de la moyenne", "Dans la moyenne", "Attirant(e)", "Très attirant(e)"]
    },
    {
      id: "sante",
      titre: "Avez-vous un problème de santé qui pourrait empêcher ou compliquer votre mariage ?",
      aide: "Dans un esprit de transparence et de sincérité, avant tout engagement. Vous pourrez en parler plus en détail plus tard.",
      type: "radio",
      options: ["Non", "Oui", "Je préfère en parler plus tard"]
    },
    {
      id: "a_propos",
      numero: null,
      titre: "Quelques informations sur vous",
      aide: "Ces informations permettent de vous proposer des profils compatibles. Votre date de naissance exacte n'est jamais affichée.",
      type: "about"
    },
    {
      id: "acces",
      numero: null,
      titre: "Créez votre accès personnel",
      aide: "Votre adresse e-mail sert à vous connecter et à recevoir les messages importants de votre compte.",
      type: "compte"
    },
    {
      id: "consentement",
      numero: 0,
      type: "consent"
    },
    {
      id: "merci",
      numero: null,
      type: "thanks"
    }
  ];

  var indexCourant = 0;
  var carte = document.getElementById("carteQuestion");
  var progressFill = document.getElementById("progressFill");
  var compteur = document.getElementById("etapeCompteur");

  function chargerReponses() {
    try {
      var brut = sessionStorage.getItem(STORAGE_KEY);
      return brut ? JSON.parse(brut) : {};
    } catch (e) {
      return {};
    }
  }

  function sauvegarderReponses() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reponses));
    } catch (e) {
      /* stockage indisponible : on continue sans persister */
    }
  }

  function creerOptionsSelectAge() {
    var html = "<option value=''>—</option>";
    for (var a = 18; a <= 70; a++) {
      html += "<option value='" + a + "'>" + a + " ans</option>";
    }
    return html;
  }

  var SVG_OEIL = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z'/><circle cx='12' cy='12' r='3'/></svg>";
  var SVG_OEIL_BARRE = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M17.94 17.94A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94'/><path d='M9.9 4.24A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19'/><path d='M14.12 14.12A3 3 0 1 1 9.88 9.88'/><line x1='1' y1='1' x2='23' y2='23'/></svg>";

  function champMotDePasse(id, placeholder) {
    return "<div class='mdp-wrap'><input type='password' id='" + id + "' class='champ-texte' placeholder='" + placeholder + "' autocomplete='new-password'>" +
      "<button type='button' class='mdp-oeil' data-cible='" + id + "' aria-label='Afficher le mot de passe'>" + SVG_OEIL + "</button></div>";
  }

  function brancherOeils() {
    var boutons = carte.querySelectorAll(".mdp-oeil");
    Array.prototype.forEach.call(boutons, function (bouton) {
      bouton.addEventListener("click", function () {
        var champ = document.getElementById(bouton.getAttribute("data-cible"));
        var visible = champ.type === "text";
        champ.type = visible ? "password" : "text";
        bouton.innerHTML = visible ? SVG_OEIL : SVG_OEIL_BARRE;
        bouton.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe");
      });
    });
  }

  // Lieu d'habitation : listes automatiques (canton, commune) pour la Suisse, texte libre ailleurs
  function majLieu(region, ville) {
    var bloc = document.getElementById("blocLieu");
    var pays = document.getElementById("champMonPays").value;
    var cantons = window.COMMUNES_CH || {};
    var html = "";
    if (pays === "Suisse" && Object.keys(cantons).length) {
      html += "<select id='champMaRegion' class='champ-select'><option value=''>Canton</option>";
      Object.keys(cantons).forEach(function (c) { html += "<option>" + c + "</option>"; });
      html += "</select>";
      html += "<input type='text' id='champMaVille' class='champ-texte' list='listeVilles' placeholder='Commune (choisissez dans la liste)' autocomplete='off'>";
      html += "<datalist id='listeVilles'></datalist>";
    } else {
      html += "<input type='text' id='champMaRegion' class='champ-texte' placeholder='Région'>";
      html += "<input type='text' id='champMaVille' class='champ-texte' placeholder='Ville'>";
    }
    bloc.innerHTML = html;
    var champRegion = document.getElementById("champMaRegion");
    var champVille = document.getElementById("champMaVille");
    function remplirVilles() {
      var liste = document.getElementById("listeVilles");
      if (!liste) return;
      var villes = cantons[champRegion.value] || [];
      liste.innerHTML = villes.map(function (v) { return "<option value=\"" + v.replace(/"/g, "&quot;") + "\">"; }).join("");
    }
    if (region) champRegion.value = region;
    if (ville) champVille.value = ville;
    remplirVilles();
    [champRegion, champVille].forEach(function (c) {
      c.addEventListener("input", function () { c.classList.remove("invalide"); effacerErreurs(); });
      c.addEventListener("change", function () {
        c.classList.remove("invalide"); effacerErreurs();
        if (c === champRegion && document.getElementById("listeVilles")) { champVille.value = ""; remplirVilles(); }
      });
    });
  }

  function afficherEtape(i) {
    arreterCamera();
    var etape = etapes[i];
    var pourcentage = Math.round((i / (etapes.length - 1)) * 100);
    progressFill.style.width = pourcentage + "%";

    var TYPES_QUESTION = ["photo", "age-range", "radio", "checkbox"];
    var totalQuestions = etapes.filter(function (e) { return TYPES_QUESTION.indexOf(e.type) > -1; }).length;
    var positionQuestion = etapes.slice(0, i + 1).filter(function (e) { return TYPES_QUESTION.indexOf(e.type) > -1; }).length;

    if (etape.type === "thanks") {
      compteur.textContent = "";
    } else if (etape.type === "about" || etape.type === "compte") {
      compteur.textContent = "Presque terminé";
    } else if (etape.type === "consent") {
      compteur.textContent = "Dernière étape";
    } else {
      compteur.textContent = "Étape " + positionQuestion + " sur " + totalQuestions;
    }

    var html = "";

    if (etape.type === "photo") {
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<div class='photo-zone'>";
      html += "<div class='photo-apercu' id='photoApercu'><span id='photoVide'>Aucune photo</span></div>";
      html += "<video id='photoVideo' class='photo-video' autoplay playsinline muted style='display:none;'></video>";
      html += "<div class='photo-actions'>";
      html += "<button type='button' class='btn btn-primary' id='btnPrendrePhoto'>Prendre une photo</button>";
      html += "<button type='button' class='btn btn-outline' id='btnChoisirPhoto'>Choisir dans mes fichiers</button>";
      html += "<button type='button' class='btn btn-primary' id='btnCapturer' style='display:none;'>Capturer</button>";
      html += "</div>";
      html += "<p class='aide' id='photoMessage'></p>";
      html += "<input type='file' accept='image/*' id='champPhotoFichier' style='display:none;'>";
      html += "<input type='file' accept='image/*' capture='user' id='champPhotoCamera' style='display:none;'>";
      html += "</div>";
    }

    else if (etape.type === "age-range") {
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<div class='deux-colonnes'>";
      html += "<select id='champAgeMin' class='champ-select'>" + creerOptionsSelectAge() + "</select>";
      html += "<select id='champAgeMax' class='champ-select'>" + creerOptionsSelectAge() + "</select>";
      html += "</div>";
    }

    else if (etape.type === "location") {
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<select id='champPays' class='champ-select'>" +
        "<option value=''>Tous pays</option>" +
        "<option>Suisse</option><option>France</option><option>Belgique</option>" +
        "<option>Maroc</option><option>Algérie</option><option>Tunisie</option>" +
        "<option>Autre</option></select>";
      html += "<input type='text' id='champRegion' class='champ-texte' placeholder='Canton / région'>";
      html += "<input type='text' id='champVille' class='champ-texte' placeholder='Ville'>";
    }

    else if (etape.type === "radio" || etape.type === "checkbox") {
      html += "<h2>" + etape.titre + "</h2>";
      if (etape.aide) html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<div class='options'>";
      etape.options.forEach(function (opt, idx) {
        var champType = etape.multiple ? "checkbox" : "radio";
        var id = etape.id + "_" + idx;
        html += "<label class='option' for='" + id + "'>" +
          "<input type='" + champType + "' name='" + etape.id + "' id='" + id + "' value='" + opt.replace(/'/g, "&#39;") + "'> " +
          opt + "</label>";
      });
      html += "</div>";
    }

    else if (etape.type === "about") {
      var anneeMax = new Date().getFullYear() - 18;
      var optionsAnnee = "<option value=''>Année de naissance</option>";
      for (var an = anneeMax; an >= 1930; an--) {
        optionsAnnee += "<option value='" + an + "'>" + an + "</option>";
      }
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<div class='options'>";
      html += "<label class='option' for='genre_homme'><input type='radio' name='genre' id='genre_homme' value='homme'> Je suis un homme</label>";
      html += "<label class='option' for='genre_femme'><input type='radio' name='genre' id='genre_femme' value='femme'> Je suis une femme</label>";
      html += "</div>";
      html += "<p class='aide' style='margin-top:1.2em;'>Votre année de naissance</p>";
      html += "<select id='champAnnee' class='champ-select'>" + optionsAnnee + "</select>";
      html += "<p class='aide'>Où habitez-vous ?</p>";
      html += "<select id='champMonPays' class='champ-select'>" +
        "<option value=''>Pays</option>" +
        "<option>Suisse</option><option>France</option><option>Belgique</option>" +
        "<option>Maroc</option><option>Algérie</option><option>Tunisie</option>" +
        "<option>Autre</option></select>";
      html += "<div id='blocLieu'></div>";
    }

    else if (etape.type === "compte") {
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<input type='email' id='champEmail' class='champ-texte' placeholder='Adresse e-mail' autocomplete='email'>";
      html += champMotDePasse("champMotDePasse", "Mot de passe");
      html += champMotDePasse("champMotDePasse2", "Confirmez le mot de passe");
      html += "<p class='aide'>Au moins 10 caractères, dont un caractère spécial (par exemple ! ? # @ -).</p>";
    }

    else if (etape.type === "consent") {
      html += "<h2>Votre consentement avant la création de votre profil</h2>";
      html += "<div class='consentement-texte'>";
      html += "<p>Avant de valider votre profil, nous avons besoin de votre accord pour :</p>";
      html += "<ul>";
      html += "<li>créer et afficher votre profil aux autres membres de la plateforme, selon vos critères de confidentialité ;</li>";
      html += "<li>utiliser vos réponses pour vous proposer des profils compatibles ;</li>";
      html += "<li>vous contacter par e-mail au sujet de votre compte (confirmation, sécurité, mises à jour importantes).</li>";
      html += "</ul>";
      html += "<p>Nous ne vendons ni ne partageons vos données avec des tiers à des fins publicitaires. Tous les échanges entre membres passent exclusivement par la plateforme. Vous pouvez demander la suppression de votre profil et de vos données à tout moment.</p>";
      html += "<p style='margin-top:1.2em;'><a href='confidentialite.html' target='_blank'>En savoir plus sur la politique de confidentialité →</a></p>";
      html += "</div>";
    }

    else if (etape.type === "thanks") {
      html += "<div class='ecran-merci'>";
      html += "<div class='icone'>🕊️</div>";
      html += "<h2>Votre profil a bien été créé</h2>";
      html += "<p class='aide'>Merci pour votre confiance. Vos réponses sont enregistrées. Votre profil restera masqué aux autres membres jusqu'à la vérification de votre identité. Nous vous écrirons par e-mail pour la suite.</p>";
      html += "</div>";
    }

    if (etape.type !== "thanks") {
      html += "<p id='messageErreur' style='color:#a33; font-family:Helvetica,Arial,sans-serif; font-size:0.9rem; margin-top:14px; display:none;'></p>";
    }

    html += "<div class='nav-questionnaire'>";
    if (etape.type !== "thanks") {
      if (i > 0) {
        html += "<button class='btn btn-ghost' id='btnPrecedent'>Précédent</button>";
      } else {
        html += "<span></span>";
      }
      if (etape.type === "consent") {
        html += "<button class='btn btn-primary' id='btnSuivant'>J'accepte et je crée mon profil</button>";
      } else {
        html += "<button class='btn btn-primary' id='btnSuivant'>Suivant</button>";
      }
    } else {
      html += "<a href='index.html' class='btn btn-outline'>Retour à l'accueil</a>";
    }
    html += "</div>";

    carte.innerHTML = html;
    preRemplirChamps(etape);
    attacherEvenements(etape, i);
  }

  function preRemplirChamps(etape) {
    var reponse = reponses[etape.id];
    if (!reponse) {
      if (etape.type === "about") majLieu();
      return;
    }

    if (etape.type === "age-range") {
      if (reponse.min) document.getElementById("champAgeMin").value = reponse.min;
      if (reponse.max) document.getElementById("champAgeMax").value = reponse.max;
    } else if (etape.type === "location") {
      if (reponse.pays) document.getElementById("champPays").value = reponse.pays;
      if (reponse.region) document.getElementById("champRegion").value = reponse.region;
      if (reponse.ville) document.getElementById("champVille").value = reponse.ville;
    } else if (etape.type === "about") {
      if (reponse.genre) {
        var radioGenre = document.getElementById("genre_" + reponse.genre);
        if (radioGenre) radioGenre.checked = true;
      }
      if (reponse.annee) document.getElementById("champAnnee").value = reponse.annee;
      if (reponse.pays) document.getElementById("champMonPays").value = reponse.pays;
      majLieu(reponse.region, reponse.ville);
    } else if (etape.type === "compte") {
      if (reponse.email) document.getElementById("champEmail").value = reponse.email;
    } else if (etape.type === "radio") {
      var inputRadio = document.querySelector("input[name='" + etape.id + "'][value='" + (reponse || "").replace(/'/g, "&#39;") + "']");
      if (inputRadio) inputRadio.checked = true;
    } else if (etape.type === "checkbox") {
      (reponse || []).forEach(function (val) {
        var inputCheckbox = document.querySelector("input[name='" + etape.id + "'][value='" + val.replace(/'/g, "&#39;") + "']");
        if (inputCheckbox) inputCheckbox.checked = true;
      });
    }
  }

  function marquerOptionSelectionnee() {
    var options = carte.querySelectorAll(".option");
    options.forEach(function (opt) {
      var input = opt.querySelector("input");
      if (input && input.checked) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }

  function attacherEvenements(etape, i) {
    marquerOptionSelectionnee();
    if (etape.type === "compte") brancherOeils();
    if (etape.type === "about") {
      document.getElementById("champMonPays").addEventListener("change", function () { majLieu(); });
    }

    carte.querySelectorAll(".option input").forEach(function (input) {
      input.addEventListener("change", marquerOptionSelectionnee);
    });
    carte.querySelectorAll("input, select").forEach(function (champ) {
      champ.addEventListener("change", effacerErreurs);
      champ.addEventListener("input", effacerErreurs);
    });

    if (etape.type === "photo") {
      initialiserPhoto();
    }

    var btnPrecedent = document.getElementById("btnPrecedent");
    if (btnPrecedent) {
      btnPrecedent.addEventListener("click", function () {
        indexCourant--;
        afficherEtape(indexCourant);
      });
    }

    var btnSuivant = document.getElementById("btnSuivant");
    if (btnSuivant) {
      btnSuivant.addEventListener("click", function () {
        enregistrerReponseEtape(etape);
        sauvegarderReponses();

        var probleme = validerEtape(etape);
        if (probleme) {
          afficherErreur(probleme);
          return;
        }

        if (etape.type === "consent") {
          var aCorriger = premiereEtapeIncomplete();
          if (aCorriger > -1) {
            allerCorriger(aCorriger, "");
            return;
          }
          envoyerInscription(btnSuivant);
          return;
        }

        indexCourant++;
        afficherEtape(indexCourant);
      });
    }
  }

  function arreterCamera() {
    if (fluxCamera) {
      fluxCamera.getTracks().forEach(function (t) { t.stop(); });
      fluxCamera = null;
    }
  }

  function afficherApercuPhoto() {
    var zone = document.getElementById("photoApercu");
    if (!zone) return;
    if (photoData) {
      zone.innerHTML = "<img alt='Votre photo' src='" + photoData + "'>";
    } else {
      zone.innerHTML = "<span id='photoVide'>Aucune photo</span>";
    }
  }

  // Réduit la photo (800 px max) et la convertit en JPEG léger.
  function traiterImage(source, largeur, hauteur) {
    var max = 800;
    var ratio = Math.min(1, max / Math.max(largeur, hauteur));
    var canvas = document.createElement("canvas");
    canvas.width = Math.round(largeur * ratio);
    canvas.height = Math.round(hauteur * ratio);
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    photoData = canvas.toDataURL("image/jpeg", 0.85);
    afficherApercuPhoto();
    effacerErreurs();
  }

  function lireFichierPhoto(fichier) {
    if (!fichier) return;
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var img = new Image();
      img.onload = function () { traiterImage(img, img.width, img.height); };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  }

  function initialiserPhoto() {
    var message = document.getElementById("photoMessage");
    var video = document.getElementById("photoVideo");
    var btnPrendre = document.getElementById("btnPrendrePhoto");
    var btnChoisir = document.getElementById("btnChoisirPhoto");
    var btnCapturer = document.getElementById("btnCapturer");
    var champFichier = document.getElementById("champPhotoFichier");
    var champCamera = document.getElementById("champPhotoCamera");

    afficherApercuPhoto();

    btnChoisir.addEventListener("click", function () { champFichier.click(); });
    champFichier.addEventListener("change", function () { lireFichierPhoto(champFichier.files[0]); });
    champCamera.addEventListener("change", function () { lireFichierPhoto(champCamera.files[0]); });

    btnPrendre.addEventListener("click", function () {
      message.textContent = "";
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        champCamera.click();
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then(function (flux) {
          fluxCamera = flux;
          video.srcObject = flux;
          video.style.display = "block";
          document.getElementById("photoApercu").style.display = "none";
          btnCapturer.style.display = "inline-block";
          btnPrendre.style.display = "none";
        })
        .catch(function () {
          message.textContent = "La caméra n'a pas pu s'ouvrir (accès refusé ?). Vous pouvez choisir une photo dans vos fichiers.";
          champCamera.click();
        });
    });

    btnCapturer.addEventListener("click", function () {
      if (!video.videoWidth) return;
      traiterImage(video, video.videoWidth, video.videoHeight);
      arreterCamera();
      video.style.display = "none";
      document.getElementById("photoApercu").style.display = "flex";
      btnCapturer.style.display = "none";
      btnPrendre.style.display = "inline-block";
      btnPrendre.textContent = "Reprendre la photo";
    });
  }

  function afficherErreur(message, indexCorrection) {
    var zone = document.getElementById("messageErreur");
    if (!zone) return;
    zone.textContent = message;
    zone.style.display = message ? "block" : "none";
    if (message && typeof indexCorrection === "number") {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-primary btn-corriger";
      b.textContent = "Corriger maintenant";
      b.addEventListener("click", function () { allerCorriger(indexCorrection, message); });
      zone.appendChild(document.createElement("br"));
      zone.appendChild(b);
    }
  }

  function indexEtape(id) {
    for (var k = 0; k < etapes.length; k++) if (etapes[k].id === id) return k;
    return -1;
  }

  // Emmène directement la personne sur l'étape à corriger, champs fautifs en rouge
  function allerCorriger(i, message) {
    indexCourant = i;
    afficherEtape(i);
    var probleme = validerEtape(etapes[i]);
    var texte = probleme || message || "";
    if (!probleme && etapes[i].id === "acces") marquer("#champEmail");
    afficherErreur(texte);
    window.scrollTo(0, 0);
  }

  // Première étape dont les réponses manquent ou sont invalides (-1 si tout est bon)
  function premiereEtapeIncomplete() {
    var limite = indexEtape("consentement");
    var trouve = -1;
    for (var k = 0; k < limite && trouve < 0; k++) {
      if (validerEtape(etapes[k])) trouve = k;
    }
    effacerErreurs();
    return trouve;
  }

  function etapePourErreur(code) {
    if (["email_invalide", "mot_de_passe_faible", "email_existe"].indexOf(code) > -1) return indexEtape("acces");
    if (["genre_manquant", "age_invalide"].indexOf(code) > -1) return indexEtape("a_propos");
    if (code === "tranche_age_invalide") return indexEtape("age_recherche");
    if (code === "questionnaire_incomplet") {
      var ids = ["type_relation", "croyance", "situation_familiale"];
      for (var k = 0; k < ids.length; k++) {
        var v = reponses[ids[k]];
        if (!v || (Array.isArray(v) && !v.length)) return indexEtape(ids[k]);
      }
    }
    return -1;
  }

  function marquer(selecteur) {
    var elements = carte.querySelectorAll(selecteur);
    for (var k = 0; k < elements.length; k++) elements[k].classList.add("invalide");
  }

  function effacerErreurs() {
    var marques = carte.querySelectorAll(".invalide");
    for (var k = 0; k < marques.length; k++) marques[k].classList.remove("invalide");
    afficherErreur("");
  }

  function validerEtape(etape) {
    var MSG_CHOIX = "Merci de répondre à cette question pour continuer.";

    if (etape.type === "photo") {
      if (!photoData) {
        marquer("#photoApercu");
        return "Merci d'ajouter une photo pour continuer (prise avec la caméra ou choisie dans vos fichiers).";
      }
    }
    if (etape.type === "age-range") {
      var r = reponses[etape.id] || {};
      var min = parseInt(r.min, 10);
      var max = parseInt(r.max, 10);
      if (!min || !max) {
        if (!min) marquer("#champAgeMin");
        if (!max) marquer("#champAgeMax");
        return "Merci de choisir un âge minimum et un âge maximum.";
      }
      if (min > max) {
        marquer("#champAgeMin");
        marquer("#champAgeMax");
        return "L'âge minimum ne peut pas être supérieur à l'âge maximum.";
      }
    }
    if (etape.type === "radio") {
      if (!reponses[etape.id]) {
        marquer(".options");
        return MSG_CHOIX;
      }
    }
    if (etape.type === "checkbox") {
      if (!reponses[etape.id] || !reponses[etape.id].length) {
        marquer(".options");
        return MSG_CHOIX;
      }
    }
    if (etape.type === "about") {
      var a = reponses[etape.id] || {};
      var manque = false;
      if (!a.genre) { marquer(".options"); manque = true; }
      if (!a.annee) { marquer("#champAnnee"); manque = true; }
      if (!a.pays) { marquer("#champMonPays"); manque = true; }
      if (a.pays === "Suisse" && !a.region) { marquer("#champMaRegion"); manque = true; }
      if (!a.ville) { marquer("#champMaVille"); manque = true; }
      if (manque) return "Merci de compléter tous les champs marqués en rouge pour continuer.";
    }
    if (etape.type === "compte") {
      var c = reponses[etape.id] || {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email || "")) {
        marquer("#champEmail");
        return MESSAGES_ERREUR.email_invalide;
      }
      if (motDePasse.length < 10 || !/[^A-Za-z0-9]/.test(motDePasse)) {
        marquer("#champMotDePasse");
        return MESSAGES_ERREUR.mot_de_passe_faible;
      }
      if (motDePasse !== motDePasseConfirmation) {
        marquer("#champMotDePasse2");
        return "Les deux mots de passe ne sont pas identiques.";
      }
    }
    return "";
  }

  function envoyerInscription(bouton) {
    var apropos = reponses.a_propos || {};
    var acces = reponses.acces || {};
    var answers = {};
    Object.keys(reponses).forEach(function (cle) {
      if (["photo", "a_propos", "acces", "consentement_donne_le"].indexOf(cle) === -1) {
        answers[cle] = reponses[cle];
      }
    });

    var charge = {
      gender: apropos.genre,
      birth_year: apropos.annee,
      email: acces.email,
      password: motDePasse,
      consent: true,
      location: { pays: apropos.pays, region: apropos.region, ville: apropos.ville },
      answers: answers
    };

    bouton.disabled = true;
    bouton.textContent = "Création en cours…";
    afficherErreur("");

    fetch(URL_INSCRIPTION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(charge)
    })
      .then(function (reponseHttp) { return reponseHttp.json(); })
      .then(function (resultat) {
        if (resultat && resultat.success) {
          motDePasse = "";
          motDePasseConfirmation = "";
          photoData = "";
          try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignoré */ }
          reponses = {};
          indexCourant++;
          afficherEtape(indexCourant);
        } else {
          bouton.disabled = false;
          bouton.textContent = "J'accepte et je crée mon profil";
          var code = resultat && resultat.error;
          var cible = etapePourErreur(code);
          afficherErreur(MESSAGES_ERREUR[code] || "Une erreur est survenue. Merci de réessayer dans un instant.", cible > -1 ? cible : undefined);
        }
      })
      .catch(function () {
        bouton.disabled = false;
        bouton.textContent = "J'accepte et je crée mon profil";
        afficherErreur("Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.");
      });
  }

  function enregistrerReponseEtape(etape) {
    if (etape.type === "about") {
      var genreCoche = carte.querySelector("input[name='genre']:checked");
      reponses[etape.id] = {
        genre: genreCoche ? genreCoche.value : "",
        annee: document.getElementById("champAnnee").value,
        pays: document.getElementById("champMonPays").value,
        region: document.getElementById("champMaRegion").value,
        ville: document.getElementById("champMaVille").value
      };
      return;
    }
    if (etape.type === "compte") {
      motDePasse = document.getElementById("champMotDePasse").value;
      motDePasseConfirmation = document.getElementById("champMotDePasse2").value;
      reponses[etape.id] = {
        email: document.getElementById("champEmail").value.trim()
      };
      return;
    }
    if (etape.type === "photo") {
      arreterCamera();
      reponses[etape.id] = photoData ? "ajoutee" : null;
    } else if (etape.type === "age-range") {
      reponses[etape.id] = {
        min: document.getElementById("champAgeMin").value,
        max: document.getElementById("champAgeMax").value
      };
    } else if (etape.type === "location") {
      reponses[etape.id] = {
        pays: document.getElementById("champPays").value,
        region: document.getElementById("champRegion").value,
        ville: document.getElementById("champVille").value
      };
    } else if (etape.type === "radio") {
      var coche = carte.querySelector("input[name='" + etape.id + "']:checked");
      reponses[etape.id] = coche ? coche.value : null;
    } else if (etape.type === "checkbox") {
      var coches = carte.querySelectorAll("input[name='" + etape.id + "']:checked");
      reponses[etape.id] = Array.prototype.map.call(coches, function (c) { return c.value; });
    } else if (etape.type === "consent") {
      reponses.consentement_donne_le = new Date().toISOString();
    }
  }

  afficherEtape(indexCourant);
})();
