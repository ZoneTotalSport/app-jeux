// ============================================================
// APP JEUX SPORTIFS MONDIAUX — Zone Total Sport
// ============================================================

const JEUX_SOURCES = [
  { key: 'ballon_chasseur', path: 'data/jeux/ballon_chasseur.json', label: '🎯 Ballon Chasseur', emoji: '🎯' },
  { key: 'poursuite', path: 'data/jeux/poursuite.json', label: '🏃 Poursuite', emoji: '🏃' },
  { key: 'cooperation', path: 'data/jeux/cooperation.json', label: '🤝 Coopération', emoji: '🤝' },
  { key: 'opposition', path: 'data/jeux/opposition.json', label: '⚔️ Opposition', emoji: '⚔️' },
  { key: 'sports_collectifs', path: 'data/jeux/sports_collectifs.json', label: '🏅 Sports Collectifs', emoji: '🏅' },
  { key: 'sans_materiel', path: 'data/jeux/sans_materiel.json', label: '🙌 Sans Matériel', emoji: '🙌' },
  { key: 'exterieur', path: 'data/jeux/exterieur.json', label: '🌿 Extérieur', emoji: '🌿' },
  { key: 'traditionnels_monde', path: 'data/jeux/traditionnels_monde.json', label: '🌍 Traditionnels', emoji: '🌍' },
  { key: 'sports_individuels', path: 'data/jeux/sports_individuels.json', label: '🏋️ Sports Individuels', emoji: '🏋️' },
  { key: 'jeux_autochtones', path: 'data/jeux/jeux_autochtones.json', label: '🪶 Autochtones', emoji: '🪶' },
  { key: 'jeux_avec_materiel', path: 'data/jeux/jeux_avec_materiel.json', label: '🏸 Avec Matériel', emoji: '🏸' },
  { key: 'jeux_olympiques_paralympiques', path: 'data/jeux/jeux_olympiques_paralympiques.json', label: '🥇 Olympiques', emoji: '🥇' },
  { key: 'jeux_afrique_asie_oceanie', path: 'data/jeux/jeux_afrique_asie_oceanie.json', label: '🌏 Afrique·Asie', emoji: '🌏' },
  { key: 'jeux_ameriques_europe', path: 'data/jeux/jeux_ameriques_europe.json', label: '🌎 Amériques·Europe', emoji: '🌎' },
  { key: 'jeux_prescolaire', path: 'data/jeux/jeux_prescolaire.json', label: '🌱 Préscolaire', emoji: '🌱' },
  { key: 'jeux_secondaire', path: 'data/jeux/jeux_secondaire.json', label: '🎓 Secondaire', emoji: '🎓' },
];

let allJeux = [];
let filtered = [];
let intersectionObserver = null;
let currentPage = 0;
const ITEMS_PER_PAGE = 30;
let favorisFilter = false;

// ============================================================
// LOCALISATION HELPER — supporte string simple ou {fr,en,es,zh}
// ============================================================
function loc(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && !Array.isArray(val)) {
    return val[_currentLang] || val['fr'] || val['en'] || Object.values(val)[0] || '';
  }
  return String(val);
}
function locArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    const arr = val[_currentLang] || val['fr'] || val['en'];
    return Array.isArray(arr) ? arr : (arr ? [arr] : []);
  }
  return [String(val)];
}

// ============================================================
// FAVORIS (localStorage)
// ============================================================
function getFavoris() {
  try {
    return JSON.parse(localStorage.getItem('favoris-jeux')) || [];
  } catch { return []; }
}

function setFavoris(arr) {
  localStorage.setItem('favoris-jeux', JSON.stringify(arr));
}

function getJeuId(jeu) {
  return jeu.id || loc(jeu.titre) || loc(jeu.nom) || '';
}

function isFavori(jeu) {
  return getFavoris().includes(getJeuId(jeu));
}

function toggleFavori(jeu) {
  const id = getJeuId(jeu);
  let favs = getFavoris();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  setFavoris(favs);
  return favs.includes(id);
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('toast-hide');
  toast.classList.add('toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
  }, duration);
}

// Safety timeout — masque le loading après 8s même si fetch échoue
const safetyTimer = setTimeout(() => {
  console.warn('Safety timeout triggered');
  hideLoading();
}, 8000);

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initCanvas();
  simulateLoadingProgress();
  await loadAllJeux();
  setupFilters();
  renderJeux();
  hideLoading();
  animateCounters();
  checkDeepLink();
});

// ============================================================
// LOADING
// ============================================================
function simulateLoadingProgress() {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  const messages = [
    'Chargement des jeux du monde...',
    'Import des jeux autochtones...',
    'Chargement sports collectifs...',
    'Préparation de l\'interface...',
    'Presque prêt...'
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (i < messages.length) {
      if (text) text.textContent = messages[i];
      i++;
    } else {
      clearInterval(interval);
    }
  }, 600);
}

function hideLoading() {
  clearTimeout(safetyTimer);
  const loading = document.getElementById('loading');
  const app = document.getElementById('app');
  if (loading) {
    loading.style.transition = 'opacity 0.4s ease';
    loading.style.opacity = '0';
    setTimeout(() => {
      if (loading) loading.style.display = 'none';
      if (app) app.classList.remove('hidden');
    }, 400);
  } else {
    if (app) app.classList.remove('hidden');
  }
}

// ============================================================
// CHARGEMENT DES DONNÉES
// ============================================================
async function loadAllJeux() {
  const results = await Promise.allSettled(
    JEUX_SOURCES.map(source =>
      fetch(source.path)
        .then(r => {
          if (!r.ok) {
            console.error(`404: ${source.path}`);
            throw new Error(`HTTP ${r.status}: ${source.path}`);
          }
          return r.json();
        })
        .then(data => ({ source, data }))
    )
  );

  let loaded = 0;
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const { source, data } = result.value;
      let jeux = Array.isArray(data) ? data : (data.jeux || data.items || []);
      jeux = jeux.map(j => ({
        ...j,
        _source: source.key,
        _emoji: source.emoji,
        _label: source.label
      }));
      allJeux.push(...jeux);
      loaded++;
    } else {
      console.error('Erreur chargement:', result.reason?.message || result.reason);
    }
  });

  console.log(`Chargé: ${loaded}/${JEUX_SOURCES.length} fichiers — ${allJeux.length} jeux au total`);
  filtered = [...allJeux];

  // Mettre à jour le compteur hero avec le vrai total
  const counterJeux = document.getElementById('counter-jeux');
  if (counterJeux) counterJeux.dataset.count = allJeux.length;
}

// ============================================================
// FILTRES
// ============================================================
// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setupFilters() {
  const debouncedApply = debounce(applyFilters, 250);
  ['search', 'cat', 'niveau', 'espace', 'intensite'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'INPUT') {
        el.addEventListener('input', debouncedApply);
      } else {
        el.addEventListener('change', applyFilters);
      }
    }
  });
}

function applyFilters() {
  const search = document.getElementById('search')?.value.toLowerCase().trim() || '';
  const cat = document.getElementById('cat')?.value || '';
  const niveau = document.getElementById('niveau')?.value || '';
  const espace = document.getElementById('espace')?.value || '';
  const intensite = document.getElementById('intensite')?.value || '';

  filtered = allJeux.filter(j => {
    // Filtre favoris
    if (favorisFilter && !isFavori(j)) return false;

    // Recherche texte
    if (search) {
      const searchable = [
        loc(j.titre), loc(j.nom), loc(j.description), loc(j.but_du_jeu), loc(j.resume),
        loc(j.origine), loc(j.pays), loc(j.culture), loc(j.region),
        ...(Array.isArray(j.tags) ? j.tags.map(t => loc(t)) : []),
        ...(Array.isArray(j.noms_alternatifs) ? j.noms_alternatifs.map(n => loc(n)) : [])
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(search)) return false;
    }

    // Filtre catégorie
    if (cat && j._source !== cat && j.categorie !== cat) return false;

    // Filtre niveau
    if (niveau) {
      const niv = loc(j.niveau || j.niveaux).toLowerCase();
      if (!niv.includes(niveau.toLowerCase())) return false;
    }

    // Filtre espace
    if (espace) {
      const esp = loc(j.espace || j.lieu);
      if (esp && !esp.includes(espace)) return false;
    }

    // Filtre intensité
    if (intensite) {
      const inten = loc(j.intensite || j.niveau_activite || j.intensite_activite);
      if (!inten.includes(intensite)) return false;
    }

    return true;
  });

  currentPage = 0;
  renderJeux();
  renderPagination();
  updateStats();
}

function resetFilters() {
  ['search', 'cat', 'niveau', 'espace', 'intensite'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  favorisFilter = false;
  const favFilterBtn = document.getElementById('btn-favoris-filter');
  if (favFilterBtn) favFilterBtn.classList.remove('active');
  filtered = [...allJeux];
  currentPage = 0;
  renderJeux();
  renderPagination();
  updateStats();
}

// ============================================================
// UTILITAIRES AFFICHAGE
// ============================================================
function getCategoryEmoji(source) {
  const map = {
    ballon_chasseur: '🎯',
    poursuite: '🏃',
    cooperation: '🤝',
    opposition: '⚔️',
    sports_collectifs: '🏅',
    sans_materiel: '🙌',
    exterieur: '🌿',
    traditionnels_monde: '🌍',
    sports_individuels: '🏋️',
    jeux_autochtones: '🪶',
    jeux_avec_materiel: '🏸',
    jeux_olympiques_paralympiques: '🥇',
    jeux_afrique_asie_oceanie: '🌏',
    jeux_ameriques_europe: '🌎',
    jeux_prescolaire: '🌱',
    jeux_secondaire: '🎓'
  };
  return map[source] || '🎮';
}

function getIntensiteClass(intensite) {
  if (!intensite) return '';
  const i = intensite.toLowerCase();
  if (i.includes('élev') || i.includes('elev') || i.includes('haut') || i.includes('high')) {
    return 'tag-intensite-eleve';
  }
  if (i.includes('mod')) return 'tag-intensite-modere';
  return 'tag-intensite-faible';
}

function getNiveauClass(niveau) {
  if (!niveau) return 'tag-niveau';
  const n = niveau.toLowerCase();
  if (n.includes('prés') || n.includes('pres') || n.includes('maternel')) return 'badge-prescolaire';
  if (n.includes('prim')) return 'badge-primaire';
  if (n.includes('sec')) return 'badge-secondaire';
  return 'tag-niveau';
}

function truncate(str, max = 120) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max).trim() + '…' : str;
}

// ============================================================
// RENDU DES CARTES
// ============================================================
function renderCard(jeu) {
  const titre = loc(jeu.titre || jeu.nom) || 'Sans titre';
  const origine = loc(jeu.origine || jeu.pays || jeu.culture || jeu.region) || '';
  const desc = loc(jeu.description || jeu.but_du_jeu || jeu.resume) || '';
  const niveau = loc(jeu.niveau || jeu.niveaux) || '';
  const intensite = loc(jeu.intensite || jeu.niveau_activite || jeu.intensite_activite) || '';
  const espace = loc(jeu.espace || jeu.lieu) || '';
  const nbJoueurs = loc(jeu.nb_joueurs || jeu.nombre_joueurs) || '';
  const emoji = getCategoryEmoji(jeu._source);

  const div = document.createElement('div');
  div.className = 'game-card';
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', `Voir les détails de ${titre}`);

  const favored = isFavori(jeu);

  div.innerHTML = `
    <button class="card-fav-btn" aria-label="Favori" title="Ajouter aux favoris">${favored ? '★' : '☆'}</button>
    <div class="card-header">
      <span class="card-icon" aria-hidden="true">${emoji}</span>
      <div class="card-header-text">
        <div class="card-title">${escapeHtml(titre)}</div>
        ${origine ? `<div class="card-origin">🌍 ${escapeHtml(origine)}</div>` : ''}
      </div>
    </div>
    ${jeu.image ? `<div class="card-img"><img src="${jeu.image}" alt="Disposition - ${escapeHtml(titre)}" loading="lazy"></div>` : ''}
    ${desc ? `<p class="card-desc">${escapeHtml(desc)}</p>` : ''}
    <div class="card-tags">
      ${niveau ? `<span class="tag ${getNiveauClass(niveau)}">${escapeHtml(String(niveau))}</span>` : ''}
      ${intensite ? `<span class="tag ${getIntensiteClass(intensite)}">${escapeHtml(String(intensite))}</span>` : ''}
      ${espace ? `<span class="tag tag-espace">📍 ${escapeHtml(String(espace))}</span>` : ''}
    </div>
    ${nbJoueurs ? `
    <div class="card-footer">
      <span class="card-players">👥 ${escapeHtml(String(nbJoueurs))}</span>
      <span class="card-arrow">Voir plus →</span>
    </div>` : `
    <div class="card-footer">
      <span></span>
      <span class="card-arrow">Voir plus →</span>
    </div>`}
  `;

  // Favori button
  const favBtn = div.querySelector('.card-fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavori(jeu);
    favBtn.textContent = nowFav ? '★' : '☆';
    // If showing only favoris and we just unfavorited, re-render
    if (favorisFilter && !nowFav) {
      applyFilters();
    }
  });

  div.addEventListener('click', () => openModal(jeu));
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(jeu);
    }
  });

  return div;
}

function renderJeux() {
  const grid = document.getElementById('jeux-grid');
  if (!grid) return;

  // Déconnecter l'observer précédent
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        🔍 Aucun jeu trouvé<br>
        <small>Essaie d'autres filtres ou efface la recherche</small>
      </div>`;
    renderPagination();
    return;
  }

  // Pagination : slice du tableau filtré
  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, end);

  const fragment = document.createDocumentFragment();
  pageItems.forEach(jeu => fragment.appendChild(renderCard(jeu)));
  grid.appendChild(fragment);

  // IntersectionObserver pour animations d'entrée au scroll
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Délai progressif pour les premières cartes visibles
        const delay = Math.min(i * 40, 300);
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, delay);
        intersectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  grid.querySelectorAll('.game-card').forEach(card => {
    intersectionObserver.observe(card);
  });

  renderPagination();
  updateStats();
}

// ============================================================
// PAGINATION
// ============================================================
function getTotalPages() {
  return Math.ceil(filtered.length / ITEMS_PER_PAGE);
}

function goToPage(page) {
  const totalPages = getTotalPages();
  if (page < 0 || page >= totalPages) return;
  currentPage = page;
  renderJeux();

  // Scroll vers le haut de la grille
  const grid = document.getElementById('jeux-grid');
  if (grid) {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = getTotalPages();
  container.innerHTML = '';

  if (totalPages <= 1) return;

  // Bouton Précédent
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn' + (currentPage === 0 ? ' disabled' : '');
  prevBtn.textContent = '← Précédent';
  prevBtn.disabled = currentPage === 0;
  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  container.appendChild(prevBtn);

  // Calcul des pages à afficher (max 7 numéros visibles)
  const maxVisible = 7;
  let startPage = 0;
  let endPage = totalPages - 1;

  if (totalPages > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    startPage = Math.max(0, currentPage - half);
    endPage = startPage + maxVisible - 1;
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = endPage - maxVisible + 1;
    }
  }

  // Premier numéro + ellipsis si nécessaire
  if (startPage > 0) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = '1';
    btn.addEventListener('click', () => goToPage(0));
    container.appendChild(btn);
    if (startPage > 1) {
      const dots = document.createElement('span');
      dots.className = 'page-dots';
      dots.textContent = '…';
      container.appendChild(dots);
    }
  }

  // Numéros de page
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i + 1;
    btn.addEventListener('click', () => goToPage(i));
    container.appendChild(btn);
  }

  // Dernier numéro + ellipsis si nécessaire
  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      const dots = document.createElement('span');
      dots.className = 'page-dots';
      dots.textContent = '…';
      container.appendChild(dots);
    }
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = totalPages;
    btn.addEventListener('click', () => goToPage(totalPages - 1));
    container.appendChild(btn);
  }

  // Bouton Suivant
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn' + (currentPage >= totalPages - 1 ? ' disabled' : '');
  nextBtn.textContent = 'Suivant →';
  nextBtn.disabled = currentPage >= totalPages - 1;
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  container.appendChild(nextBtn);
}

// ============================================================
// STATS
// ============================================================
function updateStats() {
  const count = filtered.length;

  // Stats bar
  const countEl = document.getElementById('stat-count');
  if (countEl) countEl.textContent = `${count} jeu${count !== 1 ? 'x' : ''}`;

  const originesEl = document.getElementById('stat-origines');
  if (originesEl) {
    const origines = new Set(
      filtered.map(j => j.origine || j.pays || j.culture || j.region).filter(Boolean)
    );
    originesEl.textContent = `${origines.size} origine${origines.size !== 1 ? 's' : ''}`;
  }

  const catsEl = document.getElementById('stat-categories');
  if (catsEl) {
    const cats = new Set(filtered.map(j => j._source).filter(Boolean));
    catsEl.textContent = `${cats.size} catégorie${cats.size !== 1 ? 's' : ''}`;
  }

  // Header stat jeux
  const headerCount = document.getElementById('hstat-jeux');
  if (headerCount) {
    headerCount.innerHTML = `<span class="hstat-num">${allJeux.length}</span><span class="hstat-label">JEUX</span>`;
  }

  // Compteur rapide
  const quickCount = document.getElementById('quick-count');
  if (quickCount) quickCount.textContent = `${count} jeu${count !== 1 ? 'x' : ''}`;
}

// ============================================================
// MODAL
// ============================================================
function openModal(jeu) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  const titre = loc(jeu.titre || jeu.nom) || 'Sans titre';
  const desc = loc(jeu.description) || '';
  const but = loc(jeu.but_du_jeu) || '';
  const deroulement = locArray(jeu.deroulement || jeu.regles || jeu.etapes);
  const variantes = locArray(jeu.variantes || jeu.variations);
  const materiel = locArray(jeu.materiel || jeu.equipement);
  const consignes_securite = locArray(jeu.consignes_securite || jeu.securite);
  const origine = loc(jeu.origine || jeu.pays || jeu.culture || jeu.region) || '';
  const niveau = loc(jeu.niveau || jeu.niveaux) || '';
  const espace = loc(jeu.espace || jeu.lieu) || '';
  const intensite = loc(jeu.intensite || jeu.niveau_activite || jeu.intensite_activite) || '';
  const nbJoueurs = loc(jeu.nb_joueurs || jeu.nombre_joueurs) || '';
  const duree = loc(jeu.duree || jeu.duree_minutes) || '';
  const objectifs = locArray(jeu.objectifs || jeu.competences);
  const disposition = loc(jeu.disposition) || '';
  const adaptations = loc(jeu.adaptations_besoins_speciaux) || '';
  const intentions = loc(jeu.intentions_pedagogiques) || '';
  const nomsAlt = locArray(jeu.noms_alternatifs);
  const compMotrices = locArray(jeu.competences_motrices);
  const valeurs = locArray(jeu.valeurs);
  const emoji = getCategoryEmoji(jeu._source);

  const modalFav = isFavori(jeu);

  body.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${emoji} ${escapeHtml(titre)}</h2>
      <div class="modal-header-actions">
        <button class="modal-action-btn modal-fav-btn" id="modal-fav-btn" aria-label="Favori" title="Favori">${modalFav ? '★' : '☆'}</button>
        <button class="modal-action-btn" id="modal-print-btn" aria-label="Imprimer" title="Imprimer">🖨️</button>
        <button class="modal-action-btn" id="modal-share-btn" aria-label="Partager" title="Partager">🔗</button>
        <button class="modal-close" onclick="closeModal()" aria-label="Fermer">✕</button>
      </div>
    </div>

    <div class="modal-meta">
      ${origine ? `<span class="modal-badge">🌍 ${escapeHtml(origine)}</span>` : ''}
      ${niveau ? `<span class="modal-badge">${escapeHtml(String(niveau))}</span>` : ''}
      ${espace ? `<span class="modal-badge">📍 ${escapeHtml(String(espace))}</span>` : ''}
      ${intensite ? `<span class="modal-badge">⚡ ${escapeHtml(String(intensite))}</span>` : ''}
      ${nbJoueurs ? `<span class="modal-badge">👥 ${escapeHtml(String(nbJoueurs))}</span>` : ''}
      ${duree ? `<span class="modal-badge">⏱ ${escapeHtml(String(duree))} min</span>` : ''}
    </div>

    ${jeu.image ? `
    <div class="modal-section modal-img-section">
      <img src="${jeu.image}" alt="Disposition - ${escapeHtml(titre)}" class="modal-img">
    </div>` : ''}

    ${nomsAlt.length ? `
    <div class="modal-section">
      <h3>🏷️ ${t('noms_alt', 'Aussi connu sous')}</h3>
      <p>${nomsAlt.map(n => escapeHtml(loc(n))).join(' · ')}</p>
    </div>` : ''}

    ${intentions ? `
    <div class="modal-section">
      <h3>🎓 ${t('intentions', 'Intentions pédagogiques')}</h3>
      <p>${escapeHtml(intentions)}</p>
    </div>` : ''}

    ${desc ? `
    <div class="modal-section">
      <h3>📝 Description</h3>
      <p>${escapeHtml(desc)}</p>
    </div>` : ''}

    ${but ? `
    <div class="modal-section">
      <h3>🎯 ${t('but', 'But du jeu')}</h3>
      <p>${escapeHtml(but)}</p>
    </div>` : ''}

    ${objectifs.length ? `
    <div class="modal-section">
      <h3>🏆 ${t('objectifs', 'Objectifs')}</h3>
      <ul>${objectifs.map(o => `<li>${escapeHtml(itemToString(loc(o)))}</li>`).join('')}</ul>
    </div>` : ''}

    ${materiel.length ? `
    <div class="modal-section">
      <h3>🎒 ${t('materiel', 'Matériel')}</h3>
      <ul>${materiel.map(m => `<li>${escapeHtml(itemToString(loc(m)))}</li>`).join('')}</ul>
    </div>` : ''}

    ${disposition ? `
    <div class="modal-section">
      <h3>📐 ${t('disposition', 'Disposition')}</h3>
      <p>${escapeHtml(disposition)}</p>
    </div>` : ''}

    ${deroulement.length ? `
    <div class="modal-section">
      <h3>📋 ${t('deroulement', 'Déroulement')}</h3>
      <ol>${deroulement.map(d => `<li>${escapeHtml(itemToString(loc(d)))}</li>`).join('')}</ol>
    </div>` : ''}

    ${variantes.length ? `
    <div class="modal-section">
      <h3>💡 ${t('variantes', 'Variantes')}</h3>
      <ul>${variantes.map(v => `<li>${escapeHtml(itemToString(loc(v)))}</li>`).join('')}</ul>
    </div>` : ''}

    ${adaptations ? `
    <div class="modal-section">
      <h3>♿ ${t('adaptations', 'Adaptations')}</h3>
      <p>${escapeHtml(adaptations)}</p>
    </div>` : ''}

    ${compMotrices.length ? `
    <div class="modal-section">
      <h3>🏃 ${t('competences', 'Compétences motrices')}</h3>
      <ul>${compMotrices.map(c => `<li>${escapeHtml(loc(c))}</li>`).join('')}</ul>
    </div>` : ''}

    ${valeurs.length ? `
    <div class="modal-section">
      <h3>💎 ${t('valeurs', 'Valeurs')}</h3>
      <ul>${valeurs.map(v => `<li>${escapeHtml(loc(v))}</li>`).join('')}</ul>
    </div>` : ''}

    ${consignes_securite.length ? `
    <div class="modal-section">
      <h3>🛡️ ${t('securite', 'Sécurité')}</h3>
      <ul>${consignes_securite.map(s => `<li>${escapeHtml(itemToString(loc(s)))}</li>`).join('')}</ul>
    </div>` : ''}
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Modal favori button
  const modalFavBtn = document.getElementById('modal-fav-btn');
  if (modalFavBtn) {
    modalFavBtn.addEventListener('click', () => {
      const nowFav = toggleFavori(jeu);
      modalFavBtn.textContent = nowFav ? '★' : '☆';
      // Update the card star if visible
      updateCardFavStar(jeu, nowFav);
    });
  }

  // Modal print button
  const printBtn = document.getElementById('modal-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Modal share button
  const shareBtn = document.getElementById('modal-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const id = encodeURIComponent(getJeuId(jeu));
      const url = `https://jeux.zonetotalsport.ca/?id=${id}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Lien copié !');
      }).catch(() => {
        showToast('Lien copié !');
      });
    });
  }

  // Focus trap basique
  const closeBtn = body.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

// Update card fav star after toggling in modal
function updateCardFavStar(jeu, isFav) {
  const grid = document.getElementById('jeux-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.game-card');
  const jeuId = getJeuId(jeu);
  cards.forEach(card => {
    const titleEl = card.querySelector('.card-title');
    if (titleEl && (titleEl.textContent === (jeu.titre || jeu.nom || 'Sans titre'))) {
      const btn = card.querySelector('.card-fav-btn');
      if (btn) btn.textContent = isFav ? '★' : '☆';
    }
  });
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================================
// COMPTEURS ANIMÉS (hero)
// ============================================================
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count) || 0;
    if (target === 0) return;
    let count = 0;
    const duration = 1200;
    const step = target / (duration / 16);

    const interval = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = Math.floor(count).toLocaleString('fr-CA');
      if (count >= target) {
        el.textContent = target.toLocaleString('fr-CA');
        clearInterval(interval);
      }
    }, 16);
  });
}

// ============================================================
// CANVAS — PARTICULES
// ============================================================
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const particles = Array.from({ length: 80 }, () => createParticle(canvas));

  function createParticle(canvas) {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.1,
      pulse: Math.random() * Math.PI * 2
    };
  }

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    particles.forEach(p => {
      // Pulsation subtile
      const pulsedAlpha = p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${pulsedAlpha})`;
      ctx.fill();

      // Mouvement
      p.x += p.vx;
      p.y += p.vy;

      // Wrap autour de l'écran
      if (p.x < -5) p.x = canvas.width + 5;
      else if (p.x > canvas.width + 5) p.x = -5;
      if (p.y < -5) p.y = canvas.height + 5;
      else if (p.y > canvas.height + 5) p.y = -5;
    });

    animId = requestAnimationFrame(draw);
  }

  draw();

  window.addEventListener('resize', () => {
    resize();
  });

  // Nettoyage si nécessaire
  window._stopCanvas = () => {
    if (animId) cancelAnimationFrame(animId);
  };
}

// ============================================================
// UTILITAIRES
// ============================================================
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split('\n').filter(Boolean);
  return [val];
}

function itemToString(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return String(item);
  // Objet avec propriétés communes
  return item.titre || item.description || item.etape ||
         item.variante || item.nom || item.texte ||
         JSON.stringify(item);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// DEEP LINK (partage)
// ============================================================
function checkDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const jeu = allJeux.find(j => getJeuId(j) === id);
  if (jeu) {
    setTimeout(() => openModal(jeu), 500);
  }
}

// ============================================================
// FILTRE FAVORIS (bouton toggle)
// ============================================================
function toggleFavorisFilter() {
  favorisFilter = !favorisFilter;
  const btn = document.getElementById('btn-favoris-filter');
  if (btn) btn.classList.toggle('active', favorisFilter);
  applyFilters();
}
window.toggleFavorisFilter = toggleFavorisFilter;

// ============================================================
// ÉVÉNEMENTS GLOBAUX
// ============================================================

// Fermer modal sur clic du backdrop
document.addEventListener('click', e => {
  if (e.target.id === 'modal-backdrop') closeModal();
});

// Fermer modal avec Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Exposer resetFilters globalement pour le bouton HTML
window.resetFilters = resetFilters;
window.closeModal = closeModal;
