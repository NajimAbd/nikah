// Nikah — détection des coordonnées (téléphone, e-mail, réseaux sociaux, liens, demandes de contact hors du site)
// Le même code tourne dans le navigateur et sur le serveur (n8n). Retourne null si le message est autorisé,
// sinon le type de coordonnée détectée : "telephone", "email", "reseau", "lien" ou "demande".
var NikahFiltre = (function () {
  "use strict";

  var CHIFFRES_MOTS = {
    // français
    zero: "0", un: "1", une: "1", deux: "2", trois: "3", quatre: "4", cinq: "5", six: "6", sept: "7", huit: "8", neuf: "9",
    dix: "10", onze: "11", douze: "12", treize: "13", quatorze: "14", quinze: "15", seize: "16", cette: "7", neuve: "9",
    // anglais
    oh: "0", one: "1", two: "2", three: "3", four: "4", five: "5", seven: "7", eight: "8", nine: "9", ten: "10",
    // allemand
    null: "0", eins: "1", zwei: "2", zwo: "2", drei: "3", vier: "4", funf: "5", fuenf: "5", sechs: "6", sieben: "7", acht: "8", neun: "9", zehn: "10",
    // italien
    uno: "1", due: "2", tre: "3", quattro: "4", cinque: "5", sei: "6", sette: "7", otto: "8", nove: "9", dieci: "10",
    // albanais
    nje: "1", dy: "2", kater: "4", pese: "5", gjashte: "6", shtate: "7", tete: "8", nente: "9",
    // arabe (écriture arabe et translittération courante)
    "صفر": "0", "واحد": "1", "اثنان": "2", "اثنين": "2", "زوج": "2", "ثلاثة": "3", "ثلاث": "3", "أربعة": "4", "اربعة": "4", "خمسة": "5", "ستة": "6", "سبعة": "7", "ثمانية": "8", "تسعة": "9",
    sifr: "0", wahed: "1", wa7ed: "1", jouj: "2", tnin: "2", tlata: "3", arba: "4", khamsa: "5", setta: "6", sab3a: "7", tmanya: "8", tes3a: "9"
  };
  var DIZAINES = {
    vingt: "2", trente: "3", quarante: "4", cinquante: "5", soixante: "6", septante: "7", huitante: "8", octante: "8", nonante: "9",
    twenty: "2", thirty: "3", forty: "4", fifty: "5", sixty: "6", seventy: "7", eighty: "8", ninety: "9",
    venti: "2", trenta: "3", quaranta: "4", cinquanta: "5", sessanta: "6", settanta: "7", ottanta: "8", novanta: "9"
  };
  var LIANTS = { et: 1, puis: 1, apres: 1, and: 1, then: 1, le: 1, la: 1, c: 1, est: 1, cest: 1, und: 1, e: 1, plus: 1 };

  // Mots longs repérés même s'ils sont écrits avec des espaces, des points ou des chiffres à la place des lettres
  var RESEAUX_COLLES = ["whatsapp", "whatsap", "watsap", "watsapp", "wathsapp", "whatapp", "telegram", "snapchat", "instagram", "facebook", "messenger",
    "tiktok", "viber", "skype", "discord", "linkedin", "wechat", "threema"];
  var EMAILS_COLLES = ["gmail", "hotmail", "outlook", "yahoo", "icloud", "protonmail", "bluewin", "laposte", "wanadoo"];
  var RESEAUX_MOTS = /(^|\s)(snap|insta|whats|wsp|wtsp|wtsap|ig|fb|tg|imo|signal app|sur signal|on signal|tele|telegrame)(\s|$)/;
  var RESEAUX_ARABE = /(واتساب|واتس|وتساب|تلغرام|تيليجرام|انستغرام|انستقرام|انستا|سناب|فيسبوك|فيس بوك|ايميل|إيميل|الإيميل|رقمك|رقم هاتفك|رقم الهاتف|هاتفك|تلفونك|جوالك|نمرتك|النمرة)/;
  var DEMANDES = new RegExp(
    "(\\b(ton|ta|tes|votre|vos|mon|ma|mes|your|my|dein|deine|deinen|meine|mein|meinen|tuo|tua|il tuo|la tua|mio|mia|jot|im|yt)\\s+(\\w+\\s+)?" +
    "(numero|num|numeros|tel|tele|telephone|portable|natel|mobile|cell|cellulaire|cellulare|handy|handynummer|nummer|telefon|telefonnummer|telefono|phone|number|mail|email|mails|adresse mail|adresse email|contact|contacts|coordonnees|numri|numrin|telefoni|telefonin)\\b)" +
    "|\\b(numri|numrin|telefoni|telefonin|emaili|emailin|numero|nummer)\\s+(tend|tuaj|tuo|tua|vostro|di te)\\b" +
    "|\\b(appelle moi|appelez moi|appele moi|je t appelle|je vous appelle|on s appelle|on peut s appeler|tu peux m appeler|call me|text me|ruf mich an|chiamami|ecris moi sur|ecris moi en prive|ecrivez moi sur|en prive|en mp|hors du site|hors de la plateforme|hors plateforme|ailleurs qu ici|ajoute moi|ajoutez moi|add me|contacte moi sur|contactez moi sur)\\b");

  function normaliser(t) {
    var s = String(t || "");
    try { s = s.normalize("NFKC"); } catch (e) { /* ancien navigateur */ }
    s = s.replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
         .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); })
         .replace(/[️⃣​-‍⁠]/g, "");
    try { s = s.normalize("NFD"); } catch (e) { /* ignoré */ }
    return s.replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function leet(s) {
    return s.replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/@/g, "a").replace(/\$/g, "s").replace(/\|/g, "i");
  }

  function chiffres(s) {
    // Enlève dates et heures pour ne pas les confondre avec un numéro
    s = s.replace(/\b\d{1,2}\s*[.\/-]\s*\d{1,2}\s*[.\/-]\s*\d{2,4}\b/g, " ")
         .replace(/\b\d{1,2}\s*[h:]\s*\d{2}\b/g, " ");
    var mots = s.replace(/[-_'’]/g, " ").split(/[^a-z0-9+؀-ۿ]+/).filter(Boolean);
    var meilleur = 0, courant = "", trous = 0;
    function fin() { if (courant.length > meilleur) meilleur = courant.length; courant = ""; trous = 0; }
    for (var i = 0; i < mots.length; i++) {
      var m = mots[i], ajout = null;
      if (/^\+?\d+$/.test(m)) ajout = m.replace("+", "");
      else if (/^[0-9oil]+$/.test(m) && /\d/.test(m)) ajout = m.replace(/o/g, "0").replace(/[il]/g, "1");
      else if (/^[a-z]*\d[a-z0-9]*$/.test(m) && m.replace(/\d/g, "").length <= 2) ajout = m.replace(/[^0-9]/g, "");
      else if (CHIFFRES_MOTS.hasOwnProperty(m)) ajout = CHIFFRES_MOTS[m];
      else if (DIZAINES.hasOwnProperty(m)) {
        var suivant = mots[i + 1];
        if (suivant && CHIFFRES_MOTS.hasOwnProperty(suivant) && CHIFFRES_MOTS[suivant].length === 1) { ajout = DIZAINES[m] + CHIFFRES_MOTS[suivant]; i++; }
        else ajout = DIZAINES[m] + "0";
      }
      if (ajout !== null) { courant += ajout; trous = 0; }
      else if (LIANTS[m] && courant && trous < 1) trous++;
      else fin();
    }
    fin();
    return meilleur;
  }

  function detecter(texte) {
    var s = normaliser(texte);
    if (!s.trim()) return null;
    var espaces = " " + s.replace(/[^a-z0-9@؀-ۿ]+/g, " ") + " ";
    var colle = leet(s).replace(/[^a-z]/g, "");

    // Téléphone : au moins 8 chiffres à la suite (chiffres, mots ou mélange), ou indicatif international
    if (chiffres(s) >= 8) return "telephone";
    if (/(\+|\b00)\s*\d{2,3}[\s.\-\/]*\d{2,}/.test(s) && chiffres(s) >= 6) return "telephone";

    // E-mail
    if (/[a-z0-9._%+\-]+\s*@\s*[a-z0-9\-]+/.test(s)) return "email";
    if (/[a-z0-9._\-]{2,}\s*(\(at\)|\[at\]|\{at\}|\sat\s|\sarobase\s|\sarrobase\s|\sa commercial\s)\s*[a-z0-9\-]{2,}/.test(" " + s + " ")) return "email";
    for (var i = 0; i < EMAILS_COLLES.length; i++) if (colle.indexOf(EMAILS_COLLES[i]) !== -1) return "email";

    // Liens et adresses de sites
    if (/https?:|www\s*\.|\b(wa\.me|t\.me|bit\.ly|linktr\.ee)\b/.test(s)) return "lien";
    if (/\b[a-z0-9\-]{2,}\s*(\.|\(dot\)|\[dot\]|\sdot\s|\spoint\s)\s*(com|ch|fr|net|org|me|be|de|it|io|ly|gl|al|ma|dz|tn|info|co)\b/.test(s)) return "lien";

    // Réseaux sociaux et messageries
    for (var j = 0; j < RESEAUX_COLLES.length; j++) if (colle.indexOf(RESEAUX_COLLES[j]) !== -1) return "reseau";
    if (RESEAUX_MOTS.test(" " + leet(espaces).replace(/\s+/g, " ") + " ")) return "reseau";
    if (RESEAUX_ARABE.test(s)) return "reseau";

    // Demandes de contact hors du site
    if (DEMANDES.test(espaces.replace(/\s+/g, " "))) return "demande";
    return null;
  }

  // Vérifie aussi les numéros coupés en plusieurs messages (derniers messages de la même personne)
  function detecterSuite(texte, precedents) {
    var direct = detecter(texte);
    if (direct) return direct;
    var tout = (precedents || []).slice(-5).concat([texte]).join(" ");
    return chiffres(normaliser(tout)) >= 8 ? "telephone" : null;
  }

  var MESSAGE = "Pour la sécurité de tous, les numéros de téléphone, adresses e-mail, réseaux sociaux, liens et demandes de contact hors du site sont interdits. Tous les échanges se font ici, sur Nikah.";
  return { detecter: detecter, detecterSuite: detecterSuite, MESSAGE: MESSAGE };
})();
if (typeof module !== "undefined") module.exports = NikahFiltre;
