/**
 * Remove duplicate VPS report files created by an interrupted migration.
 * Default is dry-run; --apply keeps the newest file for each author/key pair.
 */
import { readFileSync, readdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const apply = process.argv.includes('--apply');
const root = resolve(process.cwd(), 'data', 'saved-reports');
const groups = new Map();

if (existsSync(root)) {
    for (const author of readdirSync(root)) {
        const dir = join(root, author);
        if (!existsSync(dir)) continue;
        for (const file of readdirSync(dir)) {
            if (!file.endsWith('.json')) continue;
            const path = join(dir, file);
            try {
                const payload = JSON.parse(readFileSync(path, 'utf8'));
                const id = `${payload.author || author}/${payload.key || file}`;
                const item = { path, mtime: statSync(path).mtimeMs };
                if (!groups.has(id)) groups.set(id, []);
                groups.get(id).push(item);
            } catch { /* invalid files are handled by the maintenance check */ }
        }
    }
}

let duplicateFiles = 0;
let removedFiles = 0;
for (const files of groups.values()) {
    if (files.length < 2) continue;
    duplicateFiles += files.length - 1;
    files.sort((a, b) => b.mtime - a.mtime);
    if (apply) {
        for (const stale of files.slice(1)) {
            rmSync(stale.path, { force: true });
            removedFiles++;
        }
    }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', duplicateFiles, removedFiles }));
