/* =========================================================
   Portfolio Juliardin — style magazine
   Défilement fluide (Lenis), curseur rond, titres révélés
   ========================================================= */

function sessionStorageSafe(key, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch (e) { return null; }
}
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Défilement fluide ---------- */
let lenis = null;
if (typeof Lenis !== 'undefined' && !REDUCED) {
  lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), anchors: { offset: 0 } });
  (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
}
function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
// liens internes (#section) → défilement fluide
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !document.querySelector(id)) return;
    e.preventDefault();
    scrollToTarget(id);
  });
});

/* ---------- 2. Écran de chargement (compteur 0 → 100) ---------- */
(function loader() {
  const el = document.getElementById('boot');
  const count = document.getElementById('boot-count');
  const ready = () => document.body.classList.add('ready');
  if (!el) { ready(); return; }
  if (sessionStorageSafe('booted') || REDUCED) { el.classList.add('hide'); ready(); return; }
  if (lenis) lenis.stop();
  const dur = 1600, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    count.textContent = Math.round(100 * (1 - Math.pow(1 - p, 3)));
    if (p < 1) return requestAnimationFrame(step);
    setTimeout(() => {
      el.classList.add('hide');
      sessionStorageSafe('booted', '1');
      if (lenis) lenis.start();
      setTimeout(ready, 250);
    }, 250);
  })(t0);
  el.addEventListener('click', () => { el.classList.add('hide'); if (lenis) lenis.start(); ready(); });
})();

/* ---------- 3. Curseur rond ---------- */
(function cursor() {
  const c = document.getElementById('cursor');
  const label = document.getElementById('cursor-label');
  if (!c || matchMedia('(hover: none), (pointer: coarse)').matches) return;
  let x = -100, y = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); });
  document.addEventListener('mouseleave', () => c.classList.remove('on'));
  (function loop() {
    cx += (x - cx) * .18; cy += (y - cy) * .18;
    c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const withLabel = e.target.closest('[data-cursor]');
    const clickable = e.target.closest('a, button, .gallery img, .chip, .filter');
    c.classList.toggle('label', !!withLabel);
    c.classList.toggle('hover', !withLabel && !!clickable);
    label.textContent = withLabel ? withLabel.dataset.cursor : '';
  });
})();

/* ---------- 4. Titres géants : découpe en mots + révélation ---------- */
(function splitTitles() {
  document.querySelectorAll('[data-split] .line').forEach(line => {
    const words = line.textContent.split(' ');
    line.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    line.querySelectorAll('.w').forEach((w, i) => { w.style.transitionDelay = (i * 0.06) + 's'; });
  });
  document.querySelectorAll('[data-split]').forEach(t => {
    t.querySelectorAll('.line').forEach((l, i) => l.querySelectorAll('.w').forEach(w => {
      w.style.transitionDelay = (parseFloat(w.style.transitionDelay) + i * 0.12) + 's';
    }));
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.3 });
  document.querySelectorAll('[data-split], .project-shot, .about-photo').forEach(t => io.observe(t));
})();

/* ---------- 5. Apparition au scroll + barres + compteurs ---------- */
(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      e.target.querySelectorAll('.bar i').forEach(b => b.style.width = b.dataset.w + '%');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el, idx) => {
    el.style.transitionDelay = (idx % 4) * 90 + 'ms';
    io.observe(el);
  });

  function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const dur = 1400, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
})();

/* ---------- 6. Navigation ---------- */
(function nav() {
  const navEl = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-links a');
  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('nav-links');

  const onScroll = () => {
    const y = window.scrollY;
    navEl.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
    toTop.classList.toggle('at-end', y + innerHeight > document.getElementById('contact').offsetTop + 120);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (y / max) * 100 + '%';
    const ring = document.getElementById('to-top-ring');
    if (ring) ring.style.strokeDashoffset = 188.5 * (1 - Math.min(y / max, 1));
    let current = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (y >= s.offsetTop - 200) current = s.id;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  toTop.addEventListener('click', () => scrollToTarget(0));
  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    burger.textContent = menu.classList.contains('open') ? 'Fermer' : 'Menu';
  });
  links.forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.textContent = 'Menu'; }));
})();

/* ---------- 7. Thème clair (beige) / sombre ---------- */
(function theme() {
  const btn = document.getElementById('theme-toggle');
  let saved = null;
  try { saved = localStorage.getItem('theme-mag'); } catch (e) {}
  const label = () => { btn.textContent = document.documentElement.dataset.theme === 'dark' ? 'Jour' : 'Nuit'; };
  if (saved === 'dark') document.documentElement.dataset.theme = 'dark';
  label();
  btn.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (dark) delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = 'dark';
    label();
    try { localStorage.setItem('theme-mag', dark ? 'light' : 'dark'); } catch (e) {}
  });
})();

/* ---------- 8. Filtres de projets ---------- */
(function filters() {
  const btns = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.project-card');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
      c.classList.toggle('hidden', !show);
    });
    if (lenis) lenis.resize();
  }));
})();

/* ---------- 8b. Galerie horizontale épinglée (façon magazine) ---------- */
(function horizontalGallery() {
  const sec = document.querySelector('.hscroll');
  if (!sec) return;
  const track = sec.querySelector('.hscroll-track');
  const bar = sec.querySelector('.hscroll-progress i');
  const imgs = [...sec.querySelectorAll('.h-img img')];
  const mq = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  let distance = 0;
  function measure() {
    if (!mq.matches) { sec.style.height = ''; track.style.transform = ''; return; }
    distance = Math.max(0, track.scrollWidth - innerWidth);
    sec.style.height = (distance + innerHeight) + 'px';
    if (lenis) lenis.resize();
  }
  function update() {
    if (mq.matches) {
      const r = sec.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / (r.height - innerHeight || 1), 0), 1);
      const v = lenis ? Math.max(-4, Math.min(4, lenis.velocity * 0.12)) : 0;
      track.style.transform = `translate3d(${-p * distance}px, 0, 0) skewX(${-v}deg)`;
      bar.style.transform = `scaleX(${p})`;
      imgs.forEach(img => {
        const b = img.getBoundingClientRect();
        const off = (b.left + b.width / 2 - innerWidth / 2) / innerWidth;
        img.style.transform = `scale(1.15) translateX(${off * -40}px)`;
      });
    }
    requestAnimationFrame(update);
  }
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  mq.addEventListener('change', measure);
  measure();
  requestAnimationFrame(update);
})();

/* ---------- 8c. Parallaxe douce des grandes images de projets ---------- */
(function parallax() {
  if (REDUCED) return;
  const shots = [...document.querySelectorAll('.project-shot img, .frame-inner img')];
  (function loop() {
    shots.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const off = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.translate = `0 ${off * -24}px`;
    });
    requestAnimationFrame(loop);
  })();
})();

/* ---------- 8d. Boutons magnétiques ---------- */
(function magnetic() {
  if (REDUCED || matchMedia('(hover: none), (pointer: coarse)').matches) return;
  document.querySelectorAll('.btn, .icon-btn, .to-top, .copy-btn, .filter, .tfilter').forEach(el => {
    el.classList.add('magnetic');
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${x * 0.25}px ${y * 0.35}px`;
    });
    el.addEventListener('mouseleave', () => { el.style.translate = ''; });
  });
})();

/* ---------- 9. Carrousel des tutoriels (auto + manuel) ---------- */
const TUTOS = {
  t1: `<p class="tuto-kicker">GLPI · IT-Connect · 4 déc. 2025</p>
    <h3>Installer GLPI 11 sur Debian 13, pas à pas</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/vhost.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Apache 2, PHP 8.4 (PHP-FPM) et MariaDB, dossiers sensibles hors de la racine web et VirtualHost dédié.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Les dossiers <code>config</code>, <code>files</code> et <code>log</code> doivent sortir de la racine web.</li><li>Le VirtualHost Apache pointe directement sur le dossier <code>public/</code> de GLPI 11.</li><li>PHP-FPM et les extensions PHP nécessaires sont installés avant l'assistant web.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">C'est l'architecture de mon GLPI dans OpenShowroom. Le <code>DocumentRoot</code> sur <code>public/</code> explique l'incident n°6 : l'URL de l'agent ne devait pas contenir <code>/glpi</code>.</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/installation-pas-a-pas-de-glpi-10-sur-debian-12/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t2: `<p class="tuto-kicker">GLPI · Doc officielle GLPI · Documentation officielle</p>
    <h3>Install GLPI — documentation d&#x27;installation</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/portail-connexion.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Prérequis, droits sur files/ et config/, assistant d&#x27;installation web ou en ligne de commande.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Choisir la dernière version stable pour un serveur de production.</li><li>Donner au serveur web les droits d'écriture sur <code>files</code> et <code>config</code>.</li><li>L'installation peut se faire en ligne de commande, sans l'assistant web.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">La documentation officielle me sert de référence pour vérifier une étape, au lieu de me fier à un seul blog.</p>
    <p><a class="btn btn-primary" href="https://glpi-install.readthedocs.io/en/latest/install/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t3: `<p class="tuto-kicker">GLPI · Doc officielle GLPI · Documentation officielle</p>
    <h3>Command line tools — bin/console</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/sync.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Les commandes de la console GLPI, dont glpi:ldap:synchronize_users avec ses filtres et options.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li><code>bin/console</code> regroupe installation, mise à jour, maintenance et synchronisation LDAP.</li><li><code>glpi:ldap:synchronize_users</code> accepte des options pour créer, mettre à jour ou filtrer les utilisateurs.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">C'est cette commande, lancée avec <code>-vvv</code>, qui a confirmé la correction de l'incident n°5 : 29 utilisateurs importés et 27 synchronisés.</p>
    <p><a class="btn btn-primary" href="https://glpi-install.readthedocs.io/en/latest/command-line.html" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t4: `<p class="tuto-kicker">LDAP / AD · IT-Connect · 27 mars 2024</p>
    <h3>GLPI : configurer l&#x27;authentification LDAP via l&#x27;Active Directory</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/test-bind.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Extension PHP LDAP, compte de service à faibles privilèges, test de connexion et import des utilisateurs.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Installer l'extension PHP LDAP avant de configurer l'annuaire.</li><li>Utiliser un compte de service dédié avec peu de droits pour la connexion à l'AD.</li><li>Tester la connexion avant de lancer l'import des utilisateurs.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Directement lié à mes incidents n°2 (extension <code>php-ldap</code> manquante) et n°3 (format du DN du compte de bind).</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/tuto-glpi-configurer-authentification-active-directory/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t5: `<p class="tuto-kicker">LDAP / AD · RDR-IT · 8 août 2025</p>
    <h3>GLPI 11 : liaison avec Active Directory pour authentifier les utilisateurs</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/dn-corrige.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Version GLPI 11 : compte de service, import, LDAPS pour chiffrer la connexion et synchronisation planifiée.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Spécificités de la liaison AD avec GLPI 11.</li><li>Le LDAPS permet de chiffrer la connexion entre GLPI et l'annuaire.</li><li>La synchronisation se lance à la main ou par une tâche planifiée.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Piste d'amélioration pour OpenShowroom : mon GLPI utilise LDAP sur le port 389, non chiffré. Passer en LDAPS protégerait les identifiants.</p>
    <p><a class="btn btn-primary" href="https://rdr-it.com/glpi-11-liaison-avec-active-directory-pour-authentifier-les-utilisateurs/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t6: `<p class="tuto-kicker">Inventaire · IT-Connect · 30 nov. 2023</p>
    <h3>Déployer l&#x27;agent GLPI sur les postes Windows par GPO</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/agent.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Installation du MSI par stratégie de groupe, URL du serveur et tag en registre, inventaire forcé pour vérifier.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Une GPO peut installer le MSI de l'agent sur tous les postes du domaine.</li><li>L'URL du serveur GLPI et un tag se configurent par des valeurs de registre.</li><li>On vérifie en forçant un inventaire depuis l'interface locale de l'agent.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Dans mon TP, j'ai installé l'agent à la main sur un seul poste. Sur un vrai parc, la GPO éviterait de passer sur chaque machine.</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/tuto-installer-configurer-gpo-agent-glpi-windows/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t7: `<p class="tuto-kicker">Inventaire · GLPI Project · FAQ officielle</p>
    <h3>FAQ — Agent GLPI</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/preuve-inventaire.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Téléchargement, systèmes supportés, fichiers de configuration et comment forcer un inventaire.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Où trouver la configuration de l'agent selon le système.</li><li>Comment forcer un inventaire immédiat.</li><li>La différence entre inventaire partiel et complet.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Utile pour l'incident n°6 (erreur 404) : forcer l'inventaire avec <code>--force</code> et lire le message d'erreur de l'agent.</p>
    <p><a class="btn btn-primary" href="https://help.glpi-project.org/faq/fr/glpi/glpi-agent" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t8: `<p class="tuto-kicker">Active Directory · Microsoft Learn · Mis à jour le 16 août 2025</p>
    <h3>Installer les services de domaine Active Directory</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/ad-groupes.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Installer AD DS avec PowerShell ou le Gestionnaire de serveur : nouvelle forêt, domaine, contrôleur supplémentaire.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>AD DS s'installe par le Gestionnaire de serveur ou en PowerShell.</li><li>Les droits nécessaires diffèrent selon qu'on crée une forêt, un domaine ou un contrôleur supplémentaire.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Mission 1 d'OpenShowroom : création du domaine <code>Showroom.net</code> sur Windows Server 2022.</p>
    <p><a class="btn btn-primary" href="https://learn.microsoft.com/fr-fr/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t9: `<p class="tuto-kicker">Active Directory · Microsoft Learn · Mis à jour le 16 août 2025</p>
    <h3>Joindre un ordinateur à un domaine</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/domaine-uac.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Jonction par les Paramètres, le Panneau de configuration ou netdom join, et réparation d&#x27;une relation d&#x27;approbation.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Plusieurs méthodes de jonction : Paramètres, Panneau de configuration, <code>netdom join</code>.</li><li>Comment réparer un poste qui a perdu sa relation d'approbation avec le domaine.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Jonction du poste Windows 11 au domaine SHOWROOM, prouvée dans mon dossier de validation.</p>
    <p><a class="btn btn-primary" href="https://learn.microsoft.com/fr-fr/windows-server/identity/ad-ds/manage/join-computer-to-domain" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t10: `<p class="tuto-kicker">Sécurité · IT-Connect · 19 août 2024</p>
    <h3>Créer un domaine Active Directory respectueux des bonnes pratiques de sécurité</h3>
    <div class="tuto-cover"><img src="assets/img/tutos/securite-domaine.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Création d&#x27;un domaine durci avec l&#x27;outil libre Hello-My-Dir : GPO, politiques de mots de passe, score PingCastle.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Un domaine peut être durci dès sa création plutôt que corrigé après.</li><li>Les GPO et les politiques de mots de passe affinées renforcent l'annuaire.</li><li>Le résultat se mesure avec un outil d'audit comme PingCastle.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Mon domaine de TP utilise les réglages par défaut. Ce tutoriel montre ce qu'il faudrait faire en production : il complète ma veille sur la sécurité de l'AD.</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/comment-creer-un-domaine-active-directory-respectueux-des-bonnes-pratiques-de-securite/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t11: `<p class="tuto-kicker">Sécurité · IT-Connect · 18 juil. 2022</p>
    <h3>Audit Active Directory avec PingCastle : comment bien débuter ?</h3>
    <div class="tuto-cover"><img src="assets/img/tutos/pingcastle.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Lancer un audit gratuit de son propre AD, lire le score sur 100 et corriger les points faibles les plus courants.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>PingCastle s'utilise gratuitement pour auditer son propre AD.</li><li>Il donne un score de risque sur 100 avec un rapport détaillé.</li><li>Exemple de correction : désactiver le spouleur d'impression sur les contrôleurs de domaine.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Prochaine étape pour OpenShowroom : auditer le domaine <code>Showroom.net</code> et corriger les points relevés.</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/comment-auditer-lactive-directory-avec-pingcastle/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t12: `<p class="tuto-kicker">Réseau & virtualisation · IT-Connect · 10 avr. 2023</p>
    <h3>Comprendre les différents types de réseaux de VMware Workstation Pro</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/vmnet.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>NAT, Bridged, Host-only, LAN Segment et Custom : ce que chaque mode permet entre la VM, l&#x27;hôte et Internet.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>NAT : la VM sort sur Internet via l'hôte.</li><li>Host-only : réseau privé entre l'hôte et les VM, sans Internet.</li><li>Deux VM sur deux réseaux virtuels différents ne se voient pas.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">C'est la cause exacte de mon incident n°1 : la VM Debian était sur VMnet8 (NAT) et le serveur AD sur VMnet0 (Host-only).</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/comprendre-les-differents-types-de-reseaux-de-vmware-workstation-pro/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
  t13: `<p class="tuto-kicker">Réseau & virtualisation · IT-Connect · 18 mars 2022</p>
    <h3>Comment configurer une adresse IP fixe sur Debian 13 ?</h3>
    <div class="tuto-cover"><img src="assets/img/glpi/interfaces.jpg" alt=""></div>
    <h4>Le tutoriel</h4>
    <p>Passer une interface de DHCP à une IP statique dans /etc/network/interfaces, vérifier passerelle et DNS.</p>
    <h4>Ce que j'en retiens</h4>
    <ul><li>Vérifier l'adresse, la passerelle et le DNS actuels avant de modifier.</li><li>Déclarer l'interface en <code>static</code> dans <code>/etc/network/interfaces</code>.</li><li>La méthode s'applique à Debian 11, 12 et 13.</li></ul>
    <h4>Lien avec mon travail</h4>
    <p class="veille-me">Solution de mon incident n°1 : 2ᵉ carte <code>ens33</code> en <code>192.168.45.20</code>, avec le DNS pointant vers le contrôleur de domaine.</p>
    <p><a class="btn btn-primary" href="https://www.it-connect.fr/comment-configurer-une-adresse-ip-fixe-sur-debian-11/" target="_blank" rel="noopener">Lire le tutoriel ↗</a></p>`,
};

(function tutoCarousel() {
  const track = document.getElementById('tcar-track');
  if (!track) return;
  const cards = () => [...track.querySelectorAll('.tcard:not(.hidden)')];
  const bar = document.getElementById('tcar-bar');
  const step = () => { const c = cards()[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24) : 400; };
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const go = dir => {
    if (dir > 0 && atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };
  document.getElementById('tcar-next').addEventListener('click', () => { go(1); pause(); });
  document.getElementById('tcar-prev').addEventListener('click', () => { go(-1); pause(); });
  track.addEventListener('scroll', () => {
    const max = track.scrollWidth - track.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? Math.max(0.08, track.scrollLeft / max) : 1})`;
  }, { passive: true });

  // défilement automatique, mis en pause pendant que l'on interagit
  let timer = null, resume = null, visible = false;
  const start = () => { if (REDUCED || timer) return; timer = setInterval(() => { if (visible && !document.hidden) go(1); }, 4500); };
  const stop = () => { clearInterval(timer); timer = null; };
  const pause = () => { stop(); clearTimeout(resume); resume = setTimeout(start, 7000); };
  ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(ev => track.addEventListener(ev, pause, { passive: true }));
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', () => { clearTimeout(resume); resume = setTimeout(start, 1500); });
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0.3 }).observe(track);
  start();

  // glisser à la souris
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('mousedown', e => { down = true; moved = false; sx = e.pageX; sl = track.scrollLeft; track.classList.add('dragging'); });
  window.addEventListener('mouseup', () => { down = false; track.classList.remove('dragging'); });
  track.addEventListener('mousemove', e => { if (!down) return; const dx = e.pageX - sx; if (Math.abs(dx) > 5) moved = true; track.scrollLeft = sl - dx; });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  // filtres
  const btns = document.querySelectorAll('.tfilter');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.tfilter;
    track.querySelectorAll('.tcard').forEach(c => c.classList.toggle('hidden', f !== 'all' && c.dataset.tcat !== f));
    track.scrollTo({ left: 0 });
    track.dispatchEvent(new Event('scroll'));
    pause();
  }));
  track.dispatchEvent(new Event('scroll'));
})();

/* ---------- 10. Détail des projets (fenêtre) ---------- */
const PROJECTS = {
  glpi: `
    <h3>OpenShowroom — Active Directory, GLPI 11 & LDAP</h3>
    <p><em>Atelier professionnel BTS SIO2 SISR · Septembre – octobre 2026 · Domaine <code>Showroom.net</code></em></p>

    <div class="doc-downloads">
      <a class="doc-dl" href="assets/docs/OpenShowroom_Dossier_de_validation.pdf" target="_blank" rel="noopener" download>
        <span class="doc-dl-type">PDF · 7 pages</span>
        <strong>Dossier de validation</strong>
        <span>Preuves : utilisateurs et groupes AD, jonction du poste, authentification et habilitations GLPI</span>
        <span class="doc-dl-cta">Télécharger ↓</span>
      </a>
      <a class="doc-dl" href="assets/docs/OpenShowroom_Recette_et_Guide_utilisateur.pdf" target="_blank" rel="noopener" download>
        <span class="doc-dl-type">PDF · 7 pages</span>
        <strong>Fiche de recette + guide utilisateur</strong>
        <span>16 tests fonctionnels (16/16 validés) et guide du portail GLPI pour les utilisateurs</span>
        <span class="doc-dl-cta">Télécharger ↓</span>
      </a>
    </div>

    <h4>Objectif</h4>
    <p>Mettre en place l'infrastructure de gestion d'une entreprise fictive, <strong>OpenShowroom</strong> : un annuaire centralisé des utilisateurs, un outil de gestion de parc et de helpdesk connecté à cet annuaire, et l'inventaire automatique des postes.</p>

    <h4>Architecture</h4>
<div class="archi">      VMware Workstation - réseau VMnet0 (Host-only) 192.168.45.0/24

 +--------------------------+     LDAP :389     +--------------------------+
 | Windows Server 2022      | <---------------- | Debian 13                |
 | AD DS + DNS              |                   | Apache + PHP + GLPI 11   |
 | domaine Showroom.net     |                   | ens33 : 192.168.45.20    |
 | 192.168.45.10            |                   | ens37 : NAT (Internet)   |
 +--------------------------+                   +--------------------------+
              ^                                              ^
              | jonction au domaine        inventaire HTTP   |
              |                       (/front/inventory.php) |
 +------------+----------------------------------------------+-------------+
 |              Windows 11 - poste client + GLPI Agent                     |
 +-------------------------------------------------------------------------+</div>

    <h4>Missions réalisées</h4>
    <ol class="modal-steps">
      <li><strong>Active Directory</strong> : domaine <code>Showroom.net</code>, utilisateurs, groupes, jonction du poste Windows 11.</li>
      <li><strong>GLPI 11</strong> installé sur Debian 13 (Apache, PHP, base de données).</li>
      <li><strong>Intégration AD ↔ GLPI</strong> : annuaire LDAP avec compte de service, import et synchronisation des utilisateurs.</li>
      <li><strong>Habilitations</strong> : profils Self-Service (utilisateurs) et Technicien.</li>
      <li><strong>GLPI Agent</strong> sur le poste Windows 11 : inventaire matériel et logiciel remonté dans GLPI.</li>
      <li><strong>Gestion des tickets</strong> : création, attribution, résolution, et base de connaissances réservée aux techniciens.</li>
      <li><strong>Documentation</strong> : dossier de validation, fiche de recette et guide utilisateur du portail.</li>
    </ol>

    <h4>Recette — 16 tests, 16 validés</h4>
    <div class="recette">
      <div class="recette-row"><span>Déploiement Active Directory</span><span class="recette-bar"><i style="--n:4"></i></span><b>4/4</b></div>
      <div class="recette-row"><span>Déploiement GLPI</span><span class="recette-bar"><i style="--n:2"></i></span><b>2/2</b></div>
      <div class="recette-row"><span>Intégration LDAP / annuaire AD</span><span class="recette-bar"><i style="--n:2"></i></span><b>2/2</b></div>
      <div class="recette-row"><span>Habilitations et profils</span><span class="recette-bar"><i style="--n:2"></i></span><b>2/2</b></div>
      <div class="recette-row"><span>Inventaire GLPI Agent</span><span class="recette-bar"><i style="--n:2"></i></span><b>2/2</b></div>
      <div class="recette-row"><span>Gestion des tickets</span><span class="recette-bar"><i style="--n:4"></i></span><b>4/4</b></div>
      <p class="recette-verdict">Verdict : <strong>infrastructure conforme aux attentes — recette acceptée.</strong> Tests réalisés avec <code>dcdiag</code>, <code>nslookup</code>, connexions de comptes AD, synchronisation LDAP et cycle de vie complet d'un ticket.</p>
    </div>

    <h4>Preuves de validation</h4>
    <div class="gallery">
      <figure><img src="assets/img/glpi/ad-utilisateurs.jpg" alt="Utilisateurs Active Directory"><figcaption>Utilisateurs et groupes du domaine Showroom.net</figcaption></figure>
      <figure><img src="assets/img/glpi/ad-groupes.jpg" alt="Groupes métiers AD"><figcaption>Groupes métiers : Comptabilité, Développement, Direction…</figcaption></figure>
      <figure><img src="assets/img/glpi/domaine-uac.jpg" alt="Poste joint au domaine"><figcaption>Poste Windows 11 joint au domaine SHOWROOM</figcaption></figure>
      <figure><img src="assets/img/glpi/portail-connexion.jpg" alt="Connexion GLPI via AD"><figcaption>Connexion GLPI avec la source « AD Showroom »</figcaption></figure>
      <figure><img src="assets/img/glpi/profil-selfservice.jpg" alt="Profil Self-Service"><figcaption>Compte AD avec le profil Self-Service</figcaption></figure>
      <figure><img src="assets/img/glpi/profil-technicien.jpg" alt="Profil Technicien"><figcaption>Compte AD avec le profil Technicien</figcaption></figure>
      <figure class="wide-fig"><img src="assets/img/glpi/preuve-inventaire.jpg" alt="Preuve d'inventaire GLPI Agent"><figcaption>Preuve d'inventaire : poste DESKTOP-Client remonté par GLPI Agent (clé de produit floutée)</figcaption></figure>
      <figure><img src="assets/img/glpi/portail-accueil.jpg" alt="Portail utilisateur GLPI"><figcaption>Portail self-service présenté dans le guide utilisateur</figcaption></figure>
    </div>

    <h4>Captures du déploiement et du dépannage</h4>
    <div class="gallery">
      <figure><img src="assets/img/glpi/vmnet.jpg" alt="Réseaux virtuels VMware"><figcaption>Réseaux virtuels VMware (VMnet0 / VMnet8)</figcaption></figure>
      <figure><img src="assets/img/glpi/ldapsearch.jpg" alt="ldapsearch réussi"><figcaption>ldapsearch réussi vers l'AD</figcaption></figure>
      <figure><img src="assets/img/glpi/php-ldap.jpg" alt="Extension PHP LDAP manquante"><figcaption>GLPI : extension PHP LDAP manquante</figcaption></figure>
      <figure><img src="assets/img/glpi/test-bind.jpg" alt="Test LDAP GLPI"><figcaption>Test de l'annuaire LDAP dans GLPI</figcaption></figure>
      <figure><img src="assets/img/glpi/dn-corrige.jpg" alt="DN du compte corrigé"><figcaption>DN du compte de service corrigé</figcaption></figure>
      <figure><img src="assets/img/glpi/log-filtre.jpg" alt="Log GLPI Bad search filter"><figcaption>Log GLPI : « Bad search filter »</figcaption></figure>
      <figure><img src="assets/img/glpi/sync.jpg" alt="Synchronisation réussie"><figcaption>Synchronisation LDAP réussie</figcaption></figure>
      <figure><img src="assets/img/glpi/vhost.jpg" alt="VirtualHost Apache"><figcaption>VirtualHost Apache de GLPI 11</figcaption></figure>
      <figure><img src="assets/img/glpi/inventaire-config.jpg" alt="Configuration inventaire"><figcaption>Configuration de l'inventaire GLPI</figcaption></figure>
      <figure><img src="assets/img/glpi/agent.jpg" alt="GLPI Agent"><figcaption>GLPI Agent exécuté sur Windows 11</figcaption></figure>
    </div>

    <h4>Incidents diagnostiqués et résolus</h4>
    <div class="incidents">
      <div class="incident"><b>1 · Réseau</b><span class="sym">ping et ldapsearch échouent vers l'AD</span><span class="cause">VM Debian sur VMnet8 (NAT), AD sur VMnet0 (Host-only)</span><span class="fix">2ᵉ carte réseau sur VMnet0 + IP statique <code>192.168.45.20</code></span></div>
      <div class="incident"><b>2 · PHP</b><span class="sym">« Extension LDAP de PHP non installée »</span><span class="cause">seul <code>ldap-utils</code> était installé</span><span class="fix"><code>apt install php-ldap</code> + redémarrage d'Apache</span></div>
      <div class="incident"><b>3 · Bind LDAP</b><span class="sym">« Invalid credentials (49) »</span><span class="cause">compte saisi au format UPN</span><span class="fix">DN complet : <code>CN=Service GLPI,CN=Users,DC=Showroom,DC=net</code></span></div>
      <div class="incident"><b>4 · Timeout</b><span class="sym">synchronisation lente puis en échec</span><span class="cause">referrals AD suivis par PHP, délai de 10 s trop court</span><span class="fix">test isolé en PHP, timeout porté à 30 s</span></div>
      <div class="incident"><b>5 · Filtre</b><span class="sym">import : « Aucun résultat trouvé »</span><span class="cause">espace invisible dans <code>samaccountname</code> (auto-complétion)</span><span class="fix">lecture de <code>php-errors.log</code>, champ ressaisi, <code>ldap:synchronize_users</code></span></div>
      <div class="incident"><b>6 · Inventaire</b><span class="sym">GLPI Agent : « 404 Not Found »</span><span class="cause">préfixe <code>/glpi</code> en trop (DocumentRoot sur <code>public/</code>)</span><span class="fix">URL corrigée : <code>/front/inventory.php</code></span></div>
    </div>

    <h4>Ce que j'en retiens</h4>
    <p>Ne jamais se fier uniquement à l'interface web : reproduire l'action en ligne de commande (<code>ldapsearch</code>, script PHP, <code>bin/console</code>), lire les <strong>logs applicatifs</strong> et vérifier la configuration serveur (Apache, réseau) au lieu de la supposer correcte.</p>

    <h4>Compétences BTS SIO mobilisées</h4>
    <ul>
      <li>Administrer un service d'annuaire (Active Directory, DNS, utilisateurs et groupes)</li>
      <li>Installer et configurer un service sous Linux (Debian, Apache, PHP, GLPI)</li>
      <li>Gérer le patrimoine informatique : inventaire automatique des postes</li>
      <li>Gérer les habilitations et les droits d'accès (profils GLPI, compte de service)</li>
      <li>Diagnostiquer et résoudre des incidents, puis rédiger un compte rendu technique</li>
      <li>Réaliser les tests d'intégration et d'acceptation d'un service (fiche de recette)</li>
      <li>Accompagner les utilisateurs dans la mise en place d'un service (guide utilisateur)</li>
    </ul>`,
  vm: `
    <h3>Poste Linux avec VM Windows 10 en plein écran</h3>
    <p><em>Réalisé en stage au Collège de Majicavo Lamir (mai – juin 2026)</em></p>
    <h4>Contexte</h4>
    <p>Mettre en place un poste de travail qui tourne sous <strong>Linux</strong>, tout en permettant à l'utilisateur de travailler dans un environnement <strong>Windows 10</strong> qu'il connaît, sans changer ses habitudes.</p>
    <h4>Ce que j'ai fait</h4>
    <ol class="modal-steps">
      <li>Installation et configuration du système d'exploitation <strong>Linux</strong> sur le poste.</li>
      <li>Installation de <strong>VMware</strong> et création d'une <strong>machine virtuelle Windows 10</strong>.</li>
      <li>Configuration du lancement <strong>automatique</strong> de la VM au démarrage du PC.</li>
      <li>Passage de la VM en <strong>plein écran</strong> dès l'ouverture : l'utilisateur a l'impression d'être directement sous Windows.</li>
      <li>Tests de démarrage et vérification du bon fonctionnement pour l'utilisateur.</li>
    </ol>
    <h4>Résultat</h4>
    <p>Un poste qui démarre directement sur Windows 10 « en apparence », alors que la machine tourne réellement sous Linux. La VM peut être sauvegardée ou restaurée facilement.</p>
    <h4>Compétences mobilisées</h4>
    <ul>
      <li>Installer et configurer un système d'exploitation</li>
      <li>Mettre en place un environnement virtualisé</li>
      <li>Répondre au besoin d'un utilisateur de façon transparente</li>
    </ul>`,
  launcher: `
    <h3>EduLaunch — lanceur d'applications éducatives</h3>
    <p><em>Réalisé pendant mon stage au Collège de Majicavo Lamir (18 mai – 19 juin 2026) · Python (Flask) + HTML/CSS/JavaScript · version 5</em></p>

    <div class="gallery">
      <figure><img src="assets/img/edulaunch/accueil.jpg" alt="Accueil EduLaunch"><figcaption>Accueil — espace Élève</figcaption></figure>
      <figure><img src="assets/img/edulaunch/categorie.jpg" alt="Applications par matière"><figcaption>Applications classées par matière</figcaption></figure>
      <figure><img src="assets/img/edulaunch/admin.jpg" alt="Mode administrateur"><figcaption>Mode Administrateur</figcaption></figure>
      <figure><img src="assets/img/edulaunch/parametres.jpg" alt="Paramètres admin"><figcaption>Paramètres admin</figcaption></figure>
    </div>

    <h4>Contexte & besoin</h4>
    <p>Dans un établissement scolaire, les élèves perdent du temps à chercher leurs logiciels (GeoGebra, Scratch, LibreOffice, Google Earth…) et ont accès à tout le bureau Windows. <strong>EduLaunch</strong> remplace le bureau par une interface simple, organisée par matière et <strong>sécurisée par profil</strong>, qui fonctionne <strong>entièrement hors ligne</strong> sur le poste.</p>

    <h4>Architecture</h4>
<div class="archi">Navigateur (Chrome/Edge en mode app)
      │  interface HTML / CSS / JavaScript
      ▼  requêtes fetch → API REST (31 routes)
Serveur Flask local  — http://localhost:5891
      │
      ├── /api/launch        → lance l'exécutable (subprocess)
      ├── /api/scan_excel    → lit config_lanceur.xlsx (openpyxl)
      ├── /api/scan_executables → registre Windows (winreg)
      ├── /api/extract_icon  → icône extraite du .exe (pywin32 / PIL)
      ├── /api/export_config · /api/import_config
      └── /api/diagnostic · /api/logs/export (CSV)
      ▼
Fichiers JSON : settings · favorites · recent · logs · docs_tree</div>

    <h4>Fonctionnalités principales</h4>
    <div class="feature-grid">
      <div class="feature"><strong>👥 3 espaces</strong><span>Élève (libre), Professeur et Administrateur protégés par mot de passe.</span></div>
      <div class="feature"><strong>📊 Import Excel</strong><span>L'admin coche dans un fichier Excel les apps à afficher, par catégorie et par profil.</span></div>
      <div class="feature"><strong>🔍 Scan du PC</strong><span>Détection des logiciels installés via le registre Windows et les raccourcis .lnk.</span></div>
      <div class="feature"><strong>🖼️ Logos automatiques</strong><span>Association auto des icônes PNG, ou extraction directe depuis le fichier .exe.</span></div>
      <div class="feature"><strong>📁 Documents de cours</strong><span>Les profs créent des dossiers par matière et choisissent qui peut les voir.</span></div>
      <div class="feature"><strong>📤 Export / Import</strong><span>Toute la configuration partagée entre postes en un seul fichier JSON.</span></div>
      <div class="feature"><strong>📜 Journaux</strong><span>Historique des lancements, statistiques, export CSV, page de diagnostic.</span></div>
      <div class="feature"><strong>🎨 Confort</strong><span>5 thèmes, mode sombre, mode Examen, minuteur de séance, météo de Mamoudzou.</span></div>
    </div>

    <h4>Ma démarche</h4>
    <ol class="modal-steps">
      <li>Analyse du besoin : organiser les logiciels par matière et limiter l'accès selon le profil.</li>
      <li>Prototype de l'interface en HTML/CSS/JavaScript, inspiré du logiciel MNCN utilisé en établissement.</li>
      <li>Développement du serveur <strong>Flask</strong> et de l'API qui lance les applications Windows.</li>
      <li>Outils d'administration : import Excel, scan des exécutables, extraction d'icônes, export de config.</li>
      <li>Tests, corrections et sauvegardes successives jusqu'à la <strong>version 5</strong>.</li>
      <li>Rédaction de la documentation : README, <strong>guide utilisateur</strong> et fiche de présentation (15 sections).</li>
    </ol>

    <h4>Compétences BTS SIO mobilisées</h4>
    <ul>
      <li>Répondre aux besoins des utilisateurs et gérer le patrimoine applicatif d'un établissement</li>
      <li>Mettre à disposition un service informatique (déploiement sur les postes, configuration exportable)</li>
      <li>Gérer les droits d'accès par profil (Élève / Prof / Admin)</li>
      <li>Développer une application client-serveur : Python, Flask, API REST, JavaScript, JSON</li>
      <li>Rédiger une documentation technique et utilisateur</li>
    </ul>

    <h4>Pistes d'amélioration</h4>
    <ul>
      <li>Stocker les mots de passe <strong>hachés</strong> (bcrypt) plutôt qu'en clair dans settings.json</li>
      <li>Authentification liée à l'Active Directory de l'établissement</li>
      <li>Déploiement automatique sur tout un parc (GPO / script d'installation)</li>
    </ul>`,
  depannage: `
    <h3>Dépannage : jeu qui ne se lance plus</h3>
    <p><em>Projet personnel — diagnostic matériel & logiciel</em></p>
    <h4>Problème</h4>
    <p>Le jeu <strong>Batman Arkham Knight</strong> refusait de se lancer sur un PC équipé d'un processeur <strong>AMD Ryzen 7</strong> avec carte graphique <strong>Radeon intégrée</strong> et 32 Go de RAM.</p>
    <h4>Démarche de résolution</h4>
    <ol class="modal-steps">
      <li>Analyse du symptôme et identification des causes possibles (pilotes, API graphique, options du pilote).</li>
      <li>Mise à jour des pilotes graphiques via <strong>AMD Software : Adrenalin Edition</strong>.</li>
      <li>Ajout de l'option de lancement <code>-dx11</code> dans Steam pour forcer DirectX 11.</li>
      <li>Désactivation de <strong>Radeon Boost</strong> et <strong>Anti-Lag</strong> dans le logiciel AMD.</li>
      <li>Test de lancement : le jeu fonctionne à nouveau ✔</li>
    </ol>
    <h4>Compétences mobilisées</h4>
    <ul>
      <li>Méthodologie de diagnostic (hypothèse → test → validation)</li>
      <li>Gestion et mise à jour de pilotes</li>
      <li>Paramétrage logiciel avancé</li>
    </ul>`,
  portfolio: `
    <h3>Ce portfolio</h3>
    <p><em>Projet web personnel</em></p>
    <h4>Objectif</h4>
    <p>Présenter mon parcours, mes compétences et mes projets de BTS SIO de façon moderne et interactive.</p>
    <h4>Fonctionnalités</h4>
    <ul>
      <li>Direction artistique « magazine » : fond beige, typographie géante, mise en page éditoriale</li>
      <li>Écran de chargement avec compteur, titres révélés mot par mot</li>
      <li>Défilement fluide (Lenis) et curseur personnalisé qui réagit aux liens</li>
      <li>Galerie à défilement horizontal épinglée, parallaxe des images et boutons magnétiques</li>
      <li>Section de tutoriels de référence (IT-Connect, Microsoft Learn, documentation GLPI) filtrable par thème</li>
      <li>Documents de projet téléchargeables (dossier de validation, fiche de recette, guide utilisateur)</li>
      <li>Apparition des sections au défilement, compteurs et barres de compétences animés</li>
      <li>Thème beige / sombre mémorisé</li>
      <li>Filtres de projets et fenêtres de détail</li>
      <li>CV et lettre de motivation imprimables en PDF (une page A4 chacun)</li>
      <li>Tableau de synthèse des compétences E5 relié aux fiches projets</li>
      <li>Section de veille technologique avec sources vérifiées</li>
      <li>QR code généré automatiquement à partir de l'adresse du site</li>
      <li>Site responsive (ordinateur, tablette, téléphone)</li>
    </ul>
    <h4>Technologies</h4>
    <p><code>HTML5</code> <code>CSS3</code> <code>JavaScript</code> <code>IntersectionObserver</code> <code>Lenis</code> — sans framework.</p>`
};

(function modal() {
  const m = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const close = () => { m.classList.remove('open'); document.body.style.overflow = ''; if (lenis) lenis.start(); };
  m.querySelector('.modal-box').setAttribute('data-lenis-prevent', '');
  // liens du tableau de synthèse → ouvrent la fiche du projet
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => document.querySelector(`[data-project="${btn.dataset.open}"]`).click());
  });
  document.querySelectorAll('[data-tuto]').forEach(btn => {
    btn.addEventListener('click', () => {
      content.innerHTML = TUTOS[btn.dataset.tuto];
      m.querySelector('.modal-box').classList.remove('wide');
      m.querySelector('.modal-box').scrollTop = 0;
      m.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', () => {
      content.innerHTML = PROJECTS[card.dataset.project];
      m.querySelector('.modal-box').classList.toggle('wide', ['launcher', 'glpi'].includes(card.dataset.project));
      m.querySelector('.modal-box').scrollTop = 0;
      m.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });
  document.getElementById('modal-close').addEventListener('click', close);
  // Agrandir une capture d'écran
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  content.addEventListener('click', e => {
    if (e.target.matches('.gallery img')) {
      lb.querySelector('img').src = e.target.src;
      lb.classList.add('open');
    }
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  m.addEventListener('click', e => { if (e.target === m) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (lb.classList.contains('open')) lb.classList.remove('open'); else close(); } });
})();

/* ---------- 11. Contact ---------- */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const done = () => {
      const c = document.getElementById('copied');
      c.textContent = btn.dataset.copy + ' — copié';
      c.classList.add('show');
      setTimeout(() => c.classList.remove('show'), 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(done).catch(done);
    else done();
  });
});
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- 12. QR code du site (si SITE_URL est renseigné dans config.js) ---------- */
(function siteQr() {
  const url = (window.SITE_URL || '').trim();
  if (!url || typeof qrcode === 'undefined') return;
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  document.getElementById('site-qr-img').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  document.getElementById('site-qr').hidden = false;
})();
