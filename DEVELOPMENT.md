# Developing World Flags

```bash
npm install
npm test
npm run typecheck
npm run check-catalog  # does Iconify still serve every flag in all three shapes?
npm run dev            # Tailwind watcher plus the dev server on :5203; in Drawdy run ⌘K → "Add extension dev server" on a local board
npm run build          # regenerates src/catalog-data.ts, src/panel-css.ts, src/webview-html.ts and dist/*.drawdyx
npm run preflight      # before submitting: committed, built, pushed, under Drawdy's limits, above the live version
```

Every flag's title, region and search nicknames live in `scripts/flag-data.mjs`, kept by hand so titles do not change with the Node or ICU version that runs the build. `scripts/build-catalog.mjs` joins that table with the pinned `@iconify-json/circle-flags` and `@iconify-json/flag` packages and writes `src/catalog-data.ts`. It fails when a country flag drawn by both sets has no row in the table (add one), and leaves out, with a note, a row whose flag one of the sets no longer draws. The palette fetches each SVG from the Iconify API as it scrolls into view.

Drawdy builds published versions from this repository's `src/index.ts` and runs no build step, so commit the generated `src/catalog-data.ts`, `src/panel-css.ts` and `src/webview-html.ts` after `npm run build`. The panel is styled with Tailwind CSS v4 utilities: `webview/panel.css` maps Drawdy's theme variables onto Tailwind colours, so the panel follows the board's light and dark themes.

Bump `driverVersion` in `manifest.json` for every release and add it to `CHANGELOG.md`. `npm test` holds the manifest and listing files to Drawdy's submission rules (a description of at most 500 characters, an icon of at most 256 KB, only `@drawdy/driver-protocol` imported from outside the repository), checks that the committed catalog matches the table and the pinned packages, and tests the code and nickname search, the flag shapes, the SVG finishing, the Iconify batching, the click layout and the saved-state checks.
