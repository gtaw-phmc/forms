/** Sync small RTDB reference datasets to the VPS local cache. */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

function loadEnv(path) {
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const value = line.trim();
        const split = value.indexOf('=');
        if (!value || value.startsWith('#') || split < 1) continue;
        const key = value.slice(0, split).trim();
        if (!process.env[key]) process.env[key] = value.slice(split + 1).trim();
    }
}

loadEnv(resolve(process.cwd(), '.env'));
const keyPath = resolve(process.cwd(), process.env.FIREBASE_ADMIN_KEY_PATH || '../firebase-admin-key.json');
const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://gtaw-forms-default-rtdb.europe-west1.firebasedatabase.app';
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))), databaseURL });
const db = getDatabase();
const outDir = resolve(process.cwd(), 'data', 'reference');
mkdirSync(outDir, { recursive: true });

for (const dataset of ['agencies', 'locationData', 'verified_locations']) {
    const value = (await db.ref(dataset).once('value')).val() || {};
    const target = join(outDir, `${dataset}.json`);
    const temp = `${target}.tmp-${process.pid}`;
    writeFileSync(temp, JSON.stringify(value), 'utf8');
    renameSync(temp, target);
}
console.log(JSON.stringify({ synced: ['agencies', 'locationData', 'verified_locations'] }));
