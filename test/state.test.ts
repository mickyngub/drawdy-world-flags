import assert from "node:assert/strict";
import { test } from "node:test";
import { readState } from "../src/index";

const DEFAULT_OPTIONS = { size: 64, style: "round", label: true };

test("readState falls back to the defaults, round with labels on", () => {
    const empty = { recent: [], options: DEFAULT_OPTIONS };
    assert.deepEqual(readState(undefined), empty);
    assert.deepEqual(readState({}), empty);
});

test("readState keeps valid values, and a stored false label wins", () => {
    const options = { size: 256, style: "rectangle", label: false };
    const recent = [
        { code: "th", title: "Thailand" },
        { code: "gb-sct", title: "Scotland" },
    ];
    assert.deepEqual(readState({ recent, options }), { recent, options });
    assert.equal(
        readState({ options: { style: "square" } }).options.style,
        "square"
    );
});

test("readState rejects a bad size, style and label", () => {
    const state = readState({
        options: { size: 100, style: "wavy", label: "false" },
    });
    assert.deepEqual(state.options, DEFAULT_OPTIONS);
});

test("readState drops odd recent entries and duplicates, and keeps 12", () => {
    const kept = { code: "br", title: "Brazil" };
    const state = readState({
        recent: [
            { prefix: "circle-flags", name: "th", title: "Thailand" },
            { code: "TH", title: "Thailand" },
            { code: "th-4x3", title: "Thailand" },
            { code: "../x", title: "x" },
            { code: "br" },
            kept,
            { code: "br", title: "Brazil again" },
        ],
    });
    assert.deepEqual(state.recent, [kept]);
    const codes = "ab ac ad ae af ag ah ai aj ak al am an ao".split(" ");
    const many = codes.map((code) => ({ code, title: code }));
    assert.equal(readState({ recent: many }).recent.length, 12);
});
