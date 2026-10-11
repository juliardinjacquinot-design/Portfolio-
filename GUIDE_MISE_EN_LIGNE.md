# Mettre mon portfolio en ligne (gratuit) — GitHub Pages

Temps : environ 15 minutes. Tout est gratuit.
À la fin, ton portfolio aura une vraie adresse du type :
`https://TON-PSEUDO.github.io/portfolio/`

---

## 1. Créer un compte GitHub

1. Va sur **https://github.com** → **Sign up**.
2. Choisis un **pseudo professionnel** (il sera dans l'adresse de ton site).
   Exemple : `juliardin-rakotoniaina` → `https://juliardin-rakotoniaina.github.io/portfolio/`
3. Utilise ton adresse `juliardinjacquinot@gmail.com` ou `siojules3@gmail.com` et confirme l'e-mail.

## 2. Créer le dépôt (le dossier en ligne)

1. En haut à droite : **+** → **New repository**.
2. **Repository name** : `portfolio`
3. Coche **Public**.
4. Clique sur **Create repository**.

## 3. Envoyer tes fichiers

1. Sur la page du dépôt, clique sur le lien **« uploading an existing file »**.
2. Ouvre ton dossier `portfolio` dans l'Explorateur Windows.
3. **Sélectionne tout ce qu'il y a DEDANS** (Ctrl + A) : `index.html`, `cv.html`, `lettre.html`, le dossier `assets`…
   ⚠️ Ne glisse pas le dossier `portfolio` lui-même, mais son **contenu** : `index.html` doit être à la racine.
4. Glisse le tout dans la page GitHub, attends la fin de l'envoi.
5. En bas : **Commit changes**.

## 4. Activer GitHub Pages

1. Dans le dépôt : **Settings** → menu de gauche **Pages**.
2. **Source** : `Deploy from a branch`.
3. **Branch** : `main` et dossier `/ (root)` → **Save**.
4. Attends 1 à 2 minutes puis recharge la page : l'adresse de ton site s'affiche en haut
   (« Your site is live at … »). Clique dessus pour vérifier. 🎉

## 5. Activer le QR code (CV + portfolio)

1. Dans VS Code, ouvre **`assets/js/config.js`**.
2. Colle ton adresse entre les guillemets, par exemple :

   ```js
   window.SITE_URL = "https://juliardin-rakotoniaina.github.io/portfolio/";
   ```

3. Enregistre (Ctrl + S). Le QR code apparaît :
   - en bas de la colonne gauche du **CV** ;
   - dans la section **Contact** du portfolio.
4. Renvoie le fichier `config.js` modifié sur GitHub :
   dépôt → dossier `assets` → `js` → **Add file** → **Upload files** → glisse `config.js` → **Commit changes**.
5. Teste le QR avec l'appareil photo de ton téléphone.

## 6. Mettre à jour le site plus tard

Chaque fois que tu modifies un fichier : refais **Add file → Upload files** dans le bon dossier du dépôt,
avec le fichier modifié. Il remplace l'ancien. Le site se met à jour en 1 à 2 minutes.

---

### ⚠️ Avant de publier : ce qui sera visible par tout le monde

- Ton **téléphone** et tes **deux e-mails** apparaissent sur le site et le CV. C'est normal pour un portfolio,
  mais tu peux retirer le téléphone du site si tu préfères (section Contact de `index.html`).
- Ne mets **jamais** en ligne ton compte rendu OpenShowroom en PDF tel quel : il contient le mot de passe du compte de service.
