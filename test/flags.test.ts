import assert from "node:assert/strict";
import { test } from "node:test";
import { FLAG_CODE, flagCode, flagRef } from "../src/flags";

test("flagRef picks the set and the shape for each style", () => {
    assert.deepEqual(flagRef("th", "Thailand", "round"), {
        prefix: "circle-flags",
        name: "th",
        title: "Thailand",
    });
    assert.deepEqual(flagRef("th", "Thailand", "rectangle"), {
        prefix: "flag",
        name: "th-4x3",
        title: "Thailand",
    });
    assert.deepEqual(flagRef("gb-sct", "Scotland", "square"), {
        prefix: "flag",
        name: "gb-sct-1x1",
        title: "Scotland",
    });
});

test("flagCode gives back the bare code from every style", () => {
    for (const style of ["round", "rectangle", "square"] as const) {
        assert.equal(flagCode(flagRef("gb-eng", "England", style)), "gb-eng");
        assert.equal(flagCode(flagRef("br", "Brazil", style)), "br");
    }
});

test("FLAG_CODE takes country and subdivision codes only", () => {
    for (const code of ["th", "gb-eng", "es-ct"]) assert.match(code, FLAG_CODE);
    for (const code of ["TH", "th-4x3", "../x", "thailand", "t"]) {
        assert.doesNotMatch(code, FLAG_CODE);
    }
});
