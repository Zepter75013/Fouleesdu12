import { Link } from 'react-router-dom'
import { Legs } from '../components/Legs.jsx'
import { Ordinaux } from '../components/Ordinal.jsx'
import { InscriptionButton } from '../components/Header.jsx'
import { DOCS } from '../data/edition.js'
import { useEdition } from '../lib/edition.jsx'
import { api } from '../lib/api.js'
import { useFetch } from '../lib/useFetch.js'

// Gabarit commun : bandeau photo avec titre et introduction, puis un parcours de bornes
// (une borne numérotée par section), comme sur l'accueil.
function Page({ eyebrow, title, photo, intro, sections }) {
  return (
    <main>
      <section className="page-hero">
        <img className="page-hero__photo" src={photo} alt="" aria-hidden="true" decoding="async" />
        <div className="shell">
          <div className="page-hero__text">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {intro && <div className="prose"><p>{intro}</p></div>}
          </div>
        </div>
      </section>
      <Legs sections={sections} />
    </main>
  )
}

const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>

// Grille de liens (albums, vidéos, documents) : une case par lien.
function Liens({ liens }) {
  return (
    <ul className="liens">
      {liens.map((l) => (
        <li key={l.href + l.label}><Ext href={l.href}>{l.label}<span aria-hidden="true">↗</span></Ext></li>
      ))}
    </ul>
  )
}

function Figure({ src, alt, caption, href }) {
  const img = <img src={src} alt={alt} loading="lazy" decoding="async" />
  return (
    <figure className="figure">
      {href ? <Ext href={href}>{img}</Ext> : img}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// Rappel affiché tant que les inscriptions de l'édition ne sont pas ouvertes.
function Inscription({ quoi = 'Inscriptions' }) {
  const { inscriptionsOuvertes } = useEdition()
  return (
    <div className="join" id="inscription">
      <div className="join-head">
        <b>{quoi}</b>
        <span className="price">
          {inscriptionsOuvertes ? <>En ligne sur <strong>Protiming</strong></> : <>Ouverture <strong>prochainement</strong></>}
        </span>
      </div>
      <ul>
        <li>Inscriptions uniquement en ligne : pas d'inscription sur place.</li>
        <li>Fiche descriptive, autorisation parentale et attestation de santé à joindre lors de l'inscription.</li>
      </ul>
      <div className="join-foot">
        <InscriptionButton className="btn btn--solid" />
        <a className="btn btn--ghost" href={DOCS.fiche} target="_blank" rel="noreferrer">Fiche descriptive (PDF)</a>
      </div>
    </div>
  )
}

function Tarifs() {
  const EDITION = useEdition()
  return (
    <div className="disc">
      {EDITION.departs.map((d) => (
        <article key={d.course}>
          <h3>{d.course} <span>{d.heure}</span></h3>
          <p>{d.detail}<br /><strong>{d.prix}</strong></p>
        </article>
      ))}
    </div>
  )
}

// ---------- 01 La course ----------
export function LaCoursePage() {
  const EDITION = useEdition()
  return (
    <Page
      eyebrow={`L'épreuve · ${EDITION.date}`}
      title="La course"
      photo="/photos/vitesse.jpg"
      intro="Organisées par la SAM Paris 12, l'OMS du 12e et la mairie du 12e arrondissement de Paris, les Foulées du 12ème vous attendent pour un 5 km et un 10 km sur route dans le Bois de Vincennes."
      sections={[
        { eyebrow: 'Label qualificatif', title: 'Une course à taille humaine', children: (
          <div className="prose">
            <p>
              Le parcours est constitué d'une ou deux boucles de 5 km. Le départ est donné avenue de Gravelle,
              en face du vélodrome Jacques Anquetil où est jugée l'arrivée ; celui du 5 km est situé 70 m après
              la ligne de départ du 10 km.
            </p>
            <p>
              Les adhérents de la SAM Paris 12 s'y investissent en tant que bénévoles pour apporter leur
              expérience de coureurs à tous les participants, coureurs expérimentés comme coureurs loisirs.
            </p>
          </div>
        ) },
        { eyebrow: 'Pour chacun', title: 'Trois façons de courir les Foulées', children: (
          <ul className="spots">
            <li><b>Expérimentés</b><span>Le Label Bronze de la FFA permet d'obtenir une qualification aux Championnats de France. Les performances comptent au classement FFA du coureur et de son club.</span></li>
            <li><b>Loisirs</b><span>Un environnement répondant aux critères de la FFA : parcours mesuré, ravitaillements et sécurité de l'évènement.</span></li>
            <li><b>Engagés</b><span>L'option <Link to="/i-run-for-chimps">I Run for Chimps</Link> soutient la lutte contre le braconnage des chimpanzés en Ouganda, avec un t-shirt illustré fabriqué en France.</span></li>
            <li><b>En famille</b><span>Les Défis Duo Famille sur le 10 km : mère-fille, mère-fils, père-fille, père-fils.</span></li>
          </ul>
        ) },
        { eyebrow: `Édition ${EDITION.reference}, à titre indicatif`, title: 'Départs et tarifs', wide: true, children: (
          <>
            <Tarifs />
            <p className="note">Option dossard solidaire I Run for Chimps : {EDITION.optionChimps}. Horaires et tarifs {EDITION.annee} confirmés à l'ouverture des inscriptions.</p>
          </>
        ) },
        { eyebrow: 'Un site olympique', title: "L'arrivée sur la Cipale", children: (
          <div className="prose">
            <p>
              Vos proches pourront vous applaudir sur le parcours et sur un site prestigieux : le stade
              vélodrome Jacques Anquetil, site olympique en 1900 et 1924. De 1968 à 1975, l'arrivée du
              Tour de France y a été jugée.
            </p>
          </div>
        ) },
        { eyebrow: 'Avant le départ', title: "S'inscrire", children: <Inscription /> },
      ]}
    />
  )
}

// ---------- 02 Le parcours ----------
export function ParcoursPage() {
  return (
    <Page
      eyebrow="L'épreuve"
      title="Le parcours"
      photo="/photos/vitesse.jpg"
      intro="Un parcours entièrement plat, proposé depuis 2023 : deux boucles de 5 km pour le 10 km, une seule pour le 5 km."
      sections={[
        { eyebrow: 'Plan du parcours', title: 'Autour du lac Daumesnil', wide: true, children: (
          <Figure
            src="/plans/parcours-5-10km.jpg"
            href="/plans/parcours-5-10km.jpg"
            alt="Plan du parcours : départ avenue de Gravelle, boucle autour du lac Daumesnil par la Porte Dorée et la Porte de Charenton, arrivée dans le vélodrome."
            caption="Points kilométriques en bleu au 1er tour, en rouge au 2e tour · cliquer pour agrandir"
          />
        ) },
        { eyebrow: 'Kilomètre par kilomètre', title: 'Ce que vous verrez', children: (
          <ul className="spots">
            <li><b>Départ</b><span>Avenue de Gravelle, face au vélodrome Jacques Anquetil.</span></li>
            <li><b>Le lac</b><span>Tour du lac Daumesnil, en passant à côté du temple bouddhiste.</span></li>
            <li><b>Le zoo</b><span>On longe le parc zoologique de Vincennes.</span></li>
            <li><b>Porte Dorée</b><span>Passage devant le musée, puis l'avenue du Général Laperrine.</span></li>
            <li><b>Reuilly</b><span>Retour vers la pelouse de Reuilly, où se tient la Foire du Trône.</span></li>
            <li><b>Arrivée</b><span>Retour par l'avenue de Gravelle : le vélodrome est à moins d'un kilomètre.</span></li>
          </ul>
        ) },
        { eyebrow: 'Le vélodrome', title: 'Une piste neuve depuis 2015', children: (
          <div className="prose">
            <p>
              La piste du vélodrome Jacques Anquetil a été détruite en 2013 pour en reconstruire une nouvelle,
              remise en service pour les cyclistes en 2015. C'est là que se juge l'arrivée.
            </p>
          </div>
        ) },
      ]}
    />
  )
}

// ---------- 03 Kid's Foulées ----------
export function KidsPage() {
  const EDITION = useEdition()
  return (
    <Page
      eyebrow="L'épreuve"
      title="Kid's Foulées"
      photo="/photos/kids.jpg"
      intro="Deux courses par catégorie d'âge, départ et arrivée dans le vélodrome Jacques Anquetil (la Cipale)."
      sections={[
        { eyebrow: 'Deux distances', title: 'Une course pour chaque âge', wide: true, children: (
          <div className="disc">
            <article>
              <h3>1 000 m <span>{EDITION.departs[2].heure}</span></h3>
              <p>Enfants de 7 à 9 ans. <Ext href="/plans/parcours-kids-1000m.jpg">Plan du parcours ↗</Ext></p>
            </article>
            <article>
              <h3>1 500 m <span>{EDITION.departs[3].heure}</span></h3>
              <p>Enfants de 10 et 11 ans. <Ext href="/plans/parcours-kids-1500m.jpg">Plan du parcours ↗</Ext></p>
            </article>
          </div>
        ) },
        { eyebrow: 'Bon à savoir', title: 'Pas de certificat médical', children: (
          <ul className="spots">
            <li><b>Santé</b><span>Pas de certificat médical pour les courses enfants.</span></li>
            <li><b>Documents</b><span>L'autorisation parentale et l'attestation de santé, obligatoires pour les mineurs, figurent sur la <Ext href={DOCS.fiche}>fiche descriptive</Ext> et sont à déposer lors de l'inscription.</span></li>
            <li><b>Places</b><span>Chaque course est limitée à 100 enfants.</span></li>
            <li><b>Tarif</b><span>{EDITION.departs[2].prix} (édition {EDITION.reference}).</span></li>
          </ul>
        ) },
        { eyebrow: 'Avant le départ', title: 'Inscrire les enfants', children: <Inscription quoi="Inscriptions Kids" /> },
      ]}
    />
  )
}

// ---------- 04 I Run for Chimps ----------
export function ChimpsPage() {
  const EDITION = useEdition()
  return (
    <Page
      eyebrow="L'épreuve · Dossard solidaire"
      title="I Run for Chimps"
      photo="/photos/chimps.jpg"
      intro="En achetant un dossard solidaire I Run for Chimps, vous aidez à protéger les chimpanzés sauvages de Sebitoli, en Ouganda."
      sections={[
        { eyebrow: "L'association", title: 'Projet pour la Conservation des Grands Singes', children: (
          <div className="prose">
            <p>
              Créée en 2006 par la primatologue Sabrina Krief et le photographe Jean-Michel Krief, l'association
              préserve les chimpanzés et leur habitat naturel, la forêt tropicale, en harmonie avec les populations
              locales. Au nord du parc national de Kibale, ses actions sont portées par le{' '}
              <Ext href={DOCS.sebitoli}>Sebitoli Chimpanzee Project</Ext>, une équipe de 30 Ougandais.
            </p>
            <p>
              Objectifs : lutter contre le braconnage et désamorcer les collets qui mutilent les chimpanzés,
              limiter les conflits entre faune sauvage et agriculteurs, réduire pesticides et pollution plastique.
            </p>
          </div>
        ) },
        { eyebrow: 'Le dossard', title: 'Courir utile', children: (
          <ul className="spots">
            <li><b>Option</b><span>{EDITION.optionChimps} sur le prix du dossard 5 km ou 10 km (édition {EDITION.reference}).</span></li>
            <li><b>Cadeau</b><span>Un t-shirt fabriqué en France, avec le dessin original d'un dessinateur de presse ou de BD.</span></li>
          </ul>
        ) },
        { eyebrow: 'Ils ont couru', title: 'Une mobilisation qui dure', children: (
          <ul className="spots">
            <li><b>2019</b><span>200 coureurs solidaires parmi les 1 200 des Foulées.</span></li>
            <li><b>2021</b><span>Une mobilisation dans toute la France et au-delà.</span></li>
            <li><b>Depuis 2022</b><span>150 coureurs chaque année, en t-shirt illustré. Venez nombreux avec vos proches et vos amis !</span></li>
          </ul>
        ) },
        { eyebrow: 'Avant le départ', title: 'Choisir le dossard solidaire', children: <Inscription quoi="Dossard I Run for Chimps" /> },
      ]}
    />
  )
}

// ---------- 05 Éco-responsable ----------
export function EcoPage() {
  return (
    <Page
      eyebrow="L'épreuve"
      title="Une course éco-responsable"
      photo="/photos/chimps.jpg"
      intro="Le développement durable est la pierre angulaire des Foulées du 12ème : une course douce pour la planète, et pour la santé des coureurs."
      sections={[
        { eyebrow: 'Notre ambition', title: 'Tendre vers le zéro impact', children: (
          <div className="prose">
            <p>
              Outre notre engagement aux côtés d'I Run for Chimps, nous organisons une course qui tend vers le
              « zéro impact » carbone, en faveur de la biodiversité et pour la promotion de la santé des coureurs.
            </p>
          </div>
        ) },
        { eyebrow: 'Nos engagements', title: 'Concrètement, le jour J', children: (
          <ul className="spots">
            <li><b>Transport</b><span>Transports en commun et vélo encouragés pour coureurs et supporters.</span></li>
            <li><b>Ravitaillement</b><span>Bio, avec des produits de France et si possible d'Île-de-France.</span></li>
            <li><b>Zéro plastique</b><span>Pas de bouteilles d'eau : des gobelets réutilisables remplis aux rampes à eau de l'arrivée.</span></li>
            <li><b>Médaille</b><span>En bois labellisé PEFC, pour tous les arrivants.</span></li>
            <li><b>Cadeaux</b><span>Un cadeau éco-responsable pour chaque participant.</span></li>
            <li><b>Déchets</b><span>Une bonne gestion des déchets, avec les bénévoles du club.</span></li>
          </ul>
        ) },
      ]}
    />
  )
}

// ---------- 06 Infos pratiques ----------
export function InfosPage() {
  const EDITION = useEdition()
  return (
    <Page
      eyebrow={`Préparer sa venue · ${EDITION.date}`}
      title="Infos pratiques"
      photo="/photos/vitesse.jpg"
      intro={`Retrait des dossards, accès, vestiaires et règlement. Les informations ci-dessous sont celles de l'édition ${EDITION.reference} ; elles seront confirmées pour ${EDITION.annee}.`}
      sections={[
        { eyebrow: 'Avant la course', title: 'Retrait des dossards', children: (
          <ul className="spots">
            {EDITION.retrait.map((r) => <li key={r.jour}><b>{r.jour}</b><span>{r.quand} · {r.ou}</span></li>)}
          </ul>
        ) },
        { eyebrow: 'Le jour J', title: 'Départs, sas et meneurs d’allure', wide: true, children: (
          <>
            <Tarifs />
            <div className="prose" style={{ marginTop: '1.4rem' }}>
              <p>
                Sur le 10 km, 7 sas de départ : − 35′, − 38′, − 40′, − 45′, − 50′, − 55′, − 1 h et plus d'une heure.
                Pour les sas − 35′, − 38′ et − 40′, un justificatif est à joindre lors de l'inscription.
                Des meneurs d'allure courent en 40′, 45′, 50′, 55′ et 1 h.
              </p>
            </div>
          </>
        ) },
        { eyebrow: 'Sur place', title: 'Accès et vestiaires', wide: true, children: (
          <dl className="contact-grid">
            <div><dt>Vestiaires et douches</dt><dd>Vélodrome Jacques Anquetil « La Cipale », 51 avenue de Gravelle, 75012 Paris</dd></div>
            <div><dt>Métro</dt><dd>Ligne 8 : Liberté, Charenton-Écoles, Porte Dorée ou Porte de Charenton</dd></div>
            <div><dt>Tramway</dt><dd>T3a : Porte Dorée ou Porte de Charenton · stations Vélib' autour du parcours</dd></div>
            <div><dt>Stationnement</dt><dd>Avenue de Gravelle, fermée à la circulation le dimanche dès 7h30 et jusqu'à la fin des courses</dd></div>
          </dl>
        ) },
        { eyebrow: 'Documents', title: 'Règlement et fiche descriptive', children: (
          <Liens liens={[
            { label: 'Règlement complet de la course (PDF)', href: DOCS.reglement },
            { label: 'Fiche descriptive (PDF)', href: DOCS.fiche },
            { label: `Affiche de l'édition ${EDITION.reference}`, href: '/photos/affiche-2026.jpg' },
          ]} />
        ) },
      ]}
    />
  )
}

// ---------- 07 Résultats et photos ----------
export function ResultatsPage() {
  const { data: editions, error } = useFetch(() => api.getEditions(), [])
  return (
    <Page
      eyebrow="Archives"
      title="Résultats et photos"
      photo="/photos/chimps.jpg"
      intro="Classements, albums des photographes bénévoles et vidéos de chaque édition, de la plus récente à la plus ancienne."
      sections={[
        { eyebrow: 'Nouveau · en test', title: 'Retrouver ses photos par dossard', children: (
          <>
            <div className="prose">
              <p>Saisissez votre numéro de dossard pour retrouver vos photos. En cas d'anomalie, écrivez à <a href={`mailto:${DOCS.webmaster}`}>{DOCS.webmaster}</a>.</p>
            </div>
            <p className="more-links"><Ext href={DOCS.dossard}>Rechercher mes photos →</Ext></p>
          </>
        ) },
        ...(error ? [{ title: 'Archives indisponibles', children: <p className="note">Les archives n'ont pas pu être chargées. Merci de réessayer dans quelques instants.</p> }] : []),
      ...(editions || []).map((e) => ({
          id: `edition-${e.annee}`,
          eyebrow: `Édition ${e.annee}`,
          title: <Ordinaux>{e.titre || `Les Foulées ${e.annee}`}</Ordinaux>,
          wide: true,
          children: (
            <>
              {e.texte && <div className="prose"><p>{e.texte}</p></div>}
              {e.resultats && <p className="more-links"><Ext href={e.resultats}>Résultats {e.annee} →</Ext></p>}
              {e.groupes.map((g) => (
                <div className="liens-groupe" key={g.titre}>
                  <h3>{g.titre}</h3>
                  <Liens liens={g.liens} />
                </div>
              ))}
            </>
          ),
        })),
      ]}
    />
  )
}

// ---------- 08 Club organisateur ----------
export function ClubPage() {
  return (
    <Page
      eyebrow="Club organisateur"
      title="La SAM Paris 12"
      photo="/photos/kids.jpg"
      intro="La Société Athlétique de Montrouge fut l'un des premiers clubs d'athlétisme de la capitale. Installée depuis une quarantaine d'années dans le 12e arrondissement, elle est devenue la SAM Paris 12."
      sections={[
        { eyebrow: 'Nos valeurs', title: 'Accueillir tous les coureurs', children: (
          <div className="prose">
            <p>
              La plupart des coureurs habitent le 12e et les arrondissements voisins (11e, 13e, 20e) ou les villes
              proches : Saint-Mandé, Charenton, Vincennes. Le club accueille sans discrimination tout public
              souhaitant pratiquer la course à pied ou la marche, encourage la pratique féminine et les relations
              entre générations, de 20 à 80 ans.
            </p>
            <p>
              Les adhérents font vivre le club : assemblées générales, bénévolat, organisation de courses comme
              les Foulées, soirées, pique-niques et sorties en province.
            </p>
          </div>
        ) },
        { eyebrow: 'Pour tous les niveaux', title: 'Du premier footing au 100 km', children: (
          <ul className="spots">
            <li><b>Encadrement</b><span>Quinze entraîneurs de course hors stade et deux de marche nordique.</span></li>
            <li><b>Débutants</b><span>Endurance, VMA, seuil, côtes : l'apprentissage des méthodes d'entraînement.</span></li>
            <li><b>Compétition</b><span>Cross, challenges piste, route du 5 km au marathon, voire 100 km.</span></li>
            <li><b>Trail</b><span>Des distances de 15 à 30 km, et au-delà pour les plus aguerris.</span></li>
            <li><b>Marche nordique</b><span>Section loisir depuis 2012, section sportive depuis octobre 2015.</span></li>
          </ul>
        ) },
        { eyebrow: 'Nous rejoindre', title: 'Courir avec le club toute l’année', children: (
          <p className="more-links"><Ext href={DOCS.club}>Visiter le site de la SAM Paris 12 →</Ext></p>
        ) },
      ]}
    />
  )
}
