# Nikah — table des traductions (français -> allemand, italien, anglais, albanais)
# Lancer :  python3 outils/traductions.py   (génère js/langues/de.js, it.js, en.js, sq.js)
# Chaque entrée : "texte français exact" : ("deutsch", "italiano", "english", "shqip")
import json, os, glob

T = {}
def ajoute(d): T.update(d)

# ---------------------------------------------------------------- Commun : en-tête, pied de page, cookies
ajoute({
"Nikah": ("Nikah", "Nikah", "Nikah", "Nikah"),
"Comment ça marche": ("So funktioniert es", "Come funziona", "How it works", "Si funksionon"),
"Confidentialité": ("Datenschutz", "Privacy", "Privacy", "Privatësia"),
"Se connecter": ("Anmelden", "Accedi", "Log in", "Hyr"),
"Commencer": ("Beginnen", "Inizia", "Get started", "Fillo"),
"Mon espace": ("Mein Bereich", "Il mio spazio", "My space", "Hapësira ime"),
"Messages": ("Nachrichten", "Messaggi", "Messages", "Mesazhet"),
"Se déconnecter": ("Abmelden", "Esci", "Log out", "Dil"),
"Politique de confidentialité": ("Datenschutzerklärung", "Informativa sulla privacy", "Privacy policy", "Politika e privatësisë"),
"Conditions d'utilisation": ("Nutzungsbedingungen", "Condizioni d'uso", "Terms of use", "Kushtet e përdorimit"),
"Gérer mes cookies": ("Cookies verwalten", "Gestisci i cookie", "Manage cookies", "Menaxho cookies"),
"Contact": ("Kontakt", "Contatto", "Contact", "Kontakt"),
"© 2026 Nikah — la plateforme du mariage sérieux": ("© 2026 Nikah — die Plattform für die ernsthafte Heirat", "© 2026 Nikah — la piattaforma del matrimonio serio", "© 2026 Nikah — the platform for serious marriage", "© 2026 Nikah — platforma e martesës serioze"),
"Votre vie privée compte pour nous": ("Ihre Privatsphäre ist uns wichtig", "La vostra privacy è importante per noi", "Your privacy matters to us", "Privatësia juaj ka rëndësi për ne"),
"Avant de commencer votre inscription, voici ce que vous devez savoir. Nikah est une plateforme de mariage sérieuse. Nous n'affichons <strong>aucune publicité</strong> et ne vendons jamais vos données. Nous utilisons uniquement ce qui est nécessaire au fonctionnement du site, et nous vous laissons choisir pour le reste.":
 ("Bevor Sie sich anmelden, sollten Sie Folgendes wissen: Nikah ist eine ernsthafte Heiratsplattform. Wir zeigen <strong>keine Werbung</strong> und verkaufen niemals Ihre Daten. Wir verwenden nur, was für den Betrieb der Website nötig ist, und überlassen Ihnen die Wahl für den Rest.",
  "Prima di iniziare l'iscrizione, ecco cosa dovete sapere. Nikah è una piattaforma matrimoniale seria. Non mostriamo <strong>alcuna pubblicità</strong> e non vendiamo mai i vostri dati. Utilizziamo solo ciò che è necessario al funzionamento del sito e vi lasciamo scegliere per il resto.",
  "Before you register, here is what you should know. Nikah is a serious marriage platform. We show <strong>no advertising</strong> and never sell your data. We only use what the site needs to work, and we let you choose for everything else.",
  "Para se të regjistroheni, ja çfarë duhet të dini. Nikah është një platformë serioze martese. Nuk shfaqim <strong>asnjë reklamë</strong> dhe nuk i shesim kurrë të dhënat tuaja. Përdorim vetëm atë që është e nevojshme për funksionimin e faqes dhe ju lëmë të zgjidhni për pjesën tjetër."),
"Vos informations sont protégées :": ("Ihre Angaben sind geschützt:", "Le vostre informazioni sono protette:", "Your information is protected:", "Të dhënat tuaja janë të mbrojtura:"),
"elles sont conservées de façon sécurisée et ne sont jamais vendues ni partagées à des fins publicitaires ;": ("sie werden sicher aufbewahrt und niemals verkauft oder zu Werbezwecken weitergegeben;", "sono conservate in modo sicuro e non vengono mai vendute né condivise a fini pubblicitari;", "it is stored securely and never sold or shared for advertising;", "ruhen në mënyrë të sigurt dhe nuk shiten e nuk ndahen kurrë për qëllime reklamimi;"),
"votre photo n'est visible des autres membres qu'après la vérification de votre identité ;": ("Ihr Foto ist für andere Mitglieder erst nach der Überprüfung Ihrer Identität sichtbar;", "la vostra foto è visibile agli altri membri solo dopo la verifica della vostra identità;", "your photo is only visible to other members after your identity has been verified;", "fotoja juaj shihet nga anëtarët e tjerë vetëm pasi të verifikohet identiteti juaj;"),
"tous les échanges passent exclusivement par la plateforme ;": ("der gesamte Austausch läuft ausschliesslich über die Plattform;", "tutti gli scambi passano esclusivamente dalla piattaforma;", "all exchanges take place only on the platform;", "të gjitha bisedat kalojnë vetëm përmes platformës;"),
"vous pouvez demander la suppression de votre profil et de vos données à tout moment.": ("Sie können jederzeit die Löschung Ihres Profils und Ihrer Daten verlangen.", "potete chiedere in qualsiasi momento la cancellazione del vostro profilo e dei vostri dati.", "you can ask for your profile and data to be deleted at any time.", "mund të kërkoni në çdo kohë fshirjen e profilit dhe të të dhënave tuaja."),
"<strong>Fonctionnement du site</strong><br><small>Mémoriser vos réponses pendant l'inscription et votre choix ici. Toujours actif.</small>":
 ("<strong>Betrieb der Website</strong><br><small>Speichert Ihre Antworten während der Anmeldung und Ihre Wahl hier. Immer aktiv.</small>",
  "<strong>Funzionamento del sito</strong><br><small>Memorizza le vostre risposte durante l'iscrizione e la vostra scelta qui. Sempre attivo.</small>",
  "<strong>How the site works</strong><br><small>Remembers your answers during registration and your choice here. Always on.</small>",
  "<strong>Funksionimi i faqes</strong><br><small>Ruan përgjigjet tuaja gjatë regjistrimit dhe zgjedhjen tuaj këtu. Gjithmonë aktiv.</small>"),
"<strong>Statistiques anonymes</strong><br><small>Comprendre comment le site est utilisé pour l'améliorer. Aucune donnée n'est collectée pour l'instant.</small>":
 ("<strong>Anonyme Statistiken</strong><br><small>Verstehen, wie die Website genutzt wird, um sie zu verbessern. Derzeit werden keine Daten erhoben.</small>",
  "<strong>Statistiche anonime</strong><br><small>Capire come viene usato il sito per migliorarlo. Per ora non viene raccolto alcun dato.</small>",
  "<strong>Anonymous statistics</strong><br><small>Understanding how the site is used in order to improve it. No data is collected for now.</small>",
  "<strong>Statistika anonime</strong><br><small>Të kuptojmë si përdoret faqja për ta përmirësuar. Për momentin nuk mblidhet asnjë e dhënë.</small>"),
"Tout accepter": ("Alle akzeptieren", "Accetta tutto", "Accept all", "Prano të gjitha"),
"Tout refuser": ("Alle ablehnen", "Rifiuta tutto", "Reject all", "Refuzo të gjitha"),
"Personnaliser": ("Anpassen", "Personalizza", "Customise", "Personalizo"),
"Enregistrer mes choix": ("Meine Auswahl speichern", "Salva le mie scelte", "Save my choices", "Ruaj zgjedhjet e mia"),
"J'accepte et je continue": ("Ich akzeptiere und fahre fort", "Accetto e continuo", "I accept and continue", "Pranoj dhe vazhdoj"),
"Je refuse et je retourne à l'accueil": ("Ich lehne ab und kehre zur Startseite zurück", "Rifiuto e torno alla home", "I decline and go back to the home page", "Refuzoj dhe kthehem në faqen kryesore"),
"Enregistrer mes choix et continuer": ("Auswahl speichern und fortfahren", "Salva le mie scelte e continua", "Save my choices and continue", "Ruaj zgjedhjet dhe vazhdo"),
})

# ---------------------------------------------------------------- Accueil
ajoute({
"Nikah — vers un mariage apaisé": ("Nikah — zu einer friedvollen Ehe", "Nikah — verso un matrimonio sereno", "Nikah — towards a peaceful marriage", "Nikah — drejt një martese të qetë"),
"La plateforme sérieuse qui accompagne les musulmanes et musulmans sincères vers le mariage : des profils vérifiés, des échanges encadrés, une démarche respectueuse.":
 ("Die ernsthafte Plattform, die aufrichtige Musliminnen und Muslime auf dem Weg zur Ehe begleitet: überprüfte Profile, begleiteter Austausch, ein respektvolles Vorgehen.",
  "La piattaforma seria che accompagna musulmane e musulmani sinceri verso il matrimonio: profili verificati, scambi accompagnati, un approccio rispettoso.",
  "The serious platform that guides sincere Muslim women and men towards marriage: verified profiles, supervised exchanges, a respectful approach.",
  "Platforma serioze që shoqëron myslimanet dhe myslimanët e sinqertë drejt martesës: profile të verifikuara, biseda të mbikëqyrura, një qasje e respektueshme."),
"Commencer mon inscription": ("Meine Anmeldung beginnen", "Inizia la mia iscrizione", "Start my registration", "Fillo regjistrimin tim"),
"Le halal, à la portée de tous": ("Das Halal, für alle erreichbar", "L'halal alla portata di tutti", "Halal, within everyone's reach", "Hallalli, në dorë të të gjithëve"),
"Aidez-nous à faciliter le mariage halal": ("Helfen Sie uns, die Halal-Ehe zu erleichtern", "Aiutateci a facilitare il matrimonio halal", "Help us make halal marriage easier", "Na ndihmoni ta lehtësojmë martesën hallall"),
"Démarche sérieuse": ("Ernsthaftes Vorgehen", "Approccio serio", "A serious approach", "Qasje serioze"),
"Pour le mariage, <strong>pas</strong> pour le divertissement": ("Für die Ehe, <strong>nicht</strong> zum Zeitvertreib", "Per il matrimonio, <strong>non</strong> per il divertimento", "For marriage, <strong>not</strong> for entertainment", "Për martesë, <strong>jo</strong> për argëtim"),
"Identités vérifiées": ("Überprüfte Identitäten", "Identità verificate", "Verified identities", "Identitete të verifikuara"),
"Pour <strong>protéger</strong> nos filles et nos fils des arnaques": ("Um unsere Töchter und Söhne vor Betrug zu <strong>schützen</strong>", "Per <strong>proteggere</strong> le nostre figlie e i nostri figli dalle truffe", "To <strong>protect</strong> our daughters and sons from scams", "Për të <strong>mbrojtur</strong> vajzat dhe djemtë tanë nga mashtrimet"),
"Échanges encadrés": ("Begleiteter Austausch", "Scambi accompagnati", "Supervised exchanges", "Biseda të mbikëqyrura"),
"Le temps de se connaître, <strong>avant le wali</strong>": ("Zeit zum Kennenlernen, <strong>vor dem Wali</strong>", "Il tempo di conoscersi, <strong>prima del wali</strong>", "Time to get to know each other, <strong>before the wali</strong>", "Koha për t'u njohur, <strong>para veliut (wali)</strong>"),
"Pourquoi Nikah ?": ("Warum Nikah?", "Perché Nikah?", "Why Nikah?", "Pse Nikah?"),
"Trop de plateformes de rencontre ne correspondent pas à nos valeurs. Nikah a été pensé dès le départ pour répondre aux besoins spécifiques d'une recherche de mariage dans le respect de l'islam : encadrement des échanges, questionnaire axé sur la compatibilité réelle (pratique, intentions, délai), et une ambiance sobre et sérieuse.":
 ("Zu viele Dating-Plattformen entsprechen nicht unseren Werten. Nikah wurde von Anfang an für die besonderen Bedürfnisse einer Partnersuche zur Heirat im Einklang mit dem Islam entwickelt: begleiteter Austausch, ein Fragebogen zur echten Übereinstimmung (Praxis, Absichten, Zeitrahmen) und eine schlichte, ernsthafte Atmosphäre.",
  "Troppe piattaforme di incontri non corrispondono ai nostri valori. Nikah è stato pensato fin dall'inizio per rispondere alle esigenze specifiche di chi cerca il matrimonio nel rispetto dell'islam: scambi accompagnati, un questionario sulla vera compatibilità (pratica, intenzioni, tempi) e un'atmosfera sobria e seria.",
  "Too many dating platforms do not match our values. Nikah was designed from the start for the specific needs of a search for marriage that respects Islam: supervised exchanges, a questionnaire focused on real compatibility (practice, intentions, timeframe), and a sober, serious atmosphere.",
  "Shumë platforma njohjesh nuk përputhen me vlerat tona. Nikah u mendua që në fillim për nevojat e veçanta të kërkimit të martesës në respekt të islamit: biseda të mbikëqyrura, një pyetësor për përputhshmërinë e vërtetë (praktika, qëllimet, afati) dhe një atmosferë e thjeshtë dhe serioze."),
"Découvrir comment ça marche →": ("Erfahren, wie es funktioniert →", "Scopri come funziona →", "See how it works →", "Zbuloni si funksionon →"),
"Offre de lancement": ("Eröffnungsangebot", "Offerta di lancio", "Launch offer", "Ofertë fillestare"),
"Gratuit jusqu'au 16 février 2027": ("Kostenlos bis 16. Februar 2027", "Gratuito fino al 16 febbraio 2027", "Free until 16 February 2027", "Falas deri më 16 shkurt 2027"),
"Les membres qui s'inscrivent pendant le lancement profitent de toute la plateforme gratuitement jusqu'au 16 février 2027.":
 ("Mitglieder, die sich während der Eröffnungsphase anmelden, nutzen die gesamte Plattform bis zum 16. Februar 2027 kostenlos.",
  "I membri che si iscrivono durante il lancio usufruiscono gratuitamente di tutta la piattaforma fino al 16 febbraio 2027.",
  "Members who register during the launch enjoy the whole platform free of charge until 16 February 2027.",
  "Anëtarët që regjistrohen gjatë fazës fillestare e përdorin gjithë platformën falas deri më 16 shkurt 2027."),
"Ensuite, une petite participation mensuelle sera demandée. Elle finance ce qui fait le sérieux de Nikah : la vérification des identités, le contrôle des messages, la protection contre les arnaques et le travail de l'équipe qui veille sur vous.":
 ("Danach wird ein kleiner monatlicher Beitrag verlangt. Er finanziert, was Nikah ernsthaft macht: die Überprüfung der Identitäten, die Kontrolle der Nachrichten, den Schutz vor Betrug und die Arbeit des Teams, das über Sie wacht.",
  "In seguito sarà richiesto un piccolo contributo mensile. Finanzia ciò che rende Nikah serio: la verifica delle identità, il controllo dei messaggi, la protezione dalle truffe e il lavoro del team che veglia su di voi.",
  "After that, a small monthly contribution will be requested. It funds what makes Nikah serious: identity checks, message monitoring, protection against scams and the work of the team that looks after you.",
  "Më pas do të kërkohet një kontribut i vogël mujor. Ai financon atë që e bën Nikah serioze: verifikimin e identiteteve, kontrollin e mesazheve, mbrojtjen nga mashtrimet dhe punën e ekipit që kujdeset për ju."),
"Échanger vos coordonnées, le moment venu": ("Kontaktdaten austauschen, wenn die Zeit gekommen ist", "Scambiare i vostri recapiti, al momento giusto", "Sharing your contact details, when the time comes", "Shkëmbimi i kontakteve, kur të vijë koha"),
"Pour votre protection, numéros de téléphone, adresses e-mail et réseaux sociaux ne s'échangent pas dans la messagerie. Lorsque votre projet devient sérieux, l'échange se fait dans un cadre clair :":
 ("Zu Ihrem Schutz werden Telefonnummern, E-Mail-Adressen und soziale Netzwerke nicht im Nachrichtenbereich ausgetauscht. Wenn Ihr Vorhaben ernst wird, erfolgt der Austausch in einem klaren Rahmen:",
  "Per la vostra protezione, numeri di telefono, indirizzi e-mail e social network non si scambiano nella messaggistica. Quando il vostro progetto diventa serio, lo scambio avviene in un quadro chiaro:",
  "For your protection, phone numbers, email addresses and social media are not exchanged in the messaging. When your plans become serious, the exchange takes place within a clear framework:",
  "Për mbrojtjen tuaj, numrat e telefonit, adresat e email-it dhe rrjetet sociale nuk shkëmbehen në mesazhe. Kur synimi juaj bëhet serioz, shkëmbimi bëhet në një kuadër të qartë:"),
"<strong>Prenez le temps de vous connaître ici.</strong> Toutes vos discussions restent sur Nikah, sans donner vos coordonnées.":
 ("<strong>Nehmen Sie sich hier Zeit, einander kennenzulernen.</strong> Alle Gespräche bleiben auf Nikah, ohne Kontaktdaten weiterzugeben.",
  "<strong>Prendetevi qui il tempo di conoscervi.</strong> Tutte le vostre conversazioni restano su Nikah, senza dare i vostri recapiti.",
  "<strong>Take the time to get to know each other here.</strong> All your conversations stay on Nikah, without sharing your contact details.",
  "<strong>Merrni kohë të njiheni këtu.</strong> Të gjitha bisedat tuaja mbeten në Nikah, pa dhënë kontaktet tuaja."),
"<strong>Quand vous êtes tous les deux sûrs</strong> de vouloir avancer vers le mariage, chacun de vous nous le confirme par écrit, depuis la conversation.":
 ("<strong>Wenn Sie beide sicher sind</strong>, dass Sie auf die Ehe zugehen möchten, bestätigt jeder von Ihnen dies schriftlich im Gespräch.",
  "<strong>Quando siete entrambi sicuri</strong> di voler andare verso il matrimonio, ognuno di voi ce lo conferma per iscritto, dalla conversazione.",
  "<strong>When you are both sure</strong> you want to move towards marriage, each of you confirms it to us in writing, from the conversation.",
  "<strong>Kur jeni të dy të sigurt</strong> se doni të ecni drejt martesës, secili prej jush na e konfirmon me shkrim, nga biseda."),
"<strong>Après les deux confirmations</strong>, et seulement à ce moment-là, nous autorisons l'échange de vos coordonnées, pour que les familles et le wali puissent prendre le relais.":
 ("<strong>Nach beiden Bestätigungen</strong>, und erst dann, erlauben wir den Austausch Ihrer Kontaktdaten, damit die Familien und der Wali übernehmen können.",
  "<strong>Dopo le due conferme</strong>, e solo in quel momento, autorizziamo lo scambio dei vostri recapiti, affinché le famiglie e il wali possano subentrare.",
  "<strong>After both confirmations</strong>, and only then, we allow you to exchange contact details, so that the families and the wali can take over.",
  "<strong>Pas dy konfirmimeve</strong>, dhe vetëm atëherë, ne lejojmë shkëmbimin e kontakteve tuaja, që familjet dhe veliu (wali) të marrin stafetën."),
"<strong>Vos échanges restent archivés</strong> de façon sécurisée. En cas de problème (arnaque, tromperie, plainte), cette archive permet de protéger chacun.":
 ("<strong>Ihr Austausch bleibt sicher archiviert.</strong> Bei Problemen (Betrug, Täuschung, Beschwerde) schützt dieses Archiv alle Beteiligten.",
  "<strong>I vostri scambi restano archiviati</strong> in modo sicuro. In caso di problemi (truffa, inganno, reclamo), questo archivio permette di proteggere ciascuno.",
  "<strong>Your exchanges remain securely archived.</strong> If there is a problem (scam, deception, complaint), this archive protects everyone.",
  "<strong>Bisedat tuaja mbeten të arkivuara</strong> në mënyrë të sigurt. Në rast problemi (mashtrim, gënjeshtër, ankesë), ky arkiv mbron secilin."),
})

# ---------------------------------------------------------------- Comment ça marche
ajoute({
"Comment ça marche — Nikah": ("So funktioniert es — Nikah", "Come funziona — Nikah", "How it works — Nikah", "Si funksionon — Nikah"),
"Une démarche sérieuse, encadrée, respectueuse": ("Ein ernsthaftes, begleitetes und respektvolles Vorgehen", "Un percorso serio, accompagnato e rispettoso", "A serious, supervised and respectful approach", "Një qasje serioze, e mbikëqyrur dhe e respektueshme"),
"Nikah accompagne les musulmanes et musulmans sincèrement engagés dans une recherche de mariage, dans un cadre sérieux et encadré. Pas de discussion informelle, pas de contact extérieur non souhaité : chaque étape est pensée pour avancer sereinement vers un Nikah apaisé.":
 ("Nikah begleitet Musliminnen und Muslime, die aufrichtig eine Ehe suchen, in einem ernsthaften und begleiteten Rahmen. Keine lockeren Unterhaltungen, kein unerwünschter Kontakt von aussen: Jeder Schritt ist darauf ausgelegt, gelassen auf einen friedvollen Nikah zuzugehen.",
  "Nikah accompagna musulmane e musulmani sinceramente impegnati nella ricerca del matrimonio, in un quadro serio e accompagnato. Niente conversazioni informali, nessun contatto esterno indesiderato: ogni tappa è pensata per avanzare serenamente verso un Nikah sereno.",
  "Nikah supports Muslim women and men who are sincerely looking for marriage, in a serious and supervised setting. No casual chatting, no unwanted outside contact: every step is designed to move calmly towards a peaceful Nikah.",
  "Nikah shoqëron myslimanet dhe myslimanët që kërkojnë sinqerisht martesë, në një kuadër serioz dhe të mbikëqyrur. Pa biseda të rastit, pa kontakte të padëshiruara nga jashtë: çdo hap është menduar për të ecur me qetësi drejt një Nikahu të qetë."),
"Vous créez votre profil": ("Sie erstellen Ihr Profil", "Create il vostro profilo", "You create your profile", "Krijoni profilin tuaj"),
"En répondant à un questionnaire complet sur vos valeurs, votre pratique et ce que vous recherchez.": ("Indem Sie einen umfassenden Fragebogen zu Ihren Werten, Ihrer Praxis und Ihren Wünschen beantworten.", "Rispondendo a un questionario completo sui vostri valori, la vostra pratica e ciò che cercate.", "By answering a full questionnaire about your values, your practice and what you are looking for.", "Duke iu përgjigjur një pyetësori të plotë për vlerat, praktikën tuaj dhe atë që kërkoni."),
"Nous vous proposons des profils compatibles": ("Wir schlagen Ihnen passende Profile vor", "Vi proponiamo profili compatibili", "We suggest compatible profiles", "Ju propozojmë profile të përshtatshme"),
"Selon vos critères (lieu, pratique religieuse, intentions de mariage, délai souhaité).": ("Nach Ihren Kriterien (Ort, religiöse Praxis, Heiratsabsichten, gewünschter Zeitrahmen).", "Secondo i vostri criteri (luogo, pratica religiosa, intenzioni di matrimonio, tempi desiderati).", "Based on your criteria (location, religious practice, marriage intentions, desired timeframe).", "Sipas kritereve tuaja (vendi, praktika fetare, qëllimet e martesës, afati i dëshiruar)."),
"Vous échangez en toute sécurité": ("Sie tauschen sich sicher aus", "Comunicate in tutta sicurezza", "You communicate safely", "Bisedoni të sigurt"),
"Tous les messages passent exclusivement par la plateforme Nikah, jamais par un numéro de téléphone ou un réseau social externe.": ("Alle Nachrichten laufen ausschliesslich über die Plattform Nikah, nie über eine Telefonnummer oder ein externes soziales Netzwerk.", "Tutti i messaggi passano esclusivamente dalla piattaforma Nikah, mai da un numero di telefono o da un social network esterno.", "All messages go exclusively through the Nikah platform, never through a phone number or an outside social network.", "Të gjitha mesazhet kalojnë vetëm përmes platformës Nikah, kurrë përmes një numri telefoni ose rrjeti social të jashtëm."),
"Vous avancez à votre rythme": ("Sie gehen in Ihrem eigenen Tempo voran", "Avanzate al vostro ritmo", "You move forward at your own pace", "Ecni me ritmin tuaj"),
"Vers une rencontre encadrée, puis, si Allah le veut, vers le Nikah.": ("Zu einem begleiteten Treffen und dann, so Allah will, zum Nikah.", "Verso un incontro accompagnato e poi, se Allah vuole, verso il Nikah.", "Towards a supervised meeting and then, if Allah wills, towards the Nikah.", "Drejt një takimi të mbikëqyrur dhe më pas, në dashtë Allahu, drejt Nikahut."),
"« Nikah n'est pas une application de rencontre : c'est un espace pensé pour le mariage, dans le respect de nos valeurs. »": ("« Nikah ist keine Dating-App: Es ist ein Raum, der für die Ehe gedacht ist, im Respekt vor unseren Werten. »", "« Nikah non è un'app di incontri: è uno spazio pensato per il matrimonio, nel rispetto dei nostri valori. »", "“Nikah is not a dating app: it is a space designed for marriage, respecting our values.”", "« Nikah nuk është aplikacion njohjesh: është një hapësirë e menduar për martesën, në respekt të vlerave tona. »"),
})

# ---------------------------------------------------------------- Connexion, mot de passe, contact
ajoute({
"Connexion — Nikah": ("Anmeldung — Nikah", "Accesso — Nikah", "Log in — Nikah", "Hyrja — Nikah"),
"Accédez à votre espace personnel.": ("Zugang zu Ihrem persönlichen Bereich.", "Accedete al vostro spazio personale.", "Access your personal space.", "Hyni në hapësirën tuaj personale."),
"Votre adresse e-mail": ("Ihre E-Mail-Adresse", "Il vostro indirizzo e-mail", "Your email address", "Adresa juaj e email-it"),
"Votre mot de passe": ("Ihr Passwort", "La vostra password", "Your password", "Fjalëkalimi juaj"),
"Afficher le mot de passe": ("Passwort anzeigen", "Mostra la password", "Show password", "Shfaq fjalëkalimin"),
"Masquer le mot de passe": ("Passwort verbergen", "Nascondi la password", "Hide password", "Fshih fjalëkalimin"),
"Mot de passe oublié ?": ("Passwort vergessen?", "Password dimenticata?", "Forgot your password?", "Keni harruar fjalëkalimin?"),
"Connexion…": ("Anmeldung…", "Accesso…", "Logging in…", "Duke hyrë…"),
"Merci d'indiquer votre adresse e-mail.": ("Bitte geben Sie Ihre E-Mail-Adresse ein.", "Indicate il vostro indirizzo e-mail.", "Please enter your email address.", "Ju lutem shkruani adresën tuaj të email-it."),
"Merci d'indiquer votre mot de passe.": ("Bitte geben Sie Ihr Passwort ein.", "Indicate la vostra password.", "Please enter your password.", "Ju lutem shkruani fjalëkalimin tuaj."),
"Adresse e-mail ou mot de passe incorrect.": ("E-Mail-Adresse oder Passwort falsch.", "Indirizzo e-mail o password errati.", "Incorrect email address or password.", "Adresa e email-it ose fjalëkalimi është i gabuar."),
"Trop de tentatives. Pour votre sécurité, réessayez dans 15 minutes.": ("Zu viele Versuche. Zu Ihrer Sicherheit versuchen Sie es in 15 Minuten erneut.", "Troppi tentativi. Per la vostra sicurezza, riprovate tra 15 minuti.", "Too many attempts. For your security, try again in 15 minutes.", "Shumë përpjekje. Për sigurinë tuaj, provoni sërish pas 15 minutash."),
"Votre compte est suspendu à la suite d'un manquement à la charte.": ("Ihr Konto ist wegen eines Verstosses gegen die Charta gesperrt.", "Il vostro account è sospeso a seguito di una violazione della carta.", "Your account is suspended following a breach of the charter.", "Llogaria juaj është pezulluar për shkak të një shkeljeje të kartës."),
"Votre compte a été fermé définitivement à la suite d'un manquement grave à la charte.": ("Ihr Konto wurde wegen eines schweren Verstosses gegen die Charta endgültig geschlossen.", "Il vostro account è stato chiuso definitivamente a seguito di una grave violazione della carta.", "Your account has been permanently closed following a serious breach of the charter.", "Llogaria juaj është mbyllur përgjithmonë për shkak të një shkeljeje të rëndë të kartës."),
"Une erreur est survenue. Merci de réessayer dans un instant.": ("Ein Fehler ist aufgetreten. Bitte versuchen Sie es gleich noch einmal.", "Si è verificato un errore. Riprovate tra un istante.", "An error occurred. Please try again in a moment.", "Ndodhi një gabim. Ju lutem provoni sërish pas pak."),
"Connexion impossible pour le moment. Vérifiez votre connexion Internet et réessayez.": ("Verbindung im Moment nicht möglich. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.", "Connessione impossibile al momento. Verificate la vostra connessione Internet e riprovate.", "Unable to connect right now. Check your internet connection and try again.", "Lidhja nuk është e mundur për momentin. Kontrolloni internetin dhe provoni sërish."),
"Mot de passe oublié — Nikah": ("Passwort vergessen — Nikah", "Password dimenticata — Nikah", "Forgotten password — Nikah", "Fjalëkalim i harruar — Nikah"),
"Mot de passe oublié": ("Passwort vergessen", "Password dimenticata", "Forgotten password", "Fjalëkalim i harruar"),
"Indiquez votre adresse e-mail. Si un profil existe, nous vous envoyons un lien pour choisir un nouveau mot de passe (valable 30 minutes).": ("Geben Sie Ihre E-Mail-Adresse ein. Falls ein Profil existiert, senden wir Ihnen einen Link, um ein neues Passwort zu wählen (30 Minuten gültig).", "Indicate il vostro indirizzo e-mail. Se esiste un profilo, vi inviamo un link per scegliere una nuova password (valido 30 minuti).", "Enter your email address. If a profile exists, we will send you a link to choose a new password (valid for 30 minutes).", "Shkruani adresën tuaj të email-it. Nëse ekziston një profil, ju dërgojmë një lidhje për të zgjedhur një fjalëkalim të ri (e vlefshme 30 minuta)."),
"Retour": ("Zurück", "Indietro", "Back", "Kthehu"),
"Envoyer le lien": ("Link senden", "Invia il link", "Send the link", "Dërgo lidhjen"),
"Envoi…": ("Wird gesendet…", "Invio…", "Sending…", "Duke dërguar…"),
"Lien envoyé": ("Link gesendet", "Link inviato", "Link sent", "Lidhja u dërgua"),
"Cette adresse e-mail ne semble pas valide.": ("Diese E-Mail-Adresse scheint ungültig zu sein.", "Questo indirizzo e-mail non sembra valido.", "This email address does not seem valid.", "Kjo adresë email-i nuk duket e vlefshme."),
"Si un profil existe avec cette adresse, un e-mail vient d'être envoyé. Pensez à vérifier vos courriers indésirables.": ("Falls ein Profil mit dieser Adresse existiert, wurde soeben eine E-Mail gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.", "Se esiste un profilo con questo indirizzo, è appena stata inviata un'e-mail. Controllate anche la posta indesiderata.", "If a profile exists with this address, an email has just been sent. Remember to check your spam folder.", "Nëse ekziston një profil me këtë adresë, sapo u dërgua një email. Kontrolloni edhe dosjen e postës së padëshiruar."),
"Nouveau mot de passe — Nikah": ("Neues Passwort — Nikah", "Nuova password — Nikah", "New password — Nikah", "Fjalëkalim i ri — Nikah"),
"Nouveau mot de passe": ("Neues Passwort", "Nuova password", "New password", "Fjalëkalim i ri"),
"Choisissez un nouveau mot de passe : au moins 10 caractères, dont un caractère spécial (par exemple ! ? # @ -).": ("Wählen Sie ein neues Passwort: mindestens 10 Zeichen, davon ein Sonderzeichen (zum Beispiel ! ? # @ -).", "Scegliete una nuova password: almeno 10 caratteri, di cui un carattere speciale (per esempio ! ? # @ -).", "Choose a new password: at least 10 characters, including one special character (for example ! ? # @ -).", "Zgjidhni një fjalëkalim të ri: të paktën 10 karaktere, ku një të jetë karakter i veçantë (për shembull ! ? # @ -)."),
"Confirmez le mot de passe": ("Passwort bestätigen", "Conferma la password", "Confirm password", "Konfirmoni fjalëkalimin"),
"Enregistrer": ("Speichern", "Salva", "Save", "Ruaj"),
"Enregistrement…": ("Wird gespeichert…", "Salvataggio…", "Saving…", "Duke ruajtur…"),
"Votre mot de passe a bien été modifié.": ("Ihr Passwort wurde geändert.", "La vostra password è stata modificata.", "Your password has been changed.", "Fjalëkalimi juaj u ndryshua."),
"Le mot de passe doit contenir au moins 10 caractères, dont un caractère spécial.": ("Das Passwort muss mindestens 10 Zeichen enthalten, davon ein Sonderzeichen.", "La password deve contenere almeno 10 caratteri, di cui un carattere speciale.", "The password must contain at least 10 characters, including one special character.", "Fjalëkalimi duhet të ketë të paktën 10 karaktere, ku një të jetë karakter i veçantë."),
"Les deux mots de passe ne sont pas identiques.": ("Die beiden Passwörter stimmen nicht überein.", "Le due password non sono identiche.", "The two passwords do not match.", "Dy fjalëkalimet nuk janë të njëjta."),
"Ce lien n'est pas valide. Demandez un nouveau lien depuis la page « Mot de passe oublié ».": ("Dieser Link ist ungültig. Fordern Sie auf der Seite « Passwort vergessen » einen neuen Link an.", "Questo link non è valido. Richiedete un nuovo link dalla pagina « Password dimenticata ».", "This link is not valid. Request a new link from the “Forgotten password” page.", "Kjo lidhje nuk është e vlefshme. Kërkoni një lidhje të re nga faqja « Fjalëkalim i harruar »."),
"Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien depuis la page « Mot de passe oublié ».": ("Dieser Link ist abgelaufen oder wurde bereits verwendet. Fordern Sie auf der Seite « Passwort vergessen » einen neuen Link an.", "Questo link è scaduto o è già stato usato. Richiedete un nuovo link dalla pagina « Password dimenticata ».", "This link has expired or has already been used. Request a new link from the “Forgotten password” page.", "Kjo lidhje ka skaduar ose është përdorur tashmë. Kërkoni një lidhje të re nga faqja « Fjalëkalim i harruar »."),
"Contact — Nikah": ("Kontakt — Nikah", "Contatto — Nikah", "Contact — Nikah", "Kontakt — Nikah"),
"Nous contacter": ("Kontaktieren Sie uns", "Contattarci", "Contact us", "Na kontaktoni"),
"Pour toute question, écrivez-nous à cette adresse. Nous vous répondons dès que possible, inchallah.": ("Bei Fragen schreiben Sie uns an diese Adresse. Wir antworten so bald wie möglich, inschallah.", "Per qualsiasi domanda, scriveteci a questo indirizzo. Vi rispondiamo al più presto, inshallah.", "For any question, write to us at this address. We will reply as soon as possible, inshallah.", "Për çdo pyetje, na shkruani në këtë adresë. Do t'ju përgjigjemi sa më shpejt, inshallah."),
"Copier l'adresse": ("Adresse kopieren", "Copia l'indirizzo", "Copy the address", "Kopjo adresën"),
"Adresse copiée. Collez-la dans votre messagerie.": ("Adresse kopiert. Fügen Sie sie in Ihr E-Mail-Programm ein.", "Indirizzo copiato. Incollatelo nella vostra posta elettronica.", "Address copied. Paste it into your email app.", "Adresa u kopjua. Ngjiteni në programin tuaj të email-it."),
})

MODELES = [
 # [expression régulière (texte français), (de, it, en, sq)] — $1, $2… reprennent les parties variables
 [r"Votre compte est suspendu jusqu'au (.+) à la suite d'un manquement à la charte\.",
  ("Ihr Konto ist bis zum $1 wegen eines Verstosses gegen die Charta gesperrt.", "Il vostro account è sospeso fino al $1 a seguito di una violazione della carta.", "Your account is suspended until $1 following a breach of the charter.", "Llogaria juaj është pezulluar deri më $1 për shkak të një shkeljeje të kartës.")],
]

# Les autres parties du site sont ajoutées dans d'autres fichiers (outils/traductions_*.py)
for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "traductions_*.py"))):
    exec(open(f, encoding="utf-8").read())

if __name__ == "__main__":
    racine = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "js", "langues")
    os.makedirs(racine, exist_ok=True)
    for i, code in enumerate(["de", "it", "en", "sq"]):
        textes = {k: v[i] for k, v in T.items()}
        modeles = [[m[0], m[1][i]] for m in MODELES]
        contenu = "// Généré par outils/traductions.py — ne pas modifier à la main\nwindow.NikahLangues = window.NikahLangues || {};\nwindow.NikahLangues." + code + " = " + json.dumps({"textes": textes, "modeles": modeles}, ensure_ascii=False, indent=0) + ";\n"
        open(os.path.join(racine, code + ".js"), "w", encoding="utf-8").write(contenu)
    print(len(T), "textes,", len(MODELES), "modèles")
