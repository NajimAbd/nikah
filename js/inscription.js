// Nikah — logique du parcours d'inscription (17 étapes + étape 0)
// Version simple côté client : les réponses sont conservées dans sessionStorage.
// Aucun backend n'est encore connecté ; cet écran sert à valider le parcours
// et la structure des questions avant la mise en place de la base de données
// sur le serveur (nikah_db).

(function () {
  "use strict";

  var STORAGE_KEY = "nikah_inscription";

  var reponses = chargerReponses();

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
      id: "lieu_recherche",
      numero: 3,
      titre: "Où souhaitez-vous trouver votre futur(e) époux(se) ?",
      aide: "Recherchez-vous quelqu'un à proximité, ou êtes-vous ouvert(e) à une rencontre au-delà des frontières ?",
      type: "location"
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
      id: "duree_connaissance",
      numero: 5,
      titre: "Combien de temps souhaitez-vous apprendre à connaître quelqu'un avant de vous engager sérieusement ?",
      type: "radio",
      options: ["1-2 mois", "3-4 mois", "4-12 mois", "1-2 ans"]
    },
    {
      id: "delai_mariage",
      numero: 6,
      titre: "Dans quel délai envisagez-vous de vous marier ?",
      type: "radio",
      options: ["2-4 mois", "4-12 mois", "1-2 ans", "À convenir ensemble"]
    },
    {
      id: "badge_nikah",
      numero: 7,
      titre: "Souhaitez-vous afficher un badge « Prêt(e) pour le Nikah » sur votre profil, pour que les profils compatibles vous repèrent plus facilement ?",
      type: "radio",
      options: ["Oui", "Non", "Je déciderai plus tard"]
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
      id: "priorites",
      numero: 11,
      titre: "Qu'est-ce qui compte le plus pour vous dans votre pratique de l'Islam ?",
      aide: "Plusieurs réponses possibles.",
      type: "checkbox",
      multiple: true,
      options: ["Prière assidue (plusieurs fois par jour)", "Étude du Coran", "Jeûne (Sunnah)", "Sadaqah (aumône)", "Umrah ou Hajj accompli(e)", "Apprentissage de l'arabe"]
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
      id: "corpulence",
      numero: 17,
      titre: "Comment décririez-vous votre silhouette ?",
      type: "radio",
      options: ["Menue", "Mince", "Sportive", "Moyenne", "Quelques kilos en trop", "Forte", "Grande et élégante"]
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

  function afficherEtape(i) {
    var etape = etapes[i];
    var pourcentage = Math.round((i / (etapes.length - 1)) * 100);
    progressFill.style.width = pourcentage + "%";

    if (etape.numero === null) {
      compteur.textContent = "";
    } else if (etape.numero === 0) {
      compteur.textContent = "Dernière étape";
    } else {
      compteur.textContent = "Étape " + etape.numero + " sur 17";
    }

    var html = "";

    if (etape.type === "photo") {
      html += "<h2>" + etape.titre + "</h2>";
      html += "<p class='aide'>" + etape.aide + "</p>";
      html += "<input type='file' accept='image/*' id='champPhoto' class='champ-texte'>";
      html += "<p class='aide' id='apercuNomPhoto'></p>";
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
      html += "<h2>Votre profil est en cours de création</h2>";
      html += "<p class='aide'>Merci pour votre confiance. Vos réponses ont été enregistrées. Dès que la vérification d'identité sera disponible, vous pourrez confirmer votre profil et commencer à recevoir des propositions compatibles.</p>";
      html += "</div>";
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
    if (!reponse) return;

    if (etape.type === "age-range") {
      if (reponse.min) document.getElementById("champAgeMin").value = reponse.min;
      if (reponse.max) document.getElementById("champAgeMax").value = reponse.max;
    } else if (etape.type === "location") {
      if (reponse.pays) document.getElementById("champPays").value = reponse.pays;
      if (reponse.region) document.getElementById("champRegion").value = reponse.region;
      if (reponse.ville) document.getElementById("champVille").value = reponse.ville;
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

    carte.querySelectorAll(".option input").forEach(function (input) {
      input.addEventListener("change", marquerOptionSelectionnee);
    });

    if (etape.type === "photo") {
      var champPhoto = document.getElementById("champPhoto");
      champPhoto.addEventListener("change", function () {
        var nomFichier = champPhoto.files && champPhoto.files[0] ? champPhoto.files[0].name : "";
        document.getElementById("apercuNomPhoto").textContent = nomFichier ? "Fichier sélectionné : " + nomFichier : "";
      });
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
        indexCourant++;
        afficherEtape(indexCourant);
      });
    }
  }

  function enregistrerReponseEtape(etape) {
    if (etape.type === "photo") {
      var champPhoto = document.getElementById("champPhoto");
      reponses[etape.id] = champPhoto.files && champPhoto.files[0] ? champPhoto.files[0].name : null;
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
