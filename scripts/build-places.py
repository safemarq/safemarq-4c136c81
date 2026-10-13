"""
Build src/data/be-places.json from the GeoNames Belgian postal code file.

Source: GeoNames postal codes (CC BY 4.0, https://www.geonames.org), JSON
conversion published at github.com/zauberware/postal-codes-json-xml-csv
(data/BE.zip → zipcodes.be.json).

    python3 scripts/build-places.py path/to/zipcodes.be.json

Output: one row per locality,
    [slug, name, zips, lat, lng, region, names, main]
where `name` is the local name, `zips` a space-separated list, `region`
b (Brussels) / w (Wallonia) / f (Flanders), and `names` the other-language
names ({fr, nl, de, en}) or 0, and main 1 when it is the locality people
mean by its postal code (Jambes for 5100). The slug comes from the French name, so
URLs match the French source language of the site.
"""
import json
import math
import re
import sys
import unicodedata
from collections import defaultdict

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'src/data/be-places.json'

REGION = {'Bruxelles-Capitale': 'b', 'Wallonie': 'w', 'Vlaanderen': 'f'}

# Other-language names, keyed by the GeoNames name (or "name@zip" when the
# name is shared by several towns). Only well-established names: a wrong
# exonym is worse than none.
NAMES: dict[str, dict[str, str]] = {
    # Brussels: GeoNames uses French
    'Bruxelles': {'nl': 'Brussel', 'de': 'Brüssel', 'en': 'Brussels'},
    'Laeken': {'nl': 'Laken'},
    'Schaerbeek': {'nl': 'Schaarbeek'},
    'Ixelles': {'nl': 'Elsene'},
    'Saint-Gilles': {'nl': 'Sint-Gillis'},
    'Molenbeek-Saint-Jean': {'nl': 'Sint-Jans-Molenbeek'},
    'Berchem-Sainte-Agathe': {'nl': 'Sint-Agatha-Berchem'},
    'Woluwe-Saint-Pierre': {'nl': 'Sint-Pieters-Woluwe'},
    'Woluwe-Saint-Lambert': {'nl': 'Sint-Lambrechts-Woluwe'},
    'Auderghem': {'nl': 'Oudergem'},
    'Watermael-Boitsfort': {'nl': 'Watermaal-Bosvoorde'},
    'Uccle': {'nl': 'Ukkel'},
    'Forest@1190': {'nl': 'Vorst'},
    'Saint-Josse-ten-Noode': {'nl': 'Sint-Joost-ten-Node'},
    # Flanders: GeoNames uses Dutch, French has its own names for the big towns
    'Antwerpen': {'fr': 'Anvers', 'en': 'Antwerp'},
    'Gent': {'fr': 'Gand', 'en': 'Ghent'},
    'Brugge': {'fr': 'Bruges', 'de': 'Brügge', 'en': 'Bruges'},
    'Leuven': {'fr': 'Louvain', 'de': 'Löwen'},
    'Mechelen': {'fr': 'Malines', 'de': 'Mecheln'},
    'Oostende': {'fr': 'Ostende', 'de': 'Ostende', 'en': 'Ostend'},
    'Kortrijk': {'fr': 'Courtrai'},
    'Aalst@9300': {'fr': 'Alost'},
    'Halle@1500': {'fr': 'Hal'},
    'Dendermonde': {'fr': 'Termonde'},
    'Sint-Niklaas': {'fr': 'Saint-Nicolas'},
    'Ieper': {'fr': 'Ypres', 'en': 'Ypres'},
    'Oudenaarde': {'fr': 'Audenarde'},
    'Geraardsbergen': {'fr': 'Grammont'},
    'Tienen': {'fr': 'Tirlemont'},
    'Tongeren': {'fr': 'Tongres'},
    'Sint-Truiden': {'fr': 'Saint-Trond'},
    'Vilvoorde': {'fr': 'Vilvorde'},
    'Veurne': {'fr': 'Furnes'},
    'Diksmuide': {'fr': 'Dixmude'},
    'Lier': {'fr': 'Lierre'},
    'Menen': {'fr': 'Menin'},
    'Roeselare': {'fr': 'Roulers'},
    'Temse': {'fr': 'Tamise'},
    'Borgloon': {'fr': 'Looz'},
    # Flemish places GeoNames names in French
    'Renaix': {'nl': 'Ronse', 'local': 'nl'},
    'Biévène': {'nl': 'Bever', 'local': 'nl'},
    'Espierres': {'nl': 'Spiere', 'local': 'nl'},
    'Messines': {'nl': 'Mesen', 'local': 'nl'},
    'Rhode-Saint-Genèse': {'nl': 'Sint-Genesius-Rode', 'local': 'nl'},
    'Fourons': {'nl': 'Voeren', 'local': 'nl'},
    'Fouron-Saint-Martin': {'nl': 'Sint-Martens-Voeren', 'local': 'nl'},
    'Fouron-Saint-Pierre': {'nl': 'Sint-Pieters-Voeren', 'local': 'nl'},
    'Fouron-Le-Comte': {'nl': "'s-Gravenvoeren", 'local': 'nl'},
    'Mouland': {'nl': 'Moelingen', 'local': 'nl'},
    # Wallonia: Dutch names for the towns Flemish drivers know
    'Liège': {'nl': 'Luik', 'de': 'Lüttich'},
    'Namur': {'nl': 'Namen'},
    'Mons': {'nl': 'Bergen'},
    'Tournai': {'nl': 'Doornik'},
    'Nivelles': {'nl': 'Nijvel'},
    'Wavre': {'nl': 'Waver'},
    'Huy': {'nl': 'Hoei'},
    'Ath': {'nl': 'Aat'},
    'Enghien': {'nl': 'Edingen'},
    'Mouscron': {'nl': 'Moeskroen'},
    'Comines': {'nl': 'Komen'},
    'Comines-Warneton': {'nl': 'Komen-Waasten'},
    'Soignies': {'nl': 'Zinnik'},
    'Lessines': {'nl': 'Lessen'},
    'Arlon': {'nl': 'Aarlen', 'de': 'Arel'},
    'Bastogne': {'nl': 'Bastenaken'},
    'Jodoigne': {'nl': 'Geldenaken'},
    "Braine-l'Alleud": {'nl': 'Eigenbrakel'},
    'Braine-le-Comte': {'nl': "'s-Gravenbrakel"},
    'Hannut': {'nl': 'Hannuit'},
    'Waremme': {'nl': 'Borgworm'},
    'Visé': {'nl': 'Wezet'},
    'Tubize': {'nl': 'Tubeke'},
    # German-speaking Community: GeoNames uses French
    'Saint-Vith': {'de': 'Sankt Vith', 'nl': 'Sankt Vith', 'en': 'Sankt Vith', 'local': 'de'},
    'Bullange': {'de': 'Büllingen', 'nl': 'Büllingen', 'en': 'Büllingen', 'local': 'de'},
    'Amblève': {'de': 'Amel', 'nl': 'Amel', 'en': 'Amel', 'local': 'de'},
    'La Calamine': {'de': 'Kelmis', 'nl': 'Kelmis', 'en': 'Kelmis', 'local': 'de'},
    'Butgenbach': {'de': 'Bütgenbach', 'nl': 'Bütgenbach', 'en': 'Bütgenbach', 'local': 'de'},
}

# Postal codes shared by several localities: the one people mean. GeoNames does
# not say; when a locality bears the name of its arrondissement it is the main
# one, otherwise this list decides (GeoNames spelling).
MAIN_BY_ZIP = {
    '5100': 'Jambes', '1300': 'Wavre', '6200': 'Châtelet', '4100': 'Seraing', '3800': 'Sint-Truiden',
    '3300': 'Tienen', '2500': 'Lier', '5300': 'Andenne', '7300': 'Boussu', '5590': 'Ciney', '1500': 'Halle',
    '1800': 'Vilvoorde', '2200': 'Herentals', '3200': 'Aarschot', '3290': 'Diest', '8300': 'Knokke',
    '9600': 'Renaix', '7100': 'La Louvière', '1340': 'Ottignies', '5060': 'Tamines', '6040': 'Jumet',
}

# Same name, different towns: which one keeps the plain slug.
PREFERRED_ZIP = {
    'aalst': '3800',  # Aalst 9300 is "alost" in French
    'haren': '1130',
    'forest': '1190',
    'deurne': '2100',
    'berchem': '2600',
    'kapellen': '2950',
    'machelen': '1830',
    'tielt': '8700',
    'heusden': '3550',
    'hamme': '9220',
    'neufchateau': '6840',
    'beveren': '8800',
    'saint-nicolas': '9100',  # Sint-Niklaas, not the village near Liège
}


def slugify(s: str) -> str:
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def km(a, b) -> float:
    return math.hypot((a[0] - b[0]) * 111.2, (a[1] - b[1]) * 71.5)


rows = json.load(open(SRC, encoding='utf-8'))
places: dict[tuple[str, str], dict] = {}  # (fr slug, region) → place, merged by name
main_of_zip: dict[str, list] = {}

for r in rows:
    raw = r['place'].strip()
    zip_ = r['zipcode']
    extra = dict(NAMES.get(f'{raw}@{zip_}') or NAMES.get(raw) or {})
    local_lang = extra.pop('local', None)
    names = {'fr': extra.get('fr', raw), 'nl': extra.get('nl'), 'de': extra.get('de'), 'en': extra.get('en')}
    if local_lang:
        names['fr'] = raw  # GeoNames gave the French name; the local one is in `local_lang`
        local = extra[local_lang]
    else:
        local = raw
    lat, lng = round(float(r['latitude']), 4), round(float(r['longitude']), 4)
    region = REGION[r['state']]
    key = (slugify(names['fr']), region)
    prev = places.get(key)
    if prev and km((prev['lat'], prev['lng']), (lat, lng)) < 4:
        if zip_ not in prev['zips']:
            prev['zips'].append(zip_)
        if raw == MAIN_BY_ZIP.get(zip_) or (zip_ not in MAIN_BY_ZIP and raw.lower() == r['community'].lower()):
            main_of_zip.setdefault(zip_, []).append(key)
        continue
    if prev:
        key = (key[0], f'{region}{zip_}')
    places[key] = {'fr_slug': key[0], 'name': local, 'names': names, 'zips': [zip_], 'lat': lat, 'lng': lng, 'region': region, 'main': False}
    main_of_zip.setdefault(zip_, [])
    if raw == MAIN_BY_ZIP.get(zip_) or (zip_ not in MAIN_BY_ZIP and raw.lower() == r['community'].lower()):
        main_of_zip[zip_].append(key)

for keys in main_of_zip.values():
    for k in keys:
        places[k]['main'] = True
missing = [z for z, n in MAIN_BY_ZIP.items() if not main_of_zip.get(z)]
assert not missing, f'MAIN_BY_ZIP names not found: {missing}'

# Unique slugs: the preferred (or lowest) postal code keeps the plain one.
by_slug = defaultdict(list)
for p in places.values():
    by_slug[p['fr_slug']].append(p)
for slug, group in by_slug.items():
    group.sort(key=lambda p: (p['zips'][0] != PREFERRED_ZIP.get(slug, ''), p['zips'][0]))
    for i, p in enumerate(group):
        p['slug'] = slug if i == 0 else f"{slug}-{p['zips'][0]}"

out = []
for p in sorted(places.values(), key=lambda p: (p['zips'][0], p['slug'])):
    others = {k: v for k, v in p['names'].items() if v and v != p['name']}
    out.append([p['slug'], p['name'], ' '.join(sorted(p['zips'])), p['lat'], p['lng'], p['region'], others or 0, int(p['main'])])

slugs = [o[0] for o in out]
assert len(slugs) == len(set(slugs)), 'duplicate slugs'
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(o, ensure_ascii=False, separators=(',', ':')) for o in out) + '\n]\n')
print(f'{len(out)} places from {len(rows)} postal rows → {OUT}')
