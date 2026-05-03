#!/usr/bin/env python3
"""Merge 1040 (app-jeux) + 449 (repertoire-jeux-eps) -> unified schema, dedupe."""
import json, os, re, unicodedata, glob

APP_JEUX_DIR = '/Users/admin/PROJETS_CLAUDE/app-jeux/data/jeux'
PFEQ_FILE = '/Users/admin/Desktop/Remotion 2/repertoire-jeux-eps/games-data.js'
OUT_FILE = '/Users/admin/PROJETS_CLAUDE/app-jeux/data/jeux-merged.json'

# Unified category keys (after normalization)
CATEGORY_MAP = {
    'ballons-chasseurs': {'name': 'Ballons chasseurs', 'nameEn': 'Dodgeball', 'icon': '🎯', 'color': '#FF2D2D'},
    'poursuites': {'name': 'Poursuites', 'nameEn': 'Chase', 'icon': '🏃', 'color': '#FF8C00'},
    'cooperatifs': {'name': 'Coopératifs', 'nameEn': 'Cooperative', 'icon': '🤝', 'color': '#00D26A'},
    'collectifs': {'name': 'Sports collectifs', 'nameEn': 'Team sports', 'icon': '⚽', 'color': '#0088FF'},
    'opposition': {'name': 'Opposition', 'nameEn': 'Wrestling', 'icon': '⚔️', 'color': '#8B2FC9'},
    'duels': {'name': 'Duels', 'nameEn': 'Duels', 'icon': '🥊', 'color': '#FFD000'},
    'sans-materiel': {'name': 'Sans matériel', 'nameEn': 'No equipment', 'icon': '🙌', 'color': '#06B6D4'},
    'exterieur': {'name': 'Extérieur', 'nameEn': 'Outdoor', 'icon': '🌿', 'color': '#84CC16'},
    'traditionnels': {'name': 'Traditionnels du monde', 'nameEn': 'World traditional', 'icon': '🌍', 'color': '#EC4899'},
    'individuels': {'name': 'Sports individuels', 'nameEn': 'Individual sports', 'icon': '🏋️', 'color': '#F97316'},
    'autochtones': {'name': 'Autochtones', 'nameEn': 'Indigenous', 'icon': '🪶', 'color': '#A16207'},
    'avec-materiel': {'name': 'Avec matériel', 'nameEn': 'With equipment', 'icon': '🏸', 'color': '#0EA5E9'},
    'olympiques': {'name': 'Olympiques', 'nameEn': 'Olympic', 'icon': '🥇', 'color': '#FACC15'},
    'afrique-asie': {'name': 'Afrique·Asie·Océanie', 'nameEn': 'Africa·Asia·Oceania', 'icon': '🌏', 'color': '#D946EF'},
    'ameriques-europe': {'name': 'Amériques·Europe', 'nameEn': 'Americas·Europe', 'icon': '🌎', 'color': '#22D3EE'},
    'prescolaire': {'name': 'Préscolaire', 'nameEn': 'Preschool', 'icon': '🌱', 'color': '#65A30D'},
    'secondaire': {'name': 'Secondaire', 'nameEn': 'Secondary', 'icon': '🎓', 'color': '#7C3AED'},
    'ludiques': {'name': 'Ludiques', 'nameEn': 'Fun games', 'icon': '🎮', 'color': '#10B981'},
}

# Map any input source-key to a unified category key
CAT_NORMALIZE = {
    # 1040 keys
    'ballon_chasseur': 'ballons-chasseurs',
    'poursuite': 'poursuites',
    'cooperation': 'cooperatifs',
    'opposition': 'opposition',
    'sports_collectifs': 'collectifs',
    'sans_materiel': 'sans-materiel',
    'exterieur': 'exterieur',
    'traditionnels_monde': 'traditionnels',
    'sports_individuels': 'individuels',
    'jeux_autochtones': 'autochtones',
    'jeux_avec_materiel': 'avec-materiel',
    'jeux_olympiques_paralympiques': 'olympiques',
    'jeux_afrique_asie_oceanie': 'afrique-asie',
    'jeux_ameriques_europe': 'ameriques-europe',
    'jeux_prescolaire': 'prescolaire',
    'jeux_secondaire': 'secondaire',
    'monde_batch01': 'traditionnels',
    # 449 PFEQ keys
    'ballons-chasseurs': 'ballons-chasseurs',
    'poursuites': 'poursuites',
    'ludiques': 'ludiques',
    'collectifs': 'collectifs',
    'duels': 'duels',
}

def normalize_title(t):
    if not t: return ''
    t = unicodedata.normalize('NFKD', str(t)).encode('ascii','ignore').decode().lower()
    t = re.sub(r'[^a-z0-9 ]', ' ', t)
    t = re.sub(r'\b(le|la|les|un|une|des|du|de|au|aux)\b', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def loc(v):
    if not v: return ''
    if isinstance(v, dict): return v.get('fr') or v.get('en') or next(iter(v.values()), '')
    if isinstance(v, list): return ' '.join(str(x) for x in v)
    return str(v)

def loc_arr(v):
    if not v: return []
    if isinstance(v, list): return [loc(x) for x in v]
    if isinstance(v, dict):
        a = v.get('fr') or v.get('en')
        return a if isinstance(a, list) else ([a] if a else [])
    return [str(v)]

def normalize_1040(item, source_key):
    cat_key = CAT_NORMALIZE.get(source_key, 'ludiques')
    cat = CATEGORY_MAP[cat_key]
    return {
        'id': item.get('id') or f"{source_key}_{hash(loc(item.get('titre','')))%99999}",
        'title': loc(item.get('titre') or item.get('title') or ''),
        'titleEn': loc(item.get('title_en') or item.get('titreEn') or ''),
        'category': cat_key,
        'categoryName': cat['name'],
        'categoryIcon': cat['icon'],
        'categoryColor': cat['color'],
        'but': loc(item.get('intentions_pedagogiques') or item.get('but') or ''),
        'intentionsC1': '',
        'intentionsC2': '',
        'intentionsC3': '',
        'transversales': loc_arr(item.get('valeurs')) or loc_arr(item.get('competences_motrices')),
        'materiel': loc_arr(item.get('materiel')),
        'disposition': loc(item.get('disposition')),
        'duree': loc(item.get('duree')),
        'dureeMin': item.get('age_min') and 15 or 15,
        'deroulement': loc_arr(item.get('deroulement')),
        'variantes': loc_arr(item.get('variantes')),
        # Extras
        'origine': loc(item.get('origine')),
        'ageMin': item.get('age_min'),
        'ageMax': item.get('age_max'),
        'nbJoueursMin': item.get('nb_joueurs_min'),
        'nbJoueursMax': item.get('nb_joueurs_max'),
        'espace': loc(item.get('espace')),
        'niveauActivite': loc(item.get('niveau_activite')),
        'niveau': loc(item.get('niveau')),
        'consignesSecurite': loc_arr(item.get('consignes_securite')),
        'adaptations': loc_arr(item.get('adaptations_besoins_speciaux')),
        'roleEnseignant': loc(item.get('role_enseignant')),
        'retourAuCalme': loc(item.get('retour_au_calme')),
        'questionsReflexion': loc_arr(item.get('questions_reflexion')),
        'progression': loc(item.get('progression')),
        'erreursFrequentes': loc_arr(item.get('erreurs_frequentes')),
        'noms_alternatifs': loc_arr(item.get('noms_alternatifs')),
        'tags': loc_arr(item.get('tags')),
        '_source': '1040',
    }

def normalize_pfeq(item):
    """449 PFEQ schema is already close to target."""
    raw_cat = item.get('category', 'ludiques')
    cat_key = CAT_NORMALIZE.get(raw_cat, raw_cat if raw_cat in CATEGORY_MAP else 'ludiques')
    cat = CATEGORY_MAP.get(cat_key, CATEGORY_MAP['ludiques'])
    return {
        'id': f"pfeq_{item.get('id')}",
        'title': item.get('title', ''),
        'titleEn': item.get('titleEn', ''),
        'category': cat_key,
        'categoryName': cat['name'],
        'categoryIcon': cat['icon'],
        'categoryColor': cat['color'],
        'but': item.get('but', ''),
        'intentionsC1': item.get('intentionsC1', ''),
        'intentionsC2': item.get('intentionsC2', ''),
        'intentionsC3': item.get('intentionsC3', ''),
        'transversales': item.get('transversales', []),
        'materiel': item.get('materiel', []),
        'disposition': item.get('disposition', ''),
        'duree': item.get('duree', ''),
        'dureeMin': item.get('dureeMin', 15),
        'deroulement': item.get('deroulement', []),
        'variantes': item.get('variantes', []),
        'origine': '', 'ageMin': None, 'ageMax': None,
        'nbJoueursMin': None, 'nbJoueursMax': None,
        'espace': '', 'niveauActivite': '', 'niveau': '',
        'consignesSecurite': [], 'adaptations': [],
        'roleEnseignant': '', 'retourAuCalme': '',
        'questionsReflexion': [], 'progression': '',
        'erreursFrequentes': [], 'noms_alternatifs': [],
        'tags': [],
        '_source': '449',
        # English data
        'butEn': item.get('butEn', ''),
        'dispositionEn': item.get('dispositionEn', ''),
        'deroulementEn': item.get('deroulementEn', []),
        'variantesEn': item.get('variantesEn', []),
    }

def merge(a, b):
    """Merge b into a. Keep a's non-empty fields, fill from b."""
    for k, vb in b.items():
        va = a.get(k)
        if not va and vb:
            a[k] = vb
        elif isinstance(va, list) and isinstance(vb, list) and len(vb) > len(va):
            a[k] = vb
    return a

# === Load 1040 ===
all_1040 = []
for fp in sorted(glob.glob(f'{APP_JEUX_DIR}/*.json')):
    fn = os.path.basename(fp).replace('.json','')
    if fn.endswith('_v1_backup') or fn.startswith('v2_pour_'):
        continue
    try:
        d = json.load(open(fp))
        items = d if isinstance(d, list) else d.get('jeux', d.get('games', []))
        for it in items:
            all_1040.append(normalize_1040(it, fn))
    except Exception as e:
        print(f'ERR {fn}: {e}')
print(f'Loaded 1040 set: {len(all_1040)} jeux')

# === Load 449 ===
all_449 = json.load(open('/tmp/games-449.json'))
all_449 = [normalize_pfeq(it) for it in all_449]
print(f'Loaded 449 set: {len(all_449)} jeux')

# === Dedupe ===
seen = {}
duplicates = 0
for j in all_449 + all_1040:  # 449 first = priority on PFEQ
    key = normalize_title(j['title'])
    if not key:
        continue
    if key in seen:
        seen[key] = merge(seen[key], j)
        duplicates += 1
    else:
        seen[key] = j

merged = list(seen.values())
print(f'After dedupe: {len(merged)} jeux ({duplicates} doublons fusionnes)')

# Reassign clean sequential ids
for i, j in enumerate(merged, 1):
    j['_uid'] = i

json.dump(merged, open(OUT_FILE, 'w'), ensure_ascii=False, separators=(',',':'))
print(f'Wrote {OUT_FILE} ({os.path.getsize(OUT_FILE)//1024} KB)')
