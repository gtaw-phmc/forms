/**
 * Read-only VPS report maintenance check.
 * Finds likely duplicates and stale reports without deleting anything.
 * Intended to run from the VPS on a daily timer after the report migration.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'data', 'saved-reports');
const OUTPUT_DIR = resolve(process.cwd(), 'data', 'maintenance');
const RETENTION_DAYS = Number(process.env.REPORT_RETENTION_DAYS || 365);
const DUPLICATE_WINDOW_MS = 6 * 60 * 60 * 1000;

const reports = [];
if (existsSync(REPORTS_DIR)) {
    for (const author of readdirSync(REPORTS_DIR)) {
        const authorDir = join(REPORTS_DIR, author);
        if (!existsSync(authorDir)) continue;
        for (const file of readdirSync(authorDir).filter(name => name.endsWith('.json'))) {
            try {
                const payload = JSON.parse(readFileSync(join(authorDir, file), 'utf8'));
                const report = payload.report || {};
                const data = report.data || {};
                reports.push({
                    author,
                    key: file.slice(0, -5),
                    timestamp: Number(report.timestamp || payload.savedAt || 0),
                    formId: report.formId || '',
                    originalKey: report.originalKey || '',
                    decedentName: data.decedentName || '',
                    decedentOOC: data.decedentOOC || '',
                });
            } catch (err) {
                console.warn(`[MAINTENANCE] Invalid report file ${author}/${file}: ${err.message}`);
            }
        }
    }
}

const duplicateGroups = new Map();
for (const report of reports) {
    const subject = report.decedentName || report.decedentOOC;
    const fingerprint = subject
        ? `${report.formId}|${report.decedentName}|${report.decedentOOC}|${report.timestamp ? new Date(report.timestamp).toISOString().slice(0, 10) : ''}`
        : `${report.formId}|${report.originalKey}`;
    if (!duplicateGroups.has(fingerprint)) duplicateGroups.set(fingerprint, []);
    duplicateGroups.get(fingerprint).push(report);
}

const duplicates = [...duplicateGroups.values()]
    .filter(group => group.length > 1)
    .filter(group => Math.max(...group.map(r => r.timestamp || 0)) - Math.min(...group.map(r => r.timestamp || 0)) <= DUPLICATE_WINDOW_MS);
const staleBefore = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
const staleCount = reports.filter(r => r.timestamp > 0 && r.timestamp < staleBefore).length;
const summary = {
    generatedAt: new Date().toISOString(),
    reportCount: reports.length,
    duplicateGroupCount: duplicates.length,
    duplicateCandidateCount: duplicates.reduce((sum, group) => sum + group.length, 0),
    staleReportCount: staleCount,
    retentionDays: RETENTION_DAYS,
    readOnly: true,
    duplicateGroups: duplicates.map(group => group.map(({ author, key, timestamp, formId, originalKey }) => ({ author, key, timestamp, formId, originalKey }))),
};

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, 'latest-report-check.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify({
    reportCount: summary.reportCount,
    duplicateGroupCount: summary.duplicateGroupCount,
    staleReportCount: summary.staleReportCount,
    output: 'data/maintenance/latest-report-check.json',
}));
