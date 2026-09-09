#!/usr/bin/env node
/**
 * list-visible-channels.mjs — show every guild + channel the bot can see.
 *
 * Read-only mapping helper for the webhook→bot migration. Uses the Discord
 * REST API directly (no gateway, no privileged intents). The bot token is
 * read from the local .env and used ONLY in the Authorization header — it is
 * never printed. Output is names + IDs (IDs are safe to commit).
 *
 * Usage (on the VPS, from discord-bot/):
 *   node debug-testing-scripts/list-visible-channels.mjs [guild-name-filter]
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(HERE, '../.env');

const TYPE_LABELS = {
    0: 'text', 2: 'voice', 4: 'category', 5: 'announcement',
    10: 'thread', 11: 'thread', 12: 'thread', 13: 'stage',
    14: 'directory', 15: 'forum', 16: 'media',
};

function loadToken() {
    if (!existsSync(ENV_PATH)) {
        console.error(`[CHANNELS] No .env at ${ENV_PATH}`);
        process.exit(1);
    }
    const m = readFileSync(ENV_PATH, 'utf8').match(/^DISCORD_BOT_TOKEN=(.+)$/m);
    const token = m?.[1]?.trim().replace(/^["']|["']$/g, '');
    if (!token) {
        console.error('[CHANNELS] DISCORD_BOT_TOKEN not set in .env');
        process.exit(1);
    }
    return token;
}

async function api(token, path) {
    const res = await fetch(`https://discord.com/api/v10${path}`, {
        headers: { Authorization: `Bot ${token}` },
    });
    if (!res.ok) {
        console.error(`[CHANNELS] GET ${path} -> HTTP ${res.status}`);
        process.exit(1);
    }
    return res.json();
}

const token = loadToken();
const filter = (process.argv[2] || '').toLowerCase();

const me = await api(token, '/users/@me');
console.log(`Bot: ${me.username} (${me.id})\n`);

const guilds = await api(token, '/users/@me/guilds');
for (const g of guilds) {
    if (filter && !g.name.toLowerCase().includes(filter)) continue;
    console.log(`GUILD ${g.name} (${g.id})`);
    let channels;
    try {
        channels = await api(token, `/guilds/${g.id}/channels`);
    } catch {
        console.log('  (no channel access)');
        continue;
    }
    // Categories first, then children grouped beneath (best-effort by position)
    channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (const c of channels) {
        const label = TYPE_LABELS[c.type] ?? `type${c.type}`;
        const parent = c.parent_id ? ` parent=${c.parent_id}` : '';
        console.log(`  [${label}] #${c.name} (${c.id})${parent}`);
    }
    console.log('');
}
