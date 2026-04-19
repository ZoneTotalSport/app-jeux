#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const POSES = '../../img/poses/';
const GYM_BG = '../../img/gymnase.png';
const GYM_FLOOR = '../../img/gymnase-plancher.png';
const OUT_DIR = path.join(__dirname, 'data', 'img');

// pose shortcuts
const P = {
  court: `${POSES}root_cour_de_peur.png`,
  tag: `${POSES}root_joue_à_la_tag.png`,
  gardien: `${POSES}root_gardien_de_but.png`,
  evite: `${POSES}root_évite_de_se_faire_toucher.png`,
  lance: `${POSES}root_lance_ballon.png`,
  attrape: `${POSES}roots_qui_attrape_le_ballon.png`,
  saute_evite: `${POSES}root_saute_éviter_ballon.png`,
  debout: `${POSES}root_debout.png`,
  attente: `${POSES}root_en_attente.png`,
  victoire: `${POSES}root_victoire.png`,
  stresse: `${POSES}root_stressé.png`,
  accroupi: `${POSES}root_accroupi.png`,
  couche: `${POSES}root_couché_sur_le_dos.png`,
  assis: `${POSES}root_assis_par_terre.png`,
  partenaire: `${POSES}root_avec_partenaire_main_dans_la_main.png`,
  dos_a_dos: `${POSES}root_et_partenaire_dos_à_dos.png`,
  yeux_bandes: `${POSES}root_les_yeux_bandés.png`,
  parachute: `${POSES}root_secoue_parachute.png`,
  kick: `${POSES}root_kick_ballon.png`,
  file: `${POSES}root_en_file_indienne.png`,
  singe: `${POSES}root_qui_fait_le_singe.png`,
  quatre_pattes: `${POSES}root_marche_4_pattes.png`,
  ramper: `${POSES}root_ramper.png`,
  push_up: `${POSES}root_en_train_de_faire_des_push_up.png`,
  plat_ventre: `${POSES}root_avance_à_plat_ventre.png`,
  plonge: `${POSES}root_plonge.png`,
  defense: `${POSES}root_défense.png`,
  flag: `${POSES}root_flag_game.png`,
  pointe: `${POSES}root_qui_pointe_à_droite.png`,
  transporte: `${POSES}root_transporte_équipement.png`,
  omnikin: `${POSES}root_ballon_omnikin.png`,
  corde: `${POSES}root_saut_à_la_corde.png`,
  hockey: `${POSES}root_manipule_bâton_hockey.png`,
  saut: `${POSES}root_saut_droit.png`,
  souffle: `${POSES}root_souffle.png`,
  thumb: `${POSES}root_ontent_thumb_up.png`,
  regarde: `${POSES}root_regarde_au_loin.png`,
  echappe: `${POSES}root_échappe_le_ballon.png`,
  pointe_lance: `${POSES}root_pointe_lancer_ballon.png`,
  sur_cote: `${POSES}root_sur_le_côté.png`,
  tirer: `${POSES}root_tirer_quelqu'un_avec_outil.png`,
  collegue: `${POSES}root_et_son_collègue_bras_croisés.png`,
};

// Characters: {pose, x, y, w, h, flip}
// Arrows: {x1,y1, cx,cy, x2,y2, color, dash}
// Labels: {text, x, y, color, bg}

function svgHeader(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 700 400" font-family="'Luckiest Guy', 'Bangers', Arial, sans-serif">
  <defs>
    <style>@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&amp;family=Bangers&amp;display=swap');</style>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-opacity="0.2"/>
    </filter>
    <marker id="arrowGreen" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
      <polygon points="0 0, 12 4, 0 8" fill="#4CAF50"/>
    </marker>
    <marker id="arrowYellow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
      <polygon points="0 0, 12 4, 0 8" fill="#FFD600"/>
    </marker>
    <marker id="arrowRed" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
      <polygon points="0 0, 12 4, 0 8" fill="#e53935"/>
    </marker>
    <marker id="arrowBlue" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
      <polygon points="0 0, 12 4, 0 8" fill="#1976D2"/>
    </marker>
    <clipPath id="gymClip"><rect x="10" y="40" width="680" height="310" rx="10"/></clipPath>
  </defs>

  <!-- Background gymnase -->
  <image xlink:href="${GYM_BG}" x="0" y="0" width="700" height="400" preserveAspectRatio="xMidYMid slice"/>
  <rect x="0" y="0" width="700" height="400" fill="rgba(255,255,255,0.6)"/>

  <!-- Plancher -->
  <image xlink:href="${GYM_FLOOR}" x="10" y="40" width="680" height="310" clip-path="url(#gymClip)" preserveAspectRatio="xMidYMid slice"/>
  <rect x="10" y="40" width="680" height="310" rx="10" fill="none" stroke="#8B6914" stroke-width="2"/>

  <!-- Titre -->
  <rect x="80" y="3" width="540" height="34" rx="10" fill="rgba(255,255,255,0.92)" filter="url(#shadow)"/>
  <text x="350" y="28" text-anchor="middle" font-size="18" fill="#1a1a1a" font-family="'Luckiest Guy'">${escXml(title)}</text>
`;
}

function renderChar(c) {
  const img = `<image xlink:href="${c.pose}" x="${c.x}" y="${c.y}" width="${c.w||90}" height="${c.h||90}"/>`;
  if (c.flip) {
    const tx = 2 * c.x + (c.w||90);
    return `  <g filter="url(#shadow)"><g transform="translate(${tx}, 0) scale(-1, 1)">${img}</g></g>\n`;
  }
  return `  <g filter="url(#shadow)">${img}</g>\n`;
}

function renderLabel(l) {
  const w = l.text.length * 8 + 16;
  const bg = l.bg || '#e53935';
  return `  <rect x="${l.x - w/2}" y="${l.y}" width="${w}" height="20" rx="5" fill="${bg}" opacity="0.9"/>
  <text x="${l.x}" y="${l.y + 15}" text-anchor="middle" font-size="11" fill="white" font-family="'Bangers'">${escXml(l.text)}</text>\n`;
}

function renderArrow(a) {
  const marker = a.color === '#4CAF50' ? 'arrowGreen' : a.color === '#FFD600' ? 'arrowYellow' : a.color === '#e53935' ? 'arrowRed' : 'arrowBlue';
  const dash = a.dash ? ' stroke-dasharray="10,5"' : '';
  return `  <path d="M${a.x1},${a.y1} C${a.cx||((a.x1+a.x2)/2)},${a.cy||((a.y1+a.y2)/2)} ${a.cx2||((a.x1+a.x2)/2)},${a.cy2||((a.y1+a.y2)/2)} ${a.x2},${a.y2}" stroke="${a.color}" stroke-width="4" fill="none" marker-end="url(#${marker})"${dash}/>\n`;
}

function renderLegend(items) {
  const totalW = items.reduce((s, it) => s + (it.pose ? 42 : 0) + it.text.length * 8 + 20, 20);
  const startX = Math.max(10, 350 - totalW/2);
  let svg = `  <g transform="translate(${startX}, 358)">\n`;
  svg += `    <rect x="0" y="0" width="${totalW + 20}" height="38" rx="8" fill="rgba(255,255,255,0.92)" filter="url(#shadow)"/>\n`;
  let cx = 15;
  for (const it of items) {
    if (it.pose) {
      svg += `    <image xlink:href="${it.pose}" x="${cx}" y="3" width="30" height="30"/>\n`;
      cx += 35;
    }
    if (it.line) {
      svg += `    <line x1="${cx}" y1="19" x2="${cx+35}" y2="19" stroke="${it.color}" stroke-width="3"${it.dash ? ' stroke-dasharray="5,3"' : ''}/>\n`;
      cx += 40;
    }
    svg += `    <text x="${cx}" y="25" font-size="12" fill="${it.color || '#333'}" font-family="'Bangers'">${escXml(it.text)}</text>\n`;
    cx += it.text.length * 8 + 15;
  }
  svg += `  </g>\n`;
  return svg;
}

function renderZones(type) {
  if (type === 'lr') {
    return `  <text x="36" y="200" text-anchor="middle" font-size="14" fill="white" font-family="'Bangers'" letter-spacing="2" transform="rotate(-90, 36, 200)">DÉPART</text>
  <text x="665" y="200" text-anchor="middle" font-size="14" fill="white" font-family="'Bangers'" letter-spacing="2" transform="rotate(90, 665, 200)">ARRIVÉE</text>\n`;
  }
  if (type === 'teams') {
    return `  <line x1="350" y1="45" x2="350" y2="345" stroke="white" stroke-width="2" opacity="0.5"/>\n`;
  }
  return '';
}

function escXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildSvg(title, zones, chars, arrows, labels, legend) {
  let svg = svgHeader(title);
  svg += renderZones(zones);
  for (const c of chars) svg += renderChar(c);
  for (const a of arrows) svg += renderArrow(a);
  for (const l of labels) svg += renderLabel(l);
  svg += renderLegend(legend);
  svg += '</svg>';
  return svg;
}

// ============ GAME DEFINITIONS ============

const games = {
  MO1_001: { // Tag dos à dos
    title: '🏷️ TAG DOS À DOS',
    zones: '',
    chars: [
      {pose: P.dos_a_dos, x: 280, y: 120, w: 120, h: 120},
      {pose: P.tag, x: 140, y: 150, w: 90, h: 90},
      {pose: P.court, x: 480, y: 150, w: 90, h: 90, flip: true},
    ],
    arrows: [
      {x1:230,y1:195,x2:155,y2:195, cx:190,cy:190, cx2:170,cy2:192, color:'#FFD600'},
      {x1:400,y1:195,x2:480,y2:195, cx:430,cy:190, cx2:460,cy2:192, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'DOS À DOS', x:340, y:245, bg:'#1976D2'}],
    legend: [
      {pose:P.dos_a_dos, text:'Duo', color:'#1976D2'},
      {pose:P.tag, text:'Tagueur', color:'#e53935'},
      {line:true, dash:true, text:'Fuit', color:'#4CAF50'},
    ],
  },
  MO1_002: { // Tag partie du corps
    title: '🏷️ TAG PARTIE DU CORPS',
    zones: '',
    chars: [
      {pose: P.tag, x: 300, y: 130, w: 95, h: 95},
      {pose: P.court, x: 150, y: 140, w: 90, h: 90, flip: true},
      {pose: P.evite, x: 450, y: 140, w: 90, h: 90},
    ],
    arrows: [
      {x1:300,y1:180,x2:240,y2:185, cx:270,cy:178, cx2:250,cy2:182, color:'#FFD600'},
      {x1:150,y1:185,x2:80,y2:170, cx:120,cy:180, cx2:100,cy2:175, color:'#4CAF50', dash:true},
      {x1:450,y1:185,x2:550,y2:170, cx:490,cy:180, cx2:520,cy2:175, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'TAGUEUR', x:348, y:228, bg:'#e53935'}],
    legend: [
      {pose:P.tag, text:'Tagueur', color:'#e53935'},
      {pose:P.court, text:'Joueur', color:'#1976D2'},
      {line:true, dash:true, text:'Fuit', color:'#4CAF50'},
      {line:true, text:'Tague', color:'#FFD600'},
    ],
  },
  MO1_003: { // Bombardement de quilles
    title: '🎳 BOMBARDEMENT DE QUILLES',
    zones: 'teams',
    chars: [
      {pose: P.lance, x: 150, y: 130, w: 90, h: 90, flip: true},
      {pose: P.defense, x: 480, y: 130, w: 90, h: 90},
      {pose: P.debout, x: 200, y: 250, w: 50, h: 50},
      {pose: P.debout, x: 500, y: 250, w: 50, h: 50},
    ],
    arrows: [
      {x1:240,y1:175,x2:470,y2:175, cx:320,cy:150, cx2:400,cy2:150, color:'#FFD600'},
    ],
    labels: [
      {text:'QUILLES', x:225, y:305, bg:'#FF9800'},
      {text:'QUILLES', x:525, y:305, bg:'#FF9800'},
      {text:'ÉQ. A', x:180, y:100, bg:'#1976D2'},
      {text:'ÉQ. B', x:520, y:100, bg:'#e53935'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {pose:P.defense, text:'Défend', color:'#e53935'},
      {line:true, text:'Lancer', color:'#FFD600'},
    ],
  },
  MO1_004: { // Boxball
    title: '🥊 BOXBALL',
    zones: '',
    chars: [
      {pose: P.kick, x: 200, y: 140, w: 90, h: 90, flip: true},
      {pose: P.court, x: 430, y: 140, w: 90, h: 90, flip: true},
    ],
    arrows: [
      {x1:290,y1:185,x2:430,y2:185, cx:340,cy:160, cx2:390,cy2:165, color:'#4CAF50', dash:true},
      {x1:430,y1:200,x2:290,y2:200, cx:380,cy:225, cx2:330,cy2:220, color:'#FFD600'},
    ],
    labels: [
      {text:'FRAPPE', x:245, y:235, bg:'#e53935'},
      {text:'COURT', x:475, y:235, bg:'#1976D2'},
    ],
    legend: [
      {pose:P.kick, text:'Frappe', color:'#e53935'},
      {pose:P.court, text:'Court', color:'#1976D2'},
      {line:true, dash:true, text:'Balle', color:'#4CAF50'},
    ],
  },
  MO1_005: { // Feu sur la montagne
    title: '🔥 FEU SUR LA MONTAGNE',
    zones: '',
    chars: [
      {pose: P.court, x: 150, y: 100, w: 80, h: 80, flip: true},
      {pose: P.court, x: 400, y: 100, w: 80, h: 80, flip: true},
      {pose: P.court, x: 280, y: 220, w: 80, h: 80, flip: true},
      {pose: P.pointe, x: 300, y: 110, w: 90, h: 90},
    ],
    arrows: [
      {x1:195,y1:185,x2:260,y2:260, cx:210,cy:220, cx2:240,cy2:245, color:'#4CAF50', dash:true},
      {x1:445,y1:185,x2:370,y2:260, cx:430,cy:220, cx2:390,cy2:245, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'MENEUR', x:345, y:205, bg:'#FF9800'}],
    legend: [
      {pose:P.pointe, text:'Meneur', color:'#FF9800'},
      {pose:P.court, text:'Joueurs', color:'#1976D2'},
      {line:true, dash:true, text:'Se regroupe', color:'#4CAF50'},
    ],
  },
  MO1_006: { // Soccer en crabe
    title: '🦀 SOCCER EN CRABE',
    zones: 'teams',
    chars: [
      {pose: P.push_up, x: 170, y: 160, w: 90, h: 90},
      {pose: P.push_up, x: 440, y: 160, w: 90, h: 90},
      {pose: P.kick, x: 310, y: 160, w: 80, h: 80},
    ],
    arrows: [
      {x1:390,y1:200,x2:480,y2:200, cx:420,cy:195, cx2:450,cy2:198, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:215, y:145, bg:'#1976D2'},
      {text:'ÉQ. B', x:485, y:145, bg:'#e53935'},
    ],
    legend: [
      {pose:P.push_up, text:'Crabe', color:'#1976D2'},
      {line:true, dash:true, text:'Ballon', color:'#4CAF50'},
    ],
  },
  MO1_007: { // Course du dragon
    title: '🐉 COURSE DU DRAGON',
    zones: 'lr',
    chars: [
      {pose: P.file, x: 130, y: 120, w: 90, h: 90, flip: true},
      {pose: P.file, x: 210, y: 120, w: 90, h: 90, flip: true},
      {pose: P.file, x: 290, y: 120, w: 90, h: 90, flip: true},
      {pose: P.file, x: 130, y: 230, w: 90, h: 90, flip: true},
      {pose: P.file, x: 210, y: 230, w: 90, h: 90, flip: true},
      {pose: P.file, x: 290, y: 230, w: 90, h: 90, flip: true},
    ],
    arrows: [
      {x1:380,y1:165,x2:600,y2:165, cx:450,cy:150, cx2:530,cy2:155, color:'#4CAF50', dash:true},
      {x1:380,y1:275,x2:600,y2:275, cx:450,cy:260, cx2:530,cy2:265, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'DRAGON 1', x:240, y:105, bg:'#1976D2'},
      {text:'DRAGON 2', x:240, y:215, bg:'#e53935'},
    ],
    legend: [
      {pose:P.file, text:'En file', color:'#1976D2'},
      {line:true, dash:true, text:'Course', color:'#4CAF50'},
    ],
  },
  MO1_008: { // Ballon chasseur croisé
    title: '💥 BALLON CHASSEUR CROISÉ',
    zones: 'teams',
    chars: [
      {pose: P.lance, x: 140, y: 120, w: 85, h: 85, flip: true},
      {pose: P.lance, x: 140, y: 230, w: 85, h: 85, flip: true},
      {pose: P.saute_evite, x: 460, y: 120, w: 85, h: 85},
      {pose: P.saute_evite, x: 460, y: 230, w: 85, h: 85},
    ],
    arrows: [
      {x1:225,y1:160,x2:450,y2:270, cx:300,cy:180, cx2:380,cy2:250, color:'#FFD600'},
      {x1:225,y1:270,x2:450,y2:160, cx:300,cy:250, cx2:380,cy2:180, color:'#FFD600'},
    ],
    labels: [
      {text:'ÉQ. A', x:180, y:100, bg:'#1976D2'},
      {text:'ÉQ. B', x:500, y:100, bg:'#e53935'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {pose:P.saute_evite, text:'Évite', color:'#e53935'},
      {line:true, text:'Lancer croisé', color:'#FFD600'},
    ],
  },
  MO1_009: { // Ballon chasseur européen
    title: '⚽ BALLON CHASSEUR EUROPÉEN',
    zones: 'teams',
    chars: [
      {pose: P.lance, x: 150, y: 150, w: 90, h: 90, flip: true},
      {pose: P.defense, x: 470, y: 150, w: 90, h: 90},
      {pose: P.debout, x: 580, y: 260, w: 60, h: 60},
    ],
    arrows: [
      {x1:240,y1:195,x2:460,y2:195, cx:320,cy:170, cx2:400,cy2:170, color:'#FFD600'},
    ],
    labels: [
      {text:'ÉQ. A', x:195, y:130, bg:'#1976D2'},
      {text:'ÉQ. B', x:515, y:130, bg:'#e53935'},
      {text:'BUT', x:610, y:250, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {pose:P.defense, text:'Défend', color:'#e53935'},
      {line:true, text:'Lancer', color:'#FFD600'},
    ],
  },
  MO1_010: { // Capture du drapeau 4 bases
    title: '🚩 CAPTURE DU DRAPEAU 4 BASES',
    zones: '',
    chars: [
      {pose: P.flag, x: 80, y: 70, w: 80, h: 80},
      {pose: P.flag, x: 530, y: 70, w: 80, h: 80},
      {pose: P.flag, x: 80, y: 240, w: 80, h: 80},
      {pose: P.flag, x: 530, y: 240, w: 80, h: 80},
      {pose: P.court, x: 300, y: 155, w: 80, h: 80, flip: true},
    ],
    arrows: [
      {x1:380,y1:195,x2:530,y2:115, cx:440,cy:170, cx2:490,cy2:140, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'BASE 1', x:120, y:55, bg:'#1976D2'},
      {text:'BASE 2', x:570, y:55, bg:'#e53935'},
      {text:'BASE 3', x:120, y:225, bg:'#4CAF50'},
      {text:'BASE 4', x:570, y:225, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.flag, text:'Drapeau', color:'#FF9800'},
      {pose:P.court, text:'Joueur', color:'#1976D2'},
      {line:true, dash:true, text:'Capture', color:'#4CAF50'},
    ],
  },
  MO1_011: { // Navires à l'horizon
    title: '⚓ NAVIRES À L\'HORIZON',
    zones: '',
    chars: [
      {pose: P.pointe, x: 300, y: 80, w: 95, h: 95},
      {pose: P.court, x: 150, y: 200, w: 80, h: 80, flip: true},
      {pose: P.accroupi, x: 400, y: 220, w: 80, h: 80},
      {pose: P.couche, x: 250, y: 260, w: 80, h: 80},
    ],
    arrows: [
      {x1:345,y1:180,x2:200,y2:220, cx:280,cy:190, cx2:240,cy2:210, color:'#FFD600'},
    ],
    labels: [{text:'CAPITAINE', x:348, y:180, bg:'#FF9800'}],
    legend: [
      {pose:P.pointe, text:'Capitaine', color:'#FF9800'},
      {pose:P.court, text:'Matelots', color:'#1976D2'},
    ],
  },
  MO1_012: { // Ballon cercle
    title: '⭕ BALLON CERCLE',
    zones: '',
    chars: [
      {pose: P.debout, x: 300, y: 60, w: 70, h: 70},
      {pose: P.debout, x: 420, y: 120, w: 70, h: 70},
      {pose: P.debout, x: 420, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 300, y: 280, w: 70, h: 70},
      {pose: P.debout, x: 180, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 180, y: 120, w: 70, h: 70},
      {pose: P.kick, x: 300, y: 170, w: 80, h: 80},
    ],
    arrows: [],
    labels: [{text:'BALLON', x:340, y:255, bg:'#FF9800'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {pose:P.kick, text:'Frappe', color:'#e53935'},
    ],
  },
  MO1_013: { // Évasion des monstres
    title: '👹 ÉVASION DES MONSTRES',
    zones: '',
    chars: [
      {pose: P.singe, x: 300, y: 100, w: 100, h: 100},
      {pose: P.court, x: 130, y: 170, w: 85, h: 85, flip: true},
      {pose: P.transporte, x: 480, y: 170, w: 85, h: 85},
    ],
    arrows: [
      {x1:480,y1:215,x2:130,y2:215, cx:350,cy:240, cx2:250,cy2:230, color:'#4CAF50', dash:true},
      {x1:350,y1:200,x2:490,y2:215, cx:400,cy:205, cx2:450,cy2:210, color:'#FFD600'},
    ],
    labels: [{text:'MONSTRE', x:350, y:205, bg:'#e53935'}],
    legend: [
      {pose:P.singe, text:'Monstre', color:'#e53935'},
      {pose:P.transporte, text:'Aventurier', color:'#1976D2'},
      {line:true, dash:true, text:'Vole trésor', color:'#4CAF50'},
    ],
  },
  MO1_014: { // Électricité
    title: '⚡ ÉLECTRICITÉ',
    zones: '',
    chars: [
      {pose: P.partenaire, x: 220, y: 100, w: 80, h: 80},
      {pose: P.partenaire, x: 350, y: 100, w: 80, h: 80},
      {pose: P.partenaire, x: 220, y: 220, w: 80, h: 80},
      {pose: P.partenaire, x: 350, y: 220, w: 80, h: 80},
    ],
    arrows: [
      {x1:300,y1:140,x2:350,y2:140, cx:320,cy:135, cx2:340,cy2:137, color:'#FFD600'},
      {x1:300,y1:260,x2:350,y2:260, cx:320,cy:255, cx2:340,cy2:257, color:'#FFD600'},
    ],
    labels: [{text:'SQUEEZE!', x:325, y:175, bg:'#FF9800'}],
    legend: [
      {pose:P.partenaire, text:'En cercle', color:'#1976D2'},
      {line:true, text:'Signal', color:'#FFD600'},
    ],
  },
  MO1_015: { // Bobsleigh humain
    title: '🛷 BOBSLEIGH HUMAIN',
    zones: 'lr',
    chars: [
      {pose: P.assis, x: 150, y: 140, w: 80, h: 80},
      {pose: P.assis, x: 220, y: 140, w: 80, h: 80},
      {pose: P.assis, x: 290, y: 140, w: 80, h: 80},
      {pose: P.assis, x: 150, y: 240, w: 80, h: 80},
      {pose: P.assis, x: 220, y: 240, w: 80, h: 80},
      {pose: P.assis, x: 290, y: 240, w: 80, h: 80},
    ],
    arrows: [
      {x1:370,y1:180,x2:600,y2:180, cx:440,cy:170, cx2:530,cy2:172, color:'#4CAF50', dash:true},
      {x1:370,y1:280,x2:600,y2:280, cx:440,cy:270, cx2:530,cy2:272, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'ÉQ. 1', x:250, y:125, bg:'#1976D2'},
      {text:'ÉQ. 2', x:250, y:225, bg:'#e53935'},
    ],
    legend: [
      {pose:P.assis, text:'Assis en file', color:'#1976D2'},
      {line:true, dash:true, text:'Glisse!', color:'#4CAF50'},
    ],
  },
  MO1_016: { // Baseball alaskien
    title: '⚾ BASEBALL ALASKIEN',
    zones: '',
    chars: [
      {pose: P.lance, x: 150, y: 140, w: 90, h: 90, flip: true},
      {pose: P.court, x: 400, y: 100, w: 80, h: 80, flip: true},
      {pose: P.court, x: 440, y: 200, w: 80, h: 80, flip: true},
      {pose: P.attrape, x: 500, y: 140, w: 80, h: 80},
    ],
    arrows: [
      {x1:240,y1:185,x2:490,y2:185, cx:320,cy:150, cx2:420,cy2:160, color:'#FFD600'},
      {x1:440,y1:150,x2:440,y2:200, cx:450,cy:170, cx2:445,cy2:185, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'BATTEUR', x:195, y:235, bg:'#1976D2'}],
    legend: [
      {pose:P.lance, text:'Batteur', color:'#1976D2'},
      {pose:P.court, text:'Coureurs', color:'#4CAF50'},
      {line:true, text:'Lancer', color:'#FFD600'},
    ],
  },
  MO1_017: { // Kickball californien
    title: '🦶 KICKBALL CALIFORNIEN',
    zones: '',
    chars: [
      {pose: P.kick, x: 150, y: 160, w: 90, h: 90, flip: true},
      {pose: P.court, x: 350, y: 100, w: 80, h: 80, flip: true},
      {pose: P.attrape, x: 500, y: 160, w: 80, h: 80},
    ],
    arrows: [
      {x1:240,y1:205,x2:490,y2:205, cx:330,cy:180, cx2:420,cy2:185, color:'#4CAF50', dash:true},
      {x1:350,y1:185,x2:500,y2:130, cx:400,cy:165, cx2:460,cy2:145, color:'#FFD600', dash:true},
    ],
    labels: [{text:'BOTTEUR', x:195, y:255, bg:'#e53935'}],
    legend: [
      {pose:P.kick, text:'Botte', color:'#e53935'},
      {pose:P.court, text:'Court', color:'#1976D2'},
      {line:true, dash:true, text:'Course', color:'#4CAF50'},
    ],
  },
  MO1_018: { // Tag pansement
    title: '🩹 TAG PANSEMENT',
    zones: '',
    chars: [
      {pose: P.tag, x: 310, y: 130, w: 90, h: 90},
      {pose: P.stresse, x: 150, y: 150, w: 85, h: 85},
      {pose: P.court, x: 470, y: 140, w: 85, h: 85},
    ],
    arrows: [
      {x1:310,y1:180,x2:240,y2:185, cx:280,cy:178, cx2:255,cy2:183, color:'#FFD600'},
    ],
    labels: [
      {text:'TAGUEUR', x:355, y:225, bg:'#e53935'},
      {text:'PANSEMENT!', x:193, y:240, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.tag, text:'Tagueur', color:'#e53935'},
      {pose:P.stresse, text:'Main = pansement', color:'#FF9800'},
      {line:true, text:'Tague', color:'#FFD600'},
    ],
  },
  MO1_019: { // Éclate le ballon
    title: '🎈 ÉCLATE LE BALLON',
    zones: '',
    chars: [
      {pose: P.court, x: 200, y: 140, w: 85, h: 85, flip: true},
      {pose: P.court, x: 380, y: 140, w: 85, h: 85},
      {pose: P.saut, x: 290, y: 220, w: 80, h: 80},
    ],
    arrows: [
      {x1:285,y1:185,x2:380,y2:185, cx:320,cy:180, cx2:355,cy2:182, color:'#FFD600'},
      {x1:380,y1:185,x2:285,y2:185, cx:345,cy:200, cx2:310,cy2:195, color:'#e53935'},
    ],
    labels: [{text:'POP!', x:330, y:305, bg:'#e53935'}],
    legend: [
      {pose:P.court, text:'Joueurs', color:'#1976D2'},
      {pose:P.saut, text:'Éclate!', color:'#e53935'},
    ],
  },
  MO1_020: { // Pantoufle de Cendrillon
    title: '👠 PANTOUFLE DE CENDRILLON',
    zones: '',
    chars: [
      {pose: P.dos_a_dos, x: 280, y: 140, w: 110, h: 110},
      {pose: P.court, x: 470, y: 160, w: 85, h: 85, flip: true},
    ],
    arrows: [
      {x1:390,y1:200,x2:470,y2:200, cx:420,cy:195, cx2:450,cy2:198, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'DUO', x:335, y:255, bg:'#1976D2'}],
    legend: [
      {pose:P.dos_a_dos, text:'Duo', color:'#1976D2'},
      {pose:P.court, text:'Cherche', color:'#4CAF50'},
    ],
  },
  MO1_021: { // Tag xénomorphe
    title: '👽 TAG XÉNOMORPHE',
    zones: '',
    chars: [
      {pose: P.singe, x: 300, y: 120, w: 100, h: 100},
      {pose: P.court, x: 130, y: 150, w: 85, h: 85, flip: true},
      {pose: P.evite, x: 480, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:300,y1:175,x2:220,y2:185, cx:265,cy:178, cx2:240,cy2:182, color:'#FFD600'},
      {x1:130,y1:195,x2:60,y2:185, cx:100,cy:192, cx2:80,cy2:188, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'XÉNOMORPHE', x:350, y:225, bg:'#e53935'}],
    legend: [
      {pose:P.singe, text:'Xénomorphe', color:'#e53935'},
      {pose:P.court, text:'Survivant', color:'#1976D2'},
      {line:true, text:'Attaque', color:'#FFD600'},
    ],
  },
  MO1_022: { // Terrain de dépotoir
    title: '🗑️ TERRAIN DE DÉPOTOIR',
    zones: 'teams',
    chars: [
      {pose: P.transporte, x: 170, y: 150, w: 85, h: 85, flip: true},
      {pose: P.transporte, x: 430, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:255,y1:195,x2:420,y2:195, cx:310,cy:180, cx2:370,cy2:182, color:'#4CAF50', dash:true},
      {x1:430,y1:200,x2:260,y2:200, cx:370,cy:215, cx2:310,cy2:212, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:210, y:135, bg:'#1976D2'},
      {text:'ÉQ. B', x:470, y:135, bg:'#e53935'},
    ],
    legend: [
      {pose:P.transporte, text:'Transporte', color:'#1976D2'},
      {line:true, dash:true, text:'Transport', color:'#4CAF50'},
    ],
  },
  MO1_023: { // Bonanza basketball
    title: '🏀 BONANZA BASKETBALL',
    zones: '',
    chars: [
      {pose: P.lance, x: 200, y: 100, w: 85, h: 85, flip: true},
      {pose: P.lance, x: 300, y: 160, w: 85, h: 85, flip: true},
      {pose: P.lance, x: 200, y: 240, w: 85, h: 85, flip: true},
    ],
    arrows: [
      {x1:285,y1:145,x2:550,y2:100, cx:380,cy:125, cx2:480,cy2:105, color:'#4CAF50', dash:true},
      {x1:385,y1:205,x2:550,y2:180, cx:440,cy:195, cx2:500,cy2:188, color:'#4CAF50', dash:true},
      {x1:285,y1:285,x2:550,y2:260, cx:380,cy:275, cx2:480,cy2:268, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'1 PT', x:575, y:80, bg:'#4CAF50'},
      {text:'2 PTS', x:575, y:160, bg:'#FF9800'},
      {text:'3 PTS', x:575, y:240, bg:'#e53935'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {line:true, dash:true, text:'Tir', color:'#4CAF50'},
    ],
  },
  MO1_024: { // Épingles à linge
    title: '📎 ÉPINGLES À LINGE',
    zones: '',
    chars: [
      {pose: P.tag, x: 200, y: 140, w: 90, h: 90},
      {pose: P.evite, x: 400, y: 140, w: 90, h: 90},
    ],
    arrows: [
      {x1:290,y1:190,x2:395,y2:190, cx:330,cy:185, cx2:365,cy2:187, color:'#FFD600'},
      {x1:400,y1:195,x2:295,y2:195, cx:360,cy:200, cx2:325,cy2:198, color:'#4CAF50'},
    ],
    labels: [],
    legend: [
      {pose:P.tag, text:'Accroche', color:'#e53935'},
      {pose:P.evite, text:'Évite', color:'#1976D2'},
      {line:true, text:'Épingle', color:'#FFD600'},
    ],
  },
  MO1_025: { // Parcours commando duo
    title: '🎖️ PARCOURS COMMANDO DUO',
    zones: 'lr',
    chars: [
      {pose: P.partenaire, x: 150, y: 150, w: 100, h: 100},
      {pose: P.saut, x: 350, y: 160, w: 80, h: 80},
      {pose: P.ramper, x: 500, y: 180, w: 80, h: 80},
    ],
    arrows: [
      {x1:250,y1:200,x2:340,y2:200, cx:280,cy:195, cx2:315,cy2:197, color:'#4CAF50', dash:true},
      {x1:430,y1:200,x2:490,y2:210, cx:450,cy:204, cx2:475,cy2:208, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'OBSTACLE 1', x:380, y:245, bg:'#FF9800'},
      {text:'OBSTACLE 2', x:540, y:265, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.partenaire, text:'Duo', color:'#1976D2'},
      {line:true, dash:true, text:'Parcours', color:'#4CAF50'},
    ],
  },
  MO1_026: { // Chat et souris
    title: '🐱 CHAT ET SOURIS',
    zones: '',
    chars: [
      {pose: P.debout, x: 180, y: 90, w: 65, h: 65},
      {pose: P.debout, x: 330, y: 90, w: 65, h: 65},
      {pose: P.debout, x: 480, y: 90, w: 65, h: 65},
      {pose: P.debout, x: 180, y: 210, w: 65, h: 65},
      {pose: P.debout, x: 330, y: 210, w: 65, h: 65},
      {pose: P.debout, x: 480, y: 210, w: 65, h: 65},
      {pose: P.tag, x: 120, y: 270, w: 80, h: 80},
      {pose: P.court, x: 450, y: 270, w: 80, h: 80, flip: true},
    ],
    arrows: [
      {x1:200,y1:310,x2:440,y2:310, cx:280,cy:295, cx2:370,cy2:298, color:'#FFD600'},
    ],
    labels: [
      {text:'CHAT', x:160, y:260, bg:'#e53935'},
      {text:'SOURIS', x:490, y:260, bg:'#1976D2'},
    ],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#333'},
      {pose:P.tag, text:'Chat', color:'#e53935'},
      {pose:P.court, text:'Souris', color:'#1976D2'},
    ],
  },
  MO1_027: { // Ballon parachute
    title: '🪂 BALLON PARACHUTE',
    zones: '',
    chars: [
      {pose: P.parachute, x: 160, y: 130, w: 90, h: 90},
      {pose: P.parachute, x: 310, y: 100, w: 90, h: 90},
      {pose: P.parachute, x: 450, y: 130, w: 90, h: 90},
      {pose: P.parachute, x: 230, y: 230, w: 90, h: 90},
      {pose: P.parachute, x: 390, y: 230, w: 90, h: 90},
    ],
    arrows: [],
    labels: [{text:'PARACHUTE', x:350, y:195, bg:'#9C27B0'}],
    legend: [
      {pose:P.parachute, text:'Autour du parachute', color:'#9C27B0'},
    ],
  },
  MO1_028: { // Bataille de ballons
    title: '🎈 BATAILLE DE BALLONS',
    zones: '',
    chars: [
      {pose: P.court, x: 200, y: 140, w: 85, h: 85, flip: true},
      {pose: P.saut, x: 400, y: 140, w: 85, h: 85},
    ],
    arrows: [
      {x1:285,y1:185,x2:395,y2:185, cx:325,cy:178, cx2:365,cy2:180, color:'#FFD600'},
    ],
    labels: [{text:'POP!', x:340, y:240, bg:'#e53935'}],
    legend: [
      {pose:P.court, text:'Joueur', color:'#1976D2'},
      {pose:P.saut, text:'Éclate!', color:'#e53935'},
    ],
  },
  MO1_029: { // Tag couche sale
    title: '🏷️ TAG COUCHE SALE',
    zones: '',
    chars: [
      {pose: P.tag, x: 300, y: 120, w: 90, h: 90},
      {pose: P.stresse, x: 450, y: 150, w: 85, h: 85},
      {pose: P.court, x: 140, y: 150, w: 85, h: 85, flip: true},
    ],
    arrows: [
      {x1:390,y1:170,x2:450,y2:175, cx:410,cy:171, cx2:435,cy2:173, color:'#FFD600'},
    ],
    labels: [
      {text:'TAGUEUR', x:345, y:215, bg:'#e53935'},
      {text:'GELÉ!', x:493, y:240, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.tag, text:'Tagueur', color:'#e53935'},
      {pose:P.stresse, text:'Gelé (couche)', color:'#FF9800'},
      {pose:P.court, text:'Libre', color:'#1976D2'},
    ],
  },
  MO1_030: { // Tag amibe
    title: '🦠 TAG AMIBE',
    zones: '',
    chars: [
      {pose: P.partenaire, x: 280, y: 130, w: 110, h: 110},
      {pose: P.court, x: 140, y: 150, w: 85, h: 85, flip: true},
      {pose: P.evite, x: 470, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:390,y1:190,x2:465,y2:190, cx:420,cy:186, cx2:445,cy2:188, color:'#FFD600'},
      {x1:140,y1:200,x2:70,y2:190, cx:110,cy:197, cx2:90,cy2:194, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'AMIBE', x:335, y:245, bg:'#e53935'}],
    legend: [
      {pose:P.partenaire, text:'Amibe (tagueurs)', color:'#e53935'},
      {pose:P.court, text:'Joueur', color:'#1976D2'},
    ],
  },
  MO1_031: { // Bouledogue britannique
    title: '🐶 BOULEDOGUE BRITANNIQUE',
    zones: 'lr',
    chars: [
      {pose: P.gardien, x: 310, y: 130, w: 100, h: 100},
      {pose: P.court, x: 155, y: 135, w: 95, h: 95, flip: true},
    ],
    arrows: [
      {x1:250,y1:185, x2:635,y2:180, cx:380,cy:175, cx2:520,cy2:170, color:'#4CAF50', dash:true},
      {x1:325,y1:185, x2:255,y2:185, cx:295,cy:185, cx2:270,cy2:185, color:'#FFD600'},
    ],
    labels: [{text:'BULLDOG', x:360, y:232, bg:'#e53935'}],
    legend: [
      {pose:P.court, text:'Joueur', color:'#1976D2'},
      {pose:P.gardien, text:'Bulldog', color:'#e53935'},
      {line:true, dash:true, text:'Traverser', color:'#4CAF50'},
      {line:true, text:'Taguer', color:'#FFD600'},
    ],
  },
  MO1_032: { // Corbeaux et grues
    title: '🐦 CORBEAUX ET GRUES',
    zones: '',
    chars: [
      {pose: P.attente, x: 230, y: 140, w: 85, h: 85},
      {pose: P.attente, x: 370, y: 140, w: 85, h: 85},
    ],
    arrows: [
      {x1:230,y1:185,x2:80,y2:185, cx:170,cy:180, cx2:120,cy2:182, color:'#4CAF50', dash:true},
      {x1:455,y1:185,x2:600,y2:185, cx:510,cy:180, cx2:560,cy2:182, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'CORBEAUX', x:272, y:230, bg:'#1976D2'},
      {text:'GRUES', x:412, y:230, bg:'#e53935'},
    ],
    legend: [
      {pose:P.attente, text:'Face à face', color:'#1976D2'},
      {line:true, dash:true, text:'Court/Fuit', color:'#4CAF50'},
    ],
  },
  MO1_033: { // Fourmi morte
    title: '🐜 FOURMI MORTE',
    zones: '',
    chars: [
      {pose: P.tag, x: 300, y: 100, w: 90, h: 90},
      {pose: P.couche, x: 420, y: 200, w: 90, h: 90},
      {pose: P.court, x: 140, y: 150, w: 85, h: 85, flip: true},
    ],
    arrows: [
      {x1:345,y1:195,x2:420,y2:230, cx:370,cy:210, cx2:400,cy2:222, color:'#FFD600'},
      {x1:140,y1:210,x2:410,y2:250, cx:230,cy:235, cx2:340,cy2:248, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'TAGUEUR', x:345, y:195, bg:'#e53935'},
      {text:'MORTE!', x:465, y:295, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.tag, text:'Tagueur', color:'#e53935'},
      {pose:P.couche, text:'Fourmi morte', color:'#FF9800'},
      {line:true, dash:true, text:'Sauve', color:'#4CAF50'},
    ],
  },
  MO1_034: { // Abeilles et papillons
    title: '🐝 ABEILLES ET PAPILLONS',
    zones: '',
    chars: [
      {pose: P.tag, x: 300, y: 130, w: 85, h: 85},
      {pose: P.court, x: 150, y: 150, w: 80, h: 80, flip: true},
      {pose: P.evite, x: 460, y: 150, w: 80, h: 80},
    ],
    arrows: [
      {x1:300,y1:175,x2:235,y2:185, cx:270,cy:178, cx2:250,cy2:182, color:'#FFD600'},
    ],
    labels: [
      {text:'ABEILLE', x:342, y:220, bg:'#FF9800'},
      {text:'PAPILLON', x:500, y:235, bg:'#1976D2'},
    ],
    legend: [
      {pose:P.tag, text:'Abeille', color:'#FF9800'},
      {pose:P.court, text:'Papillon', color:'#1976D2'},
    ],
  },
  MO1_035: { // Armée marine
    title: '⚓ ARMÉE MARINE',
    zones: '',
    chars: [
      {pose: P.pointe, x: 300, y: 80, w: 90, h: 90},
      {pose: P.court, x: 140, y: 200, w: 80, h: 80, flip: true},
      {pose: P.accroupi, x: 350, y: 230, w: 80, h: 80},
      {pose: P.couche, x: 500, y: 240, w: 80, h: 80},
    ],
    arrows: [],
    labels: [{text:'CAPITAINE', x:345, y:175, bg:'#FF9800'}],
    legend: [
      {pose:P.pointe, text:'Capitaine', color:'#FF9800'},
      {pose:P.court, text:'Soldats', color:'#1976D2'},
    ],
  },
  MO1_036: { // Chenille
    title: '🐛 CHENILLE',
    zones: 'lr',
    chars: [
      {pose: P.couche, x: 120, y: 155, w: 80, h: 80},
      {pose: P.couche, x: 195, y: 155, w: 80, h: 80},
      {pose: P.couche, x: 270, y: 155, w: 80, h: 80},
      {pose: P.couche, x: 345, y: 155, w: 80, h: 80},
    ],
    arrows: [
      {x1:425,y1:195,x2:600,y2:195, cx:480,cy:185, cx2:550,cy2:188, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'ROULE!', x:300, y:245, bg:'#4CAF50'}],
    legend: [
      {pose:P.couche, text:'Couchés côte à côte', color:'#1976D2'},
      {line:true, dash:true, text:'Roule', color:'#4CAF50'},
    ],
  },
  MO1_037: { // Descente progressive
    title: '⬇️ DESCENTE PROGRESSIVE',
    zones: '',
    chars: [
      {pose: P.debout, x: 190, y: 90, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 90, w: 70, h: 70},
      {pose: P.debout, x: 190, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.lance, x: 280, y: 155, w: 80, h: 80},
    ],
    arrows: [
      {x1:280,y1:195,x2:200,y2:145, cx:240,cy:175, cx2:215,cy2:158, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'CERCLE', x:330, y:145, bg:'#1976D2'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {pose:P.lance, text:'Lance', color:'#4CAF50'},
    ],
  },
  MO1_038: { // Ballon en l'air
    title: '🏐 BALLON EN L\'AIR',
    zones: '',
    chars: [
      {pose: P.debout, x: 180, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 180, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.saut, x: 275, y: 120, w: 80, h: 80},
    ],
    arrows: [],
    labels: [{text:'EN L\'AIR!', x:315, y:115, bg:'#FF9800'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {pose:P.saut, text:'Frappe en l\'air', color:'#FF9800'},
    ],
  },
  MO1_039: { // Goutte goutte splash
    title: '💧 GOUTTE GOUTTE SPLASH',
    zones: '',
    chars: [
      {pose: P.assis, x: 190, y: 100, w: 70, h: 70},
      {pose: P.assis, x: 330, y: 100, w: 70, h: 70},
      {pose: P.assis, x: 460, y: 100, w: 70, h: 70},
      {pose: P.assis, x: 190, y: 230, w: 70, h: 70},
      {pose: P.assis, x: 330, y: 230, w: 70, h: 70},
      {pose: P.assis, x: 460, y: 230, w: 70, h: 70},
      {pose: P.court, x: 130, y: 160, w: 80, h: 80},
    ],
    arrows: [
      {x1:130,y1:175,x2:190,y2:130, cx:150,cy:155, cx2:175,cy2:140, color:'#FFD600'},
    ],
    labels: [{text:'SPLASH!', x:250, y:175, bg:'#1976D2'}],
    legend: [
      {pose:P.assis, text:'Assis en cercle', color:'#1976D2'},
      {pose:P.court, text:'Tourne', color:'#FF9800'},
    ],
  },
  MO1_040: { // Ballon ceinture
    title: '⛓️ BALLON CEINTURE',
    zones: 'teams',
    chars: [
      {pose: P.file, x: 150, y: 150, w: 85, h: 85, flip: true},
      {pose: P.file, x: 220, y: 150, w: 85, h: 85, flip: true},
      {pose: P.file, x: 420, y: 150, w: 85, h: 85},
      {pose: P.file, x: 490, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:305,y1:195,x2:410,y2:195, cx:340,cy:190, cx2:380,cy2:192, color:'#FFD600'},
    ],
    labels: [
      {text:'ÉQ. A', x:210, y:135, bg:'#1976D2'},
      {text:'ÉQ. B', x:470, y:135, bg:'#e53935'},
    ],
    legend: [
      {pose:P.file, text:'Reliés', color:'#1976D2'},
      {line:true, text:'Ballon', color:'#FFD600'},
    ],
  },
  MO1_041: { // Volleyball ballon aveugle
    title: '🏐 VOLLEYBALL AVEUGLE',
    zones: 'teams',
    chars: [
      {pose: P.lance, x: 170, y: 150, w: 85, h: 85, flip: true},
      {pose: P.attrape, x: 440, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:255,y1:180,x2:430,y2:180, cx:320,cy:140, cx2:380,cy2:145, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'DRAP', x:350, y:270, bg:'#9C27B0'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {pose:P.attrape, text:'Attrape', color:'#e53935'},
      {line:true, dash:true, text:'Ballon', color:'#4CAF50'},
    ],
  },
  MO1_042: { // Bam retourne
    title: '💥 BAM RETOURNE',
    zones: 'lr',
    chars: [
      {pose: P.ramper, x: 150, y: 160, w: 90, h: 90, flip: true},
      {pose: P.plonge, x: 450, y: 160, w: 90, h: 90},
    ],
    arrows: [
      {x1:240,y1:200,x2:440,y2:200, cx:310,cy:185, cx2:380,cy2:188, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'BALLON', x:500, y:260, bg:'#FF9800'}],
    legend: [
      {pose:P.ramper, text:'Rampe', color:'#1976D2'},
      {pose:P.plonge, text:'Plonge!', color:'#e53935'},
    ],
  },
  MO1_043: { // Basketball sac de fèves
    title: '🏀 BASKETBALL SAC DE FÈVES',
    zones: 'teams',
    chars: [
      {pose: P.transporte, x: 170, y: 150, w: 85, h: 85, flip: true},
      {pose: P.defense, x: 440, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:255,y1:195,x2:430,y2:195, cx:320,cy:180, cx2:380,cy2:185, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:210, y:135, bg:'#1976D2'},
      {text:'ÉQ. B', x:480, y:135, bg:'#e53935'},
    ],
    legend: [
      {pose:P.transporte, text:'Porteur', color:'#1976D2'},
      {pose:P.defense, text:'Défend', color:'#e53935'},
    ],
  },
  MO1_044: { // Éléphants vaches girafes
    title: '🐘 ÉLÉPHANTS VACHES GIRAFES',
    zones: '',
    chars: [
      {pose: P.debout, x: 190, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 190, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.pointe, x: 280, y: 155, w: 80, h: 80},
    ],
    arrows: [
      {x1:360,y1:195,x2:400,y2:145, cx:375,cy:175, cx2:390,cy2:158, color:'#FFD600'},
    ],
    labels: [{text:'MENEUR', x:320, y:145, bg:'#FF9800'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {pose:P.pointe, text:'Pointe', color:'#FF9800'},
    ],
  },
  MO1_045: { // Stationnement de voitures
    title: '🚗 STATIONNEMENT DE VOITURES',
    zones: '',
    chars: [
      {pose: P.pointe, x: 300, y: 80, w: 90, h: 90},
      {pose: P.court, x: 130, y: 200, w: 80, h: 80, flip: true},
      {pose: P.court, x: 350, y: 200, w: 80, h: 80},
      {pose: P.court, x: 500, y: 200, w: 80, h: 80, flip: true},
    ],
    arrows: [
      {x1:170,y1:285,x2:120,y2:300, cx:150,cy:290, cx2:135,cy2:296, color:'#4CAF50', dash:true},
      {x1:390,y1:285,x2:440,y2:300, cx:410,cy:290, cx2:425,cy2:296, color:'#FFD600', dash:true},
    ],
    labels: [{text:'MENEUR', x:345, y:175, bg:'#FF9800'}],
    legend: [
      {pose:P.pointe, text:'Meneur', color:'#FF9800'},
      {pose:P.court, text:'Voitures', color:'#1976D2'},
    ],
  },
  MO1_046: { // Volleyball 4 carrés
    title: '🏐 VOLLEYBALL 4 CARRÉS',
    zones: '',
    chars: [
      {pose: P.lance, x: 200, y: 100, w: 80, h: 80, flip: true},
      {pose: P.lance, x: 400, y: 100, w: 80, h: 80},
      {pose: P.attrape, x: 200, y: 230, w: 80, h: 80, flip: true},
      {pose: P.attrape, x: 400, y: 230, w: 80, h: 80},
    ],
    arrows: [
      {x1:280,y1:140,x2:400,y2:270, cx:310,cy:180, cx2:370,cy2:240, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'ZONE 1', x:220, y:85, bg:'#1976D2'},
      {text:'ZONE 2', x:440, y:85, bg:'#e53935'},
      {text:'ZONE 3', x:220, y:315, bg:'#4CAF50'},
      {text:'ZONE 4', x:440, y:315, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.lance, text:'Frappe', color:'#1976D2'},
      {line:true, dash:true, text:'Ballon', color:'#4CAF50'},
    ],
  },
  MO1_047: { // Ping-pong drap
    title: '🏓 PING-PONG DRAP',
    zones: 'teams',
    chars: [
      {pose: P.attente, x: 170, y: 140, w: 80, h: 80},
      {pose: P.attente, x: 170, y: 230, w: 80, h: 80},
      {pose: P.attente, x: 440, y: 140, w: 80, h: 80},
      {pose: P.attente, x: 440, y: 230, w: 80, h: 80},
    ],
    arrows: [
      {x1:250,y1:195,x2:430,y2:195, cx:310,cy:160, cx2:380,cy2:165, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'DRAP', x:350, y:270, bg:'#9C27B0'}],
    legend: [
      {pose:P.attente, text:'Tient le drap', color:'#1976D2'},
      {line:true, dash:true, text:'Balle', color:'#4CAF50'},
    ],
  },
  MO1_048: { // Bom Bom Bom
    title: '💣 BOM BOM BOM',
    zones: 'lr',
    chars: [
      {pose: P.file, x: 100, y: 150, w: 80, h: 80, flip: true},
      {pose: P.file, x: 170, y: 150, w: 80, h: 80, flip: true},
      {pose: P.attente, x: 450, y: 140, w: 85, h: 85},
      {pose: P.attente, x: 450, y: 240, w: 85, h: 85},
    ],
    arrows: [
      {x1:250,y1:195,x2:440,y2:185, cx:320,cy:185, cx2:390,cy2:185, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'MARCHE EN CHANTANT', x:180, y:240, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.file, text:'Marche', color:'#FF9800'},
      {pose:P.attente, text:'Attend', color:'#1976D2'},
    ],
  },
  MO1_049: { // 1-2-3-Regarde
    title: '👀 1-2-3-REGARDE',
    zones: '',
    chars: [
      {pose: P.debout, x: 190, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 190, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 280, y: 60, w: 70, h: 70},
      {pose: P.debout, x: 280, y: 270, w: 70, h: 70},
    ],
    arrows: [],
    labels: [{text:'REGARDE!', x:330, y:180, bg:'#e53935'}],
    legend: [
      {pose:P.debout, text:'En cercle yeux fermés', color:'#1976D2'},
    ],
  },
  MO1_050: { // Syllabes en action
    title: '🗣️ SYLLABES EN ACTION',
    zones: '',
    chars: [
      {pose: P.debout, x: 190, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 190, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.saut, x: 280, y: 155, w: 80, h: 80},
    ],
    arrows: [],
    labels: [{text:'ACTION!', x:320, y:245, bg:'#FF9800'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {pose:P.saut, text:'Fait l\'action', color:'#FF9800'},
    ],
  },
  MO1_051: { // Jeu de l'avion
    title: '✈️ JEU DE L\'AVION',
    zones: 'lr',
    chars: [
      {pose: P.yeux_bandes, x: 200, y: 150, w: 90, h: 90},
      {pose: P.pointe, x: 120, y: 160, w: 80, h: 80},
    ],
    arrows: [
      {x1:290,y1:195,x2:600,y2:195, cx:400,cy:185, cx2:520,cy2:188, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'AVION', x:245, y:245, bg:'#1976D2'},
      {text:'GUIDE', x:160, y:245, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.yeux_bandes, text:'Avion (aveugle)', color:'#1976D2'},
      {pose:P.pointe, text:'Guide', color:'#FF9800'},
    ],
  },
  MO1_052: { // Tout le monde de l'autre côté
    title: '🔄 TOUT LE MONDE DE L\'AUTRE CÔTÉ',
    zones: 'teams',
    chars: [
      {pose: P.lance, x: 160, y: 150, w: 85, h: 85, flip: true},
      {pose: P.lance, x: 440, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:245,y1:185,x2:430,y2:185, cx:310,cy:160, cx2:380,cy2:165, color:'#4CAF50', dash:true},
      {x1:440,y1:200,x2:250,y2:200, cx:380,cy:225, cx2:310,cy2:220, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:200, y:135, bg:'#1976D2'},
      {text:'ÉQ. B', x:480, y:135, bg:'#e53935'},
    ],
    legend: [
      {pose:P.lance, text:'Lance', color:'#1976D2'},
      {line:true, dash:true, text:'Ballons', color:'#4CAF50'},
    ],
  },
  MO1_053: { // Trouve ton partenaire
    title: '🔍 TROUVE TON PARTENAIRE',
    zones: '',
    chars: [
      {pose: P.yeux_bandes, x: 180, y: 140, w: 85, h: 85},
      {pose: P.yeux_bandes, x: 380, y: 140, w: 85, h: 85},
      {pose: P.yeux_bandes, x: 280, y: 230, w: 85, h: 85},
    ],
    arrows: [
      {x1:265,y1:185,x2:375,y2:185, cx:300,cy:180, cx2:340,cy2:182, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'MÊME SON?', x:330, y:175, bg:'#FF9800'}],
    legend: [
      {pose:P.yeux_bandes, text:'Yeux fermés', color:'#1976D2'},
      {line:true, dash:true, text:'Cherche', color:'#4CAF50'},
    ],
  },
  MO1_054: { // Course alphabétique
    title: '🔤 COURSE ALPHABÉTIQUE',
    zones: 'lr',
    chars: [
      {pose: P.court, x: 150, y: 120, w: 80, h: 80, flip: true},
      {pose: P.court, x: 150, y: 230, w: 80, h: 80, flip: true},
    ],
    arrows: [
      {x1:230,y1:160,x2:600,y2:160, cx:350,cy:150, cx2:500,cy2:152, color:'#4CAF50', dash:true},
      {x1:230,y1:270,x2:600,y2:270, cx:350,cy:260, cx2:500,cy2:262, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:180, y:105, bg:'#1976D2'},
      {text:'ÉQ. B', x:180, y:215, bg:'#e53935'},
      {text:'TABLEAU', x:630, y:195, bg:'#FF9800'},
    ],
    legend: [
      {pose:P.court, text:'Court', color:'#1976D2'},
      {line:true, dash:true, text:'Vers le tableau', color:'#4CAF50'},
    ],
  },
  MO1_055: { // Cinq cents
    title: '💯 CINQ CENTS',
    zones: '',
    chars: [
      {pose: P.lance, x: 150, y: 150, w: 90, h: 90, flip: true},
      {pose: P.attrape, x: 400, y: 120, w: 80, h: 80},
      {pose: P.attrape, x: 450, y: 220, w: 80, h: 80},
    ],
    arrows: [
      {x1:240,y1:195,x2:390,y2:165, cx:290,cy:182, cx2:350,cy2:170, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'100 PTS!', x:195, y:245, bg:'#FF9800'}],
    legend: [
      {pose:P.lance, text:'Lanceur', color:'#FF9800'},
      {pose:P.attrape, text:'Attrape', color:'#1976D2'},
    ],
  },
  MO1_056: { // Poulet cluck
    title: '🐔 POULET CLUCK',
    zones: '',
    chars: [
      {pose: P.lance, x: 140, y: 140, w: 85, h: 85, flip: true},
      {pose: P.court, x: 350, y: 100, w: 80, h: 80, flip: true},
      {pose: P.court, x: 380, y: 220, w: 80, h: 80, flip: true},
      {pose: P.attrape, x: 500, y: 150, w: 80, h: 80},
    ],
    arrows: [
      {x1:225,y1:185,x2:490,y2:195, cx:320,cy:170, cx2:420,cy2:180, color:'#FFD600'},
      {x1:430,y1:140,x2:500,y2:120, cx:460,cy:132, cx2:480,cy2:125, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'LANCE & COURT', x:185, y:230, bg:'#FF9800'}],
    legend: [
      {pose:P.lance, text:'Lance', color:'#FF9800'},
      {pose:P.court, text:'Court', color:'#1976D2'},
      {pose:P.attrape, text:'Attrape', color:'#e53935'},
    ],
  },
  MO1_057: { // Choc électrique
    title: '⚡ CHOC ÉLECTRIQUE',
    zones: '',
    chars: [
      {pose: P.assis, x: 150, y: 130, w: 75, h: 75},
      {pose: P.assis, x: 240, y: 130, w: 75, h: 75},
      {pose: P.assis, x: 330, y: 130, w: 75, h: 75},
      {pose: P.assis, x: 150, y: 230, w: 75, h: 75},
      {pose: P.assis, x: 240, y: 230, w: 75, h: 75},
      {pose: P.assis, x: 330, y: 230, w: 75, h: 75},
      {pose: P.plonge, x: 480, y: 170, w: 80, h: 80},
    ],
    arrows: [
      {x1:195,y1:175,x2:285,y2:175, cx:230,cy:170, cx2:260,cy2:172, color:'#FFD600'},
    ],
    labels: [
      {text:'SQUEEZE', x:240, y:210, bg:'#FF9800'},
      {text:'OBJET', x:520, y:255, bg:'#e53935'},
    ],
    legend: [
      {pose:P.assis, text:'En ligne', color:'#1976D2'},
      {line:true, text:'Signal', color:'#FFD600'},
      {pose:P.plonge, text:'Attrape!', color:'#e53935'},
    ],
  },
  MO1_058: { // Ah So Gi
    title: '🙏 AH SO GI',
    zones: '',
    chars: [
      {pose: P.debout, x: 190, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 100, w: 70, h: 70},
      {pose: P.debout, x: 190, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 380, y: 230, w: 70, h: 70},
      {pose: P.debout, x: 280, y: 60, w: 70, h: 70},
      {pose: P.debout, x: 280, y: 270, w: 70, h: 70},
    ],
    arrows: [
      {x1:315,y1:110,x2:380,y2:135, cx:340,cy:118, cx2:365,cy2:128, color:'#FFD600'},
    ],
    labels: [{text:'AH! SO! GI!', x:330, y:180, bg:'#e53935'}],
    legend: [
      {pose:P.debout, text:'En cercle', color:'#1976D2'},
      {line:true, text:'Signal', color:'#FFD600'},
    ],
  },
  MO1_059: { // Course relais du camp
    title: '🏕️ COURSE RELAIS DU CAMP',
    zones: 'lr',
    chars: [
      {pose: P.court, x: 150, y: 120, w: 80, h: 80, flip: true},
      {pose: P.attente, x: 500, y: 120, w: 80, h: 80},
      {pose: P.court, x: 150, y: 240, w: 80, h: 80, flip: true},
      {pose: P.attente, x: 500, y: 240, w: 80, h: 80},
    ],
    arrows: [
      {x1:230,y1:160,x2:490,y2:160, cx:320,cy:150, cx2:420,cy2:152, color:'#4CAF50', dash:true},
      {x1:230,y1:280,x2:490,y2:280, cx:320,cy:270, cx2:420,cy2:272, color:'#FFD600', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:180, y:105, bg:'#1976D2'},
      {text:'ÉQ. B', x:180, y:225, bg:'#e53935'},
    ],
    legend: [
      {pose:P.court, text:'Court', color:'#1976D2'},
      {pose:P.attente, text:'Attend', color:'#FF9800'},
      {line:true, dash:true, text:'Relais', color:'#4CAF50'},
    ],
  },
  MO1_060: { // Écossais à reculons
    title: '🏴 ÉCOSSAIS À RECULONS',
    zones: 'lr',
    chars: [
      {pose: P.court, x: 200, y: 155, w: 85, h: 85},
      {pose: P.hockey, x: 400, y: 155, w: 85, h: 85},
    ],
    arrows: [
      {x1:200,y1:200,x2:70,y2:200, cx:150,cy:195, cx2:110,cy2:197, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'À RECULONS!', x:250, y:250, bg:'#FF9800'}],
    legend: [
      {pose:P.court, text:'Recule', color:'#1976D2'},
      {pose:P.hockey, text:'Avec balai', color:'#FF9800'},
      {line:true, dash:true, text:'Relais', color:'#4CAF50'},
    ],
  },
  MO1_061: { // Poisson mort
    title: '🐟 POISSON MORT',
    zones: '',
    chars: [
      {pose: P.couche, x: 180, y: 160, w: 90, h: 90},
      {pose: P.couche, x: 340, y: 180, w: 90, h: 90},
      {pose: P.couche, x: 500, y: 150, w: 90, h: 90},
    ],
    arrows: [],
    labels: [{text:'IMMOBILE!', x:350, y:150, bg:'#1976D2'}],
    legend: [
      {pose:P.couche, text:'Poisson mort', color:'#1976D2'},
    ],
  },
  MO1_062: { // Air Pong
    title: '🏓 AIR PONG',
    zones: 'teams',
    chars: [
      {pose: P.souffle, x: 180, y: 150, w: 85, h: 85, flip: true},
      {pose: P.souffle, x: 430, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:265,y1:195,x2:420,y2:195, cx:320,cy:185, cx2:380,cy2:188, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'BALLE', x:350, y:230, bg:'#FF9800'}],
    legend: [
      {pose:P.souffle, text:'Souffle', color:'#1976D2'},
      {line:true, dash:true, text:'Balle', color:'#4CAF50'},
    ],
  },
  MO1_063: { // Basketball sac de fèves (variante)
    title: '🏀 BASKETBALL FÈVES (VARIANTE)',
    zones: 'teams',
    chars: [
      {pose: P.court, x: 170, y: 150, w: 85, h: 85, flip: true},
      {pose: P.defense, x: 440, y: 150, w: 85, h: 85},
    ],
    arrows: [
      {x1:255,y1:195,x2:430,y2:195, cx:320,cy:180, cx2:380,cy2:185, color:'#4CAF50', dash:true},
    ],
    labels: [
      {text:'ÉQ. A', x:210, y:135, bg:'#1976D2'},
      {text:'ÉQ. B', x:480, y:135, bg:'#e53935'},
    ],
    legend: [
      {pose:P.court, text:'Porteur', color:'#1976D2'},
      {pose:P.defense, text:'Défend', color:'#e53935'},
    ],
  },
  MO1_064: { // Relais ballon dos à dos
    title: '🔄 RELAIS BALLON DOS À DOS',
    zones: 'lr',
    chars: [
      {pose: P.dos_a_dos, x: 200, y: 145, w: 110, h: 110},
      {pose: P.dos_a_dos, x: 400, y: 145, w: 110, h: 110},
    ],
    arrows: [
      {x1:310,y1:200,x2:390,y2:200, cx:340,cy:195, cx2:370,cy2:197, color:'#4CAF50', dash:true},
    ],
    labels: [{text:'BALLON ENTRE LES DOS', x:350, y:265, bg:'#FF9800'}],
    legend: [
      {pose:P.dos_a_dos, text:'Dos à dos', color:'#1976D2'},
      {line:true, dash:true, text:'Relais', color:'#4CAF50'},
    ],
  },
  MO1_065: { // Les oiseaux ont des plumes
    title: '🪶 LES OISEAUX ONT DES PLUMES',
    zones: '',
    chars: [
      {pose: P.pointe, x: 300, y: 90, w: 90, h: 90},
      {pose: P.saut, x: 180, y: 200, w: 80, h: 80},
      {pose: P.debout, x: 350, y: 210, w: 75, h: 75},
      {pose: P.accroupi, x: 480, y: 220, w: 75, h: 75},
    ],
    arrows: [],
    labels: [{text:'MENEUR', x:345, y:185, bg:'#FF9800'}],
    legend: [
      {pose:P.pointe, text:'Meneur', color:'#FF9800'},
      {pose:P.saut, text:'Saute = oui', color:'#4CAF50'},
      {pose:P.debout, text:'Reste = non', color:'#e53935'},
    ],
  },
};

// Generate all SVGs
let count = 0;
for (const [id, g] of Object.entries(games)) {
  const svg = buildSvg(g.title, g.zones, g.chars, g.arrows, g.labels, g.legend);
  const filePath = path.join(OUT_DIR, `${id}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  count++;
}

console.log(`✅ ${count} SVGs générés dans ${OUT_DIR}`);
