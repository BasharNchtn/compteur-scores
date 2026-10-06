#!/usr/bin/env node
// Tests des fonctions pures (calcul de scores, rotation des tours, migration de schéma)
// extraites de index.html. Aucune dépendance : node tests.js
//
// Principe : on découpe le <script> de index.html juste avant la ligne
// "let tab = 'players';" (début de la partie qui dépend du DOM/localStorage),
// on exécute ce code pur dans un bac à sable (vm), puis on exporte
// explicitement les fonctions à tester via `var __exports = {...}` — car dans
// le module vm de Node, les déclarations const/let du code exécuté NE
// deviennent PAS des propriétés de l'objet sandbox (seuls `var` et les
// déclarations de fonction le font).

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) throw new Error('Impossible de trouver la balise <script> dans index.html');
const fullScript = scriptMatch[1];

const marker = "let tab = 'players';";
const cutIdx = fullScript.indexOf(marker);
if (cutIdx === -1) {
  throw new Error('Marqueur de découpe introuvable : la structure de index.html a changé, mettre à jour tests.js (marker)');
}
const pureCode = fullScript.slice(0, cutIdx);

const exportCode = `
var __exports = {
  GAMES, pyramidal, ohaFieldScore, ohanamiRoundScore, molkkyState,
  COMBO, PIRATE_CARDS, CORSAIRE_TABLE, calcMilleSabords,
  genericTurnsNextPlayer, millesabordsNextPlayer, molkkyNextPlayer,
  SCHEMA_VERSION, migrateGame
};
`;

const sandbox = {};
vm.createContext(sandbox);
try {
  vm.runInContext(pureCode + exportCode, sandbox);
} catch (e) {
  console.error('❌ Erreur en exécutant le code pur extrait de scores.html :', e.message);
  process.exit(1);
}
const X = sandbox.__exports;
if (!X || !X.calcMilleSabords) {
  throw new Error("L'extraction a échoué : __exports est vide ou incomplet. Vérifier le marqueur de découpe (index.html).");
}

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) { pass++; }
  else { fail++; console.error(`❌ ${label}`); }
}

// ==================== Mille Sabords : calcMilleSabords ====================

// Coffre plein : un groupe non-individuel <3 (sabres gaspillés) -> pas de bonus, même à 8 dés
{
  const r = X.calcMilleSabords({ skull: 0, gold: 1, diamond: 2, sabre: 2, singe: 3, perroquet: 0 }, 'none');
  check('Coffre plein refusé si un groupe est gaspillé (sabres < 3)', !r.detail.includes('coffre plein'));
}

// Coffre plein : 8 dés tous scorants, aucune tête de mort -> bonus accordé
{
  const r = X.calcMilleSabords({ skull: 0, gold: 1, diamond: 1, sabre: 3, singe: 3, perroquet: 0 }, 'none');
  check('Coffre plein accordé si les 8 dés scorent sans tête de mort', r.detail.includes('coffre plein'));
}

// Corsaire : bonus gagné même avec un bust (3 têtes de mort), si les sabres requis sont atteints
{
  const r = X.calcMilleSabords({ skull: 3, sabre: 3, sabreRequired: 3 }, 'corsaire');
  check('Corsaire réussi malgré un bust : bonus accordé', r.score === X.CORSAIRE_TABLE[3]);
}

// Corsaire : malus appliqué même sans bust, si les sabres sont insuffisants
{
  const r = X.calcMilleSabords({ skull: 0, sabre: 1, sabreRequired: 3 }, 'corsaire');
  check('Corsaire échoué sans bust : malus appliqué', r.score === -X.CORSAIRE_TABLE[3]);
}

// Bust simple (3 têtes de mort, carte neutre) -> 0 point
{
  const r = X.calcMilleSabords({ skull: 3, gold: 5 }, 'none');
  check('3 têtes de mort sans carte spéciale : 0 point', r.score === 0);
}

// Coffre / Île au Trésor : points protégés conservés même en cas de bust
{
  const r = X.calcMilleSabords({ skull: 3, protected: 450 }, 'coffre');
  check('Coffre : points protégés conservés malgré le bust', r.score === 450);
}

// Magie Pirate : 9 symboles identiques -> victoire immédiate signalée
{
  const r = X.calcMilleSabords({ skull: 0, gold: 9 }, 'none');
  check('Magie Pirate détectée à 9 symboles identiques', r.win === true);
}
{
  const r = X.calcMilleSabords({ skull: 0, gold: 8 }, 'none');
  check('Magie Pirate non déclenchée à 8 symboles', !r.win);
}

// ==================== Rotation des tours ====================

{
  const game = { players: ['A', 'B', 'C'], turns: [{ player: 'A', points: 5 }] };
  check('Rotation générique : joueur suivant après A', X.genericTurnsNextPlayer(game) === 'B');
}
{
  const game = { players: ['A', 'B', 'C'], turns: [] };
  check('Rotation générique : premier joueur si aucun tour', X.genericTurnsNextPlayer(game) === 'A');
}

// Mille Sabords : les entrées malus (île) ne doivent pas décaler la rotation
{
  const game = {
    players: ['A', 'B', 'C'], turns: [
      { player: 'A', points: 0, malus: false },   // A déclenche l'île
      { player: 'B', points: -100, malus: true }, // malus subi par B
      { player: 'C', points: -100, malus: true }, // malus subi par C
    ]
  };
  check('Mille Sabords : rotation ignore les entrées malus (après A -> B)', X.millesabordsNextPlayer(game) === 'B');
}

// Mölkky : un joueur éliminé (3 échecs consécutifs) est sauté dans la rotation
{
  const game = {
    players: ['A', 'B', 'C'], turns: [
      { player: 'A', points: 0 },
      { player: 'B', points: 0 }, { player: 'B', points: 0 }, { player: 'B', points: 0 }, // B éliminé
      { player: 'C', points: 10 },
    ]
  };
  check('Mölkky : joueur éliminé sauté dans la rotation', X.molkkyNextPlayer(game) === 'A');
}

// ==================== Mölkky : molkkyState ====================

{
  // Dépassement de 50 -> retombe à 25
  const game = { players: ['A'], turns: [{ player: 'A', points: 45 }, { player: 'A', points: 10 }] };
  const { st } = X.molkkyState(game);
  check('Mölkky : dépassement de 50 retombe à 25', st['A'].total === 25);
}
{
  // 50 pile -> victoire
  const game = { players: ['A', 'B'], turns: [{ player: 'A', points: 50 }] };
  const { winner, reason } = X.molkkyState(game);
  check('Mölkky : 50 pile déclenche la victoire', winner === 'A' && reason === '50 pile');
}

// ==================== Migration de schéma ====================

{
  const g = X.migrateGame({ gameType: 'generique', players: ['A'] });
  check('migrateGame : rounds/turns/entryMode initialisés par défaut',
    Array.isArray(g.rounds) && Array.isArray(g.turns) && g.entryMode === 'together');
}
{
  const g = X.migrateGame({ gameType: 'ohanami', players: ['A'] });
  check('migrateGame : ohanamiRounds initialisé (3 saisons) pour Ohanami',
    Array.isArray(g.ohanamiRounds) && g.ohanamiRounds.length === 3);
}
{
  const g = X.migrateGame({ gameType: 'molkky', players: ['A'] });
  check('migrateGame : revived initialisé pour Mölkky', typeof g.revived === 'object');
}
{
  // Un champ déjà présent ne doit pas être écrasé
  const g = X.migrateGame({ gameType: 'generique', players: ['A'], entryMode: 'turns' });
  check('migrateGame : ne remplace pas un champ déjà renseigné', g.entryMode === 'turns');
}

// ==================== Ohanami ====================

{
  check('Score pyramidal Sakura : 4 cartes = 10 pts', X.ohaFieldScore('pink', 4) === 10);
  check('Score saison 1 : seule l\'eau compte', X.ohanamiRoundScore(0, { blue: 2, green: 5, gray: 5, pink: 5 }) === 6);
  check('Score saison 2 : eau + végétation comptent', X.ohanamiRoundScore(1, { blue: 2, green: 3, gray: 5, pink: 5 }) === 2 * 3 + 3 * 4);
}

console.log(`\n${pass} test(s) réussi(s), ${fail} échec(s).`);
process.exit(fail > 0 ? 1 : 0);
