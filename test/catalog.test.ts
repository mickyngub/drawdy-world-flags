import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
// @ts-expect-error plain JS
import * as catalogScript from "../scripts/build-catalog.mjs";
// @ts-expect-error plain JS
import * as flagData from "../scripts/flag-data.mjs";
import { CATEGORIES, ICONS } from "../src/catalog";

const pkg = (prefix: string) =>
    JSON.parse(
        readFileSync(
            new URL(
                `../node_modules/@iconify-json/${prefix}/icons.json`,
                import.meta.url
            ),
            "utf8"
        )
    );
const { buildCatalog, candidates } = catalogScript;
const { FLAGS } = flagData;
const round = pkg("circle-flags");
const squared = pkg("flag");
const served = (data: { icons: object; aliases?: object }, name: string) =>
    Object.hasOwn(data.icons, name) || Object.hasOwn(data.aliases ?? {}, name);

test("the committed catalog matches the flag table and the pinned packages", () => {
    const built = buildCatalog(round, squared, FLAGS);
    assert.deepEqual(built.icons, ICONS, "run npm run catalog");
    assert.deepEqual(built.categories, CATEGORIES, "run npm run catalog");
    assert.deepEqual(built.dropped, []);
});

test("a flag drawn by every set but missing from the table stops the build", () => {
    const { th: _th, ...withoutThailand } = FLAGS;
    assert.throws(
        () => buildCatalog(round, squared, withoutThailand),
        /no entry for th/
    );
});

test("language flags that circle-flags draws under two letters are not candidates", () => {
    const codes = candidates(round, squared);
    for (const language of ["en", "ja", "zh", "hi"]) {
        assert.ok(served(round, language), `${language} should exist upstream`);
        assert.ok(!codes.includes(language), `${language} is a candidate`);
    }
});

test("every listed flag is drawn round, 4:3 and square, once", () => {
    const seen = new Set<string>();
    for (const { name, title } of ICONS) {
        assert.ok(!seen.has(name), `${name} is listed twice`);
        seen.add(name);
        assert.ok(title.length > 0, name);
        assert.ok(served(round, name), `circle-flags:${name}`);
        assert.ok(served(squared, `${name}-4x3`), `flag:${name}-4x3`);
        assert.ok(served(squared, `${name}-1x1`), `flag:${name}-1x1`);
    }
});

test("every region has flags, and every flag sits in exactly one region", () => {
    const counted = new Map<string, number>();
    for (const group of CATEGORIES) {
        assert.ok(group.names.length > 0, `${group.id} is empty`);
        for (const name of group.names) {
            counted.set(name, (counted.get(name) ?? 0) + 1);
        }
    }
    assert.deepEqual(
        CATEGORIES.map((group) => group.id),
        ["africa", "americas", "asia", "europe", "oceania", "more"]
    );
    for (const { name } of ICONS) assert.equal(counted.get(name), 1, name);
});

test("England, Scotland and Wales are listed beside the United Kingdom in Europe", () => {
    const europe = CATEGORIES.find((group) => group.id === "europe")!;
    for (const code of ["gb", "gb-eng", "gb-sct", "gb-wls", "gb-nir"]) {
        assert.ok(europe.names.includes(code), code);
    }
});
