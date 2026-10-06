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
- Chaque partie peut être **suspendue puis reprise** plus tard.
- Une partie peut être **exportée / importée en JSON**, pour la sauvegarder ou la transférer entre appareils.

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

## Structure technique

- HTML / CSS / JavaScript pur (vanilla), aucune librairie externe.
- Stockage des données via `localStorage` du navigateur.
- Compatible mobile (boutons tactiles, pas de dépendance aux flèches natives des champs numériques).

## Transparence

Cette application a été réalisée pour l'essentiel avec l'aide d'une IA (Claude, Anthropic), à travers des échanges itératifs pour définir les règles, l'ergonomie et corriger les bugs. Pas de raison de le cacher.

