import { ICONS } from "../src/catalog-data.ts";
import { ICONIFY_HOST, ROUND_PREFIX, SQUARED_PREFIX } from "../src/sources.ts";

// The catalog is built from pinned packages, but the palette fetches the
// SVGs from Iconify's live API, which can rename or drop a flag.
const NAMES = {
    [ROUND_PREFIX]: (code) => [code],
    [SQUARED_PREFIX]: (code) => [`${code}-4x3`, `${code}-1x1`],
};
let missing = 0;
for (const [prefix, namesFor] of Object.entries(NAMES)) {
    const res = await fetch(`${ICONIFY_HOST}/collection?prefix=${prefix}`);
    if (!res.ok) {
        console.error(`Iconify ${prefix}: HTTP ${res.status}`);
        process.exit(2);
    }
    const data = await res.json();
    const served = new Set([
        ...(data.uncategorized ?? []),
        ...Object.values(data.categories ?? {}).flat(),
        ...(data.hidden ?? []),
        ...Object.keys(data.aliases ?? {}),
    ]);
    for (const { name } of ICONS) {
        for (const icon of namesFor(name)) {
            if (served.has(icon)) continue;
            console.log(`✗ ${prefix}:${icon} is no longer served by Iconify`);
            missing++;
        }
    }
}
if (missing > 0) process.exit(1);
console.log(`✓ Iconify serves all ${ICONS.length} flags in every shape.`);
