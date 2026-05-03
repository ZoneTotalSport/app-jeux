#!/usr/bin/env python3
"""Fast parallel FR->EN translation. Saves progressively."""
import json, time, os, sys
from deep_translator import MyMemoryTranslator as Translator
from concurrent.futures import ThreadPoolExecutor, as_completed

FP = '/Users/admin/PROJETS_CLAUDE/app-jeux/data/jeux-merged.json'
CACHE = '/tmp/translate-cache.json'
WORKERS = 12

TEXT_FIELDS = ['title','but','disposition','origine','roleEnseignant','retourAuCalme','progression','niveau','espace','niveauActivite','duree']
ARRAY_FIELDS = ['deroulement','variantes','transversales','materiel','consignesSecurite','adaptations','questionsReflexion','erreursFrequentes','noms_alternatifs']

cache = {}
if os.path.exists(CACHE):
    try: cache = json.load(open(CACHE))
    except: cache = {}
print(f'Cache start: {len(cache)} entries', flush=True)

def make_translator():
    return Translator(source='fr-FR', target='en-US')

def tr_one(text):
    if not text or not isinstance(text, str): return text
    t = text.strip()
    if not t or len(t) < 2: return text
    if t in cache: return cache[t]
    try:
        if len(t) > 4500:
            chunks = [t[i:i+4500] for i in range(0, len(t), 4500)]
            result = ' '.join(make_translator().translate(c) for c in chunks)
        else:
            result = make_translator().translate(t)
        cache[t] = result
        return result
    except Exception as e:
        return text

# Collect ALL strings to translate
data = json.load(open(FP))
print(f'Loaded {len(data)} jeux', flush=True)

all_texts = set()
for j in data:
    for f in TEXT_FIELDS:
        if j.get(f) and not j.get(f+'En'):
            t = j[f].strip() if isinstance(j[f], str) else None
            if t and t not in cache: all_texts.add(t)
    for f in ARRAY_FIELDS:
        arr = j.get(f, [])
        if arr and not j.get(f+'En'):
            for x in arr:
                if isinstance(x, str):
                    t = x.strip()
                    if t and t not in cache: all_texts.add(t)

print(f'Unique strings to translate: {len(all_texts)}', flush=True)

# Translate in parallel
start = time.time()
texts = list(all_texts)
done = 0
SAVE_EVERY = 200

with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    futures = {ex.submit(tr_one, t): t for t in texts}
    for f in as_completed(futures):
        done += 1
        if done % SAVE_EVERY == 0:
            json.dump(dict(cache), open(CACHE, 'w'), ensure_ascii=False)
            elapsed = time.time() - start
            rate = done / elapsed
            eta = (len(texts) - done) / rate if rate else 0
            print(f'[{done}/{len(texts)}] cache={len(cache)} elapsed={elapsed:.0f}s eta={eta:.0f}s', flush=True)

json.dump(dict(cache), open(CACHE, 'w'), ensure_ascii=False)
print(f'Translation pass done in {time.time()-start:.0f}s. Now applying to data...', flush=True)

# Apply to data
def apply_tr(text):
    if not text or not isinstance(text, str): return text
    t = text.strip()
    return cache.get(t, text)

for j in data:
    for f in TEXT_FIELDS:
        if j.get(f) and not j.get(f+'En'):
            j[f+'En'] = apply_tr(j[f])
    for f in ARRAY_FIELDS:
        arr = j.get(f, [])
        if arr and not j.get(f+'En'):
            j[f+'En'] = [apply_tr(x) if isinstance(x, str) else x for x in arr]

json.dump(data, open(FP, 'w'), ensure_ascii=False, separators=(',',':'))
print(f'DONE total={time.time()-start:.0f}s file={os.path.getsize(FP)//1024}KB', flush=True)
