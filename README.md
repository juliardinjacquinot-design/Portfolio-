# Portfolio de Juliardin Jacquinot RAKOTONIAINA — BTS SIO

## Style

Direction artistique « magazine » : fond beige, texte noir, typographie géante,
défilement fluide et curseur rond. Bouton **Nuit / Jour** en haut à droite pour le thème sombre.

## Ouvrir le site dans VS Code

1. Dézippe le dossier `portfolio`.
2. Dans VS Code : **Fichier → Ouvrir le dossier…** → choisis `portfolio`.
3. Installe l'extension **Live Server** (Ritwick Dey) si ce n'est pas déjà fait.
4. Ouvre `index.html`, puis clique sur **« Go Live »** en bas à droite
   (ou clic droit sur `index.html` → *Open with Live Server*).
5. Le site s'ouvre dans ton navigateur et se met à jour à chaque sauvegarde.

## Organisation

```
portfolio/
├── index.html          → la page principale
├── cv.html             → le CV (bouton « Télécharger en PDF »)
├── lettre.html         → la lettre de motivation (idem)
└── assets/
    ├── css/style.css   → style du portfolio
    ├── css/docs.css    → style du CV et de la lettre
    ├── js/config.js    → ⭐ adresse de ton site (pour le QR code)
    ├── js/qrcode.js    → librairie QR code (licence MIT, Kazuhiko Arase)
    ├── js/lenis.min.js → défilement fluide (licence MIT, darkroom.engineering)
    ├── js/main.js      → animations et interactions
    ├── img/            → photo, captures EduLaunch et GLPI
    └── docs/           → PDF du projet OpenShowroom (validation, recette + guide)
```

## Mettre le site en ligne + QR code

Suis le guide **`GUIDE_MISE_EN_LIGNE.md`** (GitHub Pages, gratuit).
Ensuite, colle l'adresse de ton site dans **`assets/js/config.js`** : un QR code apparaît sur le CV et dans la section Contact.

## Mettre à jour une certification

Dans `index.html`, section *Certifications & formations* : quand tu as obtenu une certification, remplace
`<span class="cert-status todo-status">Objectif</span>` par `<span class="cert-status done-status">Obtenue</span>`.

## À compléter

Cherche `todo` (Ctrl+Shift+F dans VS Code) : tous les textes en orange sont à remplir
(seulement le destinataire de la lettre, à adapter à chaque candidature).

## Ajouter un projet

1. Dans `index.html`, copie un bloc `<article class="project-card" ...>` dans la section **Projets**
   et donne-lui un nouveau `data-project="monprojet"`.
2. Dans `assets/js/main.js`, ajoute le détail dans l'objet `PROJECTS` :
   `monprojet: \`<h3>Titre</h3><p>Description…</p>\``.

## Ajouter un tutoriel

1. Dans `index.html`, section **Tutos & ressources**, copie un bloc `<article class="tcard" ...>`.
   Change l'image, la catégorie `data-tcat` (`glpi`, `ldap`, `inventaire`, `ad`, `securite`, `reseau`),
   la date, le titre, la description, le lien de la source et l'identifiant `data-tuto="t14"`.
2. Dans `assets/js/main.js`, ajoute l'analyse correspondante dans l'objet `TUTOS` :
   `t14: \`<h3>Titre</h3> ... \``.
3. Mets à jour le nombre dans le bouton « Tout (13) ».

## Ajouter un document téléchargeable

Place le PDF dans `assets/docs/`, puis ajoute un bloc `<a class="doc-dl" ...>` dans la fiche du projet (`assets/js/main.js`).
⚠️ Avant de publier un document, vérifie qu'il ne contient ni mot de passe ni clé de licence.
