/**
 * Migrate normal saved reports from RTDB to morgue-api.
 *
 * Default: dry-run. Use --apply to write to the VPS. This intentionally does
 * not touch scheduledReports or scheduledReportsBBCode because those remain the
 * Discord bot deployment queue.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { firstApiKey } from '../services/apiKeyUtil.js';

function loadEnvFile(path) {
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const split = trimmed.indexOf('=');
        if (split < 1) continue;
        const key = trimmed.slice(0, split).trim();
        const value = trimmed.slice(split + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), '../functions/.env'));

const apply = process.argv.includes('--apply');
const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://gtaw-forms-default-rtdb.europe-west1.firebasedatabase.app';
const apiURL = (process.env.MORGUE_API_URL || 'http://88.208.243.254').replace(/\/$/, '');
const apiKey = process.env.MORGUE_API_KEY || firstApiKey(process.env.MORGUE_API_KEYS);
const keyPath = resolve(process.cwd(), process.env.FIREBASE_ADMIN_KEY_PATH || '../firebase-admin-key.json');

if (!apiKey && apply) throw new Error('MORGUE_API_KEY or MORGUE_API_KEYS is required for --apply.');

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount), databaseURL });
const db = getDatabase();

const readNode = async (path) => (await db.ref(path).once('value')).val() || {};
const normalize = (value) => value && typeof value === 'object' ? value : {};

const [legacy, modern, legacyBbCode, modernBbCode] = await Promise.all([
    readNode('savedReports'),
    readNode('newSavedReports'),
    readNode('savedReportBBCode'),
    readNode('newSavedReportBBCode'),
]);

const records = new Map();
const addPath = (root, bbRoot, source) => {
    for (const [author, reports] of Object.entries(normalize(root))) {
        for (const [key, report] of Object.entries(normalize(reports))) {
            if (!report || typeof report !== 'object') continue;
            const bbCode = normalize(bbRoot[author])[key]?.bbCode || report.bbCode || '';
            const id = `${author}/${key}`;
            // Prefer modern records when the same Firebase key exists in both
            // legacy and modern storage.
            if (records.has(id) && source === 'legacy') continue;
            records.set(id, { author, key, report: { ...report, bbCode: undefined }, bbCode, source });
        }
    }
};
addPath(legacy, legacyBbCode, 'legacy');
addPath(modern, modernBbCode, 'modern');

let bytes = 0;
for (const item of records.values()) bytes += Buffer.byteLength(JSON.stringify(item), 'utf8');
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', records: records.size, approximateBytes: bytes, sources: {
    legacy: [...records.values()].filter(r => r.source === 'legacy').length,
    modern: [...records.values()].filter(r => r.source === 'modern').length,
} }));

if (!apply) {
    console.log('Dry run only. Re-run with --apply to write records to morgue-api.');
    process.exit(0);
}

const items = [...records.values()];
const BATCH_SIZE = 50;
const MAX_BATCH_BYTES = 400_000;
const batches = [];
let currentBatch = [];
let currentBytes = 32;
for (const item of items) {
    const itemBytes = Buffer.byteLength(JSON.stringify(item), 'utf8');
    if (currentBatch.length > 0 && (currentBatch.length >= BATCH_SIZE || currentBytes + itemBytes > MAX_BATCH_BYTES)) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBytes = 32;
    }
    currentBatch.push(item);
    currentBytes += itemBytes;
}
if (currentBatch.length > 0) batches.push(currentBatch);

let migrated = 0;
for (const [batchIndex, batch] of batches.entries()) {
    let response;
    for (;;) {
        response = await fetch(`${apiURL}/api/reports/bulk`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ reports: batch }),
        });
        if (response.status !== 429) break;
        await response.arrayBuffer();
        console.log('[MIGRATE] API rate limit reached; waiting 61 seconds...');
        await new Promise(resolve => setTimeout(resolve, 61_000));
    }
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Migration failed for batch ${batchIndex + 1}/${batches.length}: HTTP ${response.status} ${text.slice(0, 200)}`);
    }
    migrated += batch.length;
    if (migrated % 250 === 0 || migrated === records.size) {
        console.log(`[MIGRATE] ${migrated}/${records.size}`);
    }
}
console.log(JSON.stringify({ mode: 'apply', migrated, scheduledReportsTouched: false }));
