#!/usr/bin/env python3
"""Translate FR -> EN via Claude Haiku 4.5, batched + parallel."""
import json, os, time, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from anthropic import Anthropic

FP = '/Users/admin/PROJETS_CLAUDE/app-jeux/data/jeux-merged.json'
CACHE = '/tmp/translate-claude-cache.json'
MODEL = 'claude-haiku-4-5-20251001'
BATCH_SIZE = 30
WORKERS = 6

TEXT_FIELDS = ['title','but','disposition','origine','roleEnseignant','retourAuCalme','progression','niveau','espace','niveauActivite','duree']
ARRAY_FIELDS = ['deroulement','variantes','transversales','materiel','consignesSecurite','adaptations','questionsReflexion','erreursFrequentes','noms_alternatifs']

cache = {}
if os.path.exists(CACHE):
    try: cache = json.load(open(CACHE))
    except: cache = {}
print(f'Cache start: {len(cache)} entries', flush=True)

client = Anthropic()

PROMPT = """Translate the following French physical education / sports content to natural, fluent English. Keep the same JSON structure and array order. Be concise — match the brevity of the original. Use proper PE/sports terminology (e.g. "ballon chasseur" → "dodgeball", "frite" → "noodle", "dossard" → "pinnie", "cycle" → "grade level").

Input (JSON array):
{texts}

Output: ONLY a JSON array of the same length with translations, nothing else."""

def translate_batch(texts):
    """Translate a list of FR strings -> list of EN strings via Claude."""
    if not texts: return []
    payload = json.dumps(texts, ensure_ascii=False)
    msg = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[{'role':'user','content':PROMPT.format(texts=payload)}]
    )
    raw = msg.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith('```'):
        raw = raw.split('```',2)[1]
        if raw.startswith('json'): raw = raw[4:]
        raw = raw.rsplit('```',1)[0]
    raw = raw.strip()
    try:
        result = json.loads(raw)
        if not isinstance(result, list) or len(result) != len(texts):
            raise ValueError(f'bad shape: {len(result) if isinstance(result,list) else type(result)}')
        return result
    except Exception as e:
        print(f'  parse ERR {e}: {raw[:200]}', flush=True)
        return texts  # fallback

def process_chunk(chunk):
    """chunk is list of texts; return cache updates"""
    try:
        translations = translate_batch(chunk)
        return list(zip(chunk, translations))
    except Exception as e:
        print(f'  batch ERR: {e}', flush=True)
        return [(t,t) for t in chunk]

# Collect strings
data = json.load(open(FP))
print(f'Loaded {len(data)} jeux', flush=True)

all_texts = set()
for j in data:
    for f in TEXT_FIELDS:
        if j.get(f) and not j.get(f+'En'):
            t = j[f].strip() if isinstance(j[f], str) else None
            if t and t not in cache: all_texts.add(t)
    for f in ARRAY_FIELDS:
        for x in j.get(f, []) or []:
            if isinstance(x, str):
                t = x.strip()
                if t and t not in cache: all_texts.add(t)

texts = list(all_texts)
print(f'To translate: {len(texts)} unique strings', flush=True)

# Chunk
chunks = [texts[i:i+BATCH_SIZE] for i in range(0, len(texts), BATCH_SIZE)]
print(f'Chunks: {len(chunks)} of size {BATCH_SIZE}', flush=True)

# Process
start = time.time()
done_chunks = 0
SAVE_EVERY = 5

with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    futures = {ex.submit(process_chunk, c): i for i, c in enumerate(chunks)}
    for fut in as_completed(futures):
        pairs = fut.result()
        for src, tgt in pairs:
            cache[src] = tgt
        done_chunks += 1
        if done_chunks % SAVE_EVERY == 0:
            json.dump(dict(cache), open(CACHE, 'w'), ensure_ascii=False)
            elapsed = time.time() - start
            rate = done_chunks / elapsed
            eta = (len(chunks) - done_chunks) / rate if rate else 0
            print(f'[chunk {done_chunks}/{len(chunks)}] cache={len(cache)} elapsed={elapsed:.0f}s eta={eta:.0f}s', flush=True)

json.dump(dict(cache), open(CACHE, 'w'), ensure_ascii=False)
print(f'Translation done in {time.time()-start:.0f}s. Cache: {len(cache)}', flush=True)

# Apply
def lookup(s):
    if not isinstance(s, str): return s
    return cache.get(s.strip(), s)

for j in data:
    for f in TEXT_FIELDS:
        if j.get(f) and not j.get(f+'En'):
            j[f+'En'] = lookup(j[f])
    for f in ARRAY_FIELDS:
        if j.get(f) and not j.get(f+'En'):
            j[f+'En'] = [lookup(x) if isinstance(x, str) else x for x in j[f]]

json.dump(data, open(FP, 'w'), ensure_ascii=False, separators=(',',':'))
print(f'DONE total={time.time()-start:.0f}s file={os.path.getsize(FP)//1024}KB', flush=True)
