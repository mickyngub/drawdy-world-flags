import assert from "node:assert/strict";
import { test } from "node:test";
import { ICONS } from "../src/catalog";
import { rank, searchEntry, searchTerms } from "../src/search";

const POOL = ICONS.map(searchEntry);
const codes = (query: string) =>
    rank(POOL, searchTerms(query)).map((entry) => entry.icon.name);

test("an exact country code ranks that country first", () => {
    assert.equal(codes("th")[0], "th");
    assert.equal(codes("us")[0], "us");
    assert.equal(codes("gb")[0], "gb");
});

test("a nickname ranks its country first, ahead of titles that start the same", () => {
    assert.equal(codes("holland")[0], "nl");
    assert.equal(codes("uk")[0], "gb");
    assert.ok(codes("uk").includes("ua"), "Ukraine still matches uk");
    assert.equal(codes("korea")[0], "kr");
    assert.equal(codes("burma")[0], "mm");
});

test("names without accents find accented titles", () => {
    assert.equal(codes("turkiye")[0], "tr");
    assert.equal(codes("curacao")[0], "cw");
    assert.equal(codes("ivory coast")[0], "ci");
});

test("a title prefix finds the country and every term must match", () => {
    assert.equal(codes("thai")[0], "th");
    assert.deepEqual(codes("new zealand"), ["nz"]);
    assert.deepEqual(codes("japan brazil"), []);
});

test("search terms are trimmed, lower-cased and split on spaces", () => {
    assert.deepEqual(searchTerms("  Great   BRITAIN "), ["great", "britain"]);
    assert.deepEqual(searchTerms("   "), []);
});
