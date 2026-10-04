// Numéro de version du site (convention semver : MAJOR.MINOR.PATCH).
// Ajouter une entrée en haut de CHANGELOG à chaque changement notable et
// mettre à jour APP_VERSION en conséquence.
export const APP_VERSION = '0.1.0'

export const CHANGELOG = [
  {
    version: '0.1.0',
    date: '5 octobre 2026',
    notes: "Un petit secret s'est glissé sur le site : un mini-jeu où le coureur de la SAM grimpe vers les 10 km des Foulées. À toi de le trouver ! Sur téléphone, la page ne déborde plus de l'écran (elle était dézoomée à cause du menu) et toucher à côté du menu le referme.",
  },
  {
    version: '0.0.3',
    date: '4 octobre 2026',
    notes: "Bornes et petit coureur identiques au site de la SAM Paris 12 : bornes au format kakemono du club (« N Km », logo, SAM PARIS 12), grisées sauf la borne en cours ; coureur agrandi avec la flamme de meneur d'allure, homme ou femme, peau claire ou foncée au hasard, qui se range à côté de la borne. Le texte du cadre « Prochaine édition » est de nouveau lisible en mode clair.",
  },
  {
    version: '0.0.2',
    date: '3 octobre 2026',
    notes: "Le « e » des numéros (Foulées du 12e, 22e édition, 21e édition…) reste en minuscule, en exposant, y compris dans les titres en capitales. Site en ligne sur https://fouleesparis12.juliotte-app.fr.",
  },
  {
    version: '0.0.1',
    date: '3 octobre 2026',
    notes: "Première version de la refonte du site des Foulées du 12ème, dans la ligne du nouveau site de la SAM Paris 12 : accueil en 8 bornes kilométriques avec le petit coureur en maillot SAM, pages La course, Parcours, Kid's Foulées, I Run for Chimps, Course éco-responsable, Infos pratiques, Résultats et photos (éditions 2016 à 2026) et Club organisateur. L'édition à venir (date, départs, tarifs, retrait des dossards, lien d'inscription) et les archives viennent de la base de données via une API Go.",
  },
]
