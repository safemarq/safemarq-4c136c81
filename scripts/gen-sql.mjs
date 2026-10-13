// Generates the SQL that mirrors the site's taxonomy and postal code list.
//   node --experimental-strip-types scripts/gen-sql.mjs taxonomy > file.sql
//   node --experimental-strip-types scripts/gen-sql.mjs postal   > file.sql
import { readFileSync } from 'node:fs';

const what = process.argv[2];
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

if (what === 'taxonomy') {
  const tx = await import('../src/lib/taxonomy.ts');
  const fr = (await import('../src/i18n/locales/fr.ts')).default;
  const out = [];
  out.push('insert into public.vehicle_categories (slug, position) values');
  out.push(tx.VEHICLES.map((v, i) => `  (${q(v)}, ${i + 1})`).join(',\n'));
  out.push('on conflict (slug) do update set position = excluded.position;\n');
  out.push('insert into public.trades (slug, group_id, label_fr, position) values');
  out.push(tx.TRADES.map((t, i) => `  (${q(t)}, ${q(tx.TRADE_GROUP[t])}, ${q(fr.trades[t])}, ${i + 1})`).join(',\n'));
  out.push('on conflict (slug) do update set group_id = excluded.group_id, label_fr = excluded.label_fr, position = excluded.position;\n');
  out.push('insert into public.vehicle_trades (vehicle, trade) values');
  const pairs = tx.VEHICLES.flatMap((v) => tx.VEHICLE_TRADES[v].map((t) => `  (${q(v)}, ${q(t)})`));
  out.push(pairs.join(',\n'));
  out.push('on conflict do nothing;');
  console.log(out.join('\n'));
} else if (what === 'postal') {
  // One row per postal code: the mean position of its localities.
  const rows = JSON.parse(readFileSync(new URL('../src/data/be-places.json', import.meta.url), 'utf8'));
  const byZip = new Map();
  for (const [, name, zips, lat, lng, region, , main] of rows) {
    for (const zip of zips.split(' ')) {
      const z = byZip.get(zip) ?? { names: [], lat: 0, lng: 0, n: 0, region };
      if (main) z.names.unshift(name);
      else z.names.push(name);
      z.lat += lat;
      z.lng += lng;
      z.n += 1;
      byZip.set(zip, z);
    }
  }
  const data = [...byZip].sort(([a], [b]) => a.localeCompare(b)).map(([zip, z]) => [
    zip,
    z.names[0],
    z.region,
    +(z.lng / z.n).toFixed(4),
    +(z.lat / z.n).toFixed(4),
  ]);
  console.log('insert into public.be_postal_codes (postal_code, name, region, location)');
  console.log("select r->>0, r->>1, r->>2, extensions.st_setsrid(extensions.st_makepoint((r->>3)::float8, (r->>4)::float8), 4326)::extensions.geography");
  console.log(`from jsonb_array_elements(${q(JSON.stringify(data))}::jsonb) as r`);
  console.log('on conflict (postal_code) do update set name = excluded.name, region = excluded.region, location = excluded.location;');
} else {
  console.error('usage: gen-sql.mjs taxonomy|postal');
  process.exit(1);
}
