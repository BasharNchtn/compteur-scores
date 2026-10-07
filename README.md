# 🎲 Compteur de Scores

Une application web pour compter les scores de différents jeux de société, sans prise de tête.

## Fonctionnement

Il s'agit d'un **fichier HTML unique** (`index.html`), autonome, sans dépendance externe ni serveur. Ce nom n'est pas anodin : c'est celui attendu pour que la page se lance directement à l'adresse racine une fois hébergée (GitHub Pages, etc.).
Il est fait pour être **utilisé tel quel** :

- Il suffit d'ouvrir le fichier dans un navigateur (double-clic, ou glisser-déposer dans un onglet).
- Aucune installation, aucune compilation, aucun serveur nécessaire.
- Fonctionne aussi bien en local (PC, téléphone, tablette) qu'hébergé en ligne (GitHub Pages, etc.).
- Toutes les données (joueurs, parties en cours) sont stockées **localement dans le navigateur** — rien n'est envoyé sur un serveur.

Ce choix garantit qu'on peut toujours l'utiliser hors ligne, sans dépendre d'un hébergement ou d'une connexion internet.

## Jeux gérés

- **Ohanami** 🌸 — saisie saison par saison (Eau, Végétation, Pierre, Sakura), calcul automatique fidèle aux règles officielles.
- **Générique** 🔢 — compteur de points simple pour tout jeu sans règle particulière (Skyjo, Le Baron, etc.), au choix par manche ou tour par tour, plus haut ou plus bas score gagnant.
- **Mille Sabords** ☠️ — calculateur de dés complet (combinaisons, cartes Pirate, Île de la Tête-de-Mort, Magie Pirate…).
- **Mölkky** 🪵 — saisie tour par tour avec schéma des quilles, gestion des échecs consécutifs et de la règle des 50 points.

## Gestion des joueurs et des parties

- Une **liste de joueurs** commune à tous les jeux, réutilisable d'une partie à l'autre.
- À chaque nouvelle partie, le **dernier groupe de joueurs (et leur ordre)** utilisé pour ce jeu est proposé par défaut — modifiable à tout moment.
- Chaque partie peut être **suspendue puis reprise** plus tard.
- Une partie peut être **exportée / importée en JSON** individuellement, et un bouton **"Tout exporter / Tout importer"** (onglet Joueurs) permet une sauvegarde complète en un seul fichier (joueurs + toutes les parties en cours, tous jeux confondus) — utile avant de changer d'appareil ou de vider le cache du navigateur.

## Installation sur mobile

Le fichier embarque un manifeste web (auto-contenu, pas de fichier séparé) : sur Android/Chrome, le menu propose **"Ajouter à l'écran d'accueil"**, ce qui installe l'application avec sa propre icône et l'ouvre en plein écran, sans barre d'adresse — sans pour autant en faire une vraie PWA avec fonctionnement hors-ligne garanti (pas de service worker, volontairement, pour rester simple).

## Ce que cette application n'est volontairement PAS

Pour garder les choses simples et fiables, certains choix sont délibérés :

- **Pas de serveur, pas de synchronisation à distance.** Aucune donnée n'est envoyée ni reçue depuis un serveur — tout reste dans le navigateur local (`localStorage`).
- **Pas d'historique partagé entre appareils.** Une partie jouée sur un téléphone n'apparaît pas automatiquement sur un autre appareil.
- **Pas d'objectif de persistance à long terme.** Le but est de suivre le **score courant d'une partie en cours**, pas de constituer une base de données de parties.
- **Pas de statistiques intégrées.** Si on veut analyser des parties, comparer des scores dans le temps, etc., ce n'est pas le rôle de cet outil : on **exporte en JSON** et c'est une **autre application** (ou une autre page) qui s'en charge, séparément.

Bref : un compteur de score autonome, pas une plateforme de suivi de jeux de société. Si un de ces besoins devient important, la bonne réponse est un outil séparé qui consomme les exports JSON — pas d'alourdir ce fichier.

## Évolutions prévues

D'autres jeux pourront être ajoutés au fil du temps, au cas par cas selon les besoins.
Un point à garder à l'esprit : **l'application reste en français**, y compris pour les futurs jeux ajoutés — pas de version anglaise prévue pour l'instant.

## Conventions pour contribuer

Quelques règles établies au fil du développement, à respecter pour toute évolution :

- **Jamais de flèches natives sur les champs `number`** pour ajuster un score — elles n'apparaissent pas sur Chrome mobile. Toujours des boutons +/- explicites (`class="step" data-target="<id de l'input>" data-step="<n>"`), qui sont automatiquement pris en charge par `bindSteppers()`.
- **Jamais de `confirm()` / `prompt()` natifs.** L'application tourne dans un environnement où ces popups peuvent être bloquées. Toute confirmation (suppression, etc.) se fait avec une petite UI intégrée à la page (voir `attachDeleteConfirm()`).
- **Un mode de jeu = une fonction autonome.** Chaque mode (`renderRoundsTogether`, `renderOhanami`, `renderMolkky`, `renderMilleSabords`, etc.) construit son HTML *et* attache ses propres événements dans la même fonction, plutôt que de séparer "construction du HTML" et "branchement des événements" en deux blocs distants — c'est ce qui causait des bugs de variables hors de portée avant la refactorisation.
- **Toute nouvelle logique de calcul (score, règle spéciale...) doit être une fonction pure**, sans dépendance au DOM, placée avant la ligne `let tab = 'players';` dans le script — c'est ce qui permet à `tests.js` de l'extraire et de la tester.
- **Avant de publier une modification** : `node --check` sur le script extrait (évite une page blanche en cas d'erreur de syntaxe), puis `node tests.js` (vérifie que les règles de calcul existantes n'ont pas régressé). Idéalement, ajouter un test pour toute nouvelle règle de calcul.

## Structure technique

- HTML / CSS / JavaScript pur (vanilla), aucune librairie externe.
- Stockage des données via `localStorage` du navigateur.
- Compatible mobile (boutons tactiles, pas de dépendance aux flèches natives des champs numériques).

## Transparence

Cette application a été réalisée pour l'essentiel avec l'aide d'une IA (Claude, Anthropic), à travers des échanges itératifs pour définir les règles, l'ergonomie et corriger les bugs. Pas de raison de le cacher.

