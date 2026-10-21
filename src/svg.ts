export type SvgOptions = {
    size: number;
    // Paint values (lower-case) mapped to the colour that replaces them.
    recolor: Record<string, string>;
};

export type FinishedSvg = {
    svg: string;
    width: number;
    height: number;
};

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const PIXEL_LONG_SIDE = 512;
const DEFAULT_VIEW_BOX = "0 0 24 24";
const COMMENT = /<!--[\s\S]*?-->/g;
const SCRIPT = /<script[\s\S]*?<\/script>/gi;
const XML_DECLARATION = /<\?xml[\s\S]*?\?>/gi;
const DOCTYPE = /<!DOCTYPE[^>]*>/gi;
const EVENT_HANDLER = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi;
const ROOT_TAG = /<svg\b([^>]*)>/i;
const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const PAINT = /\b(fill|stroke|stop-color|color)=(["'])([^"']*)\2/gi;

function parseAttributes(raw: string): Map<string, string> {
    const attributes = new Map<string, string>();
    ATTRIBUTE.lastIndex = 0;
    let match = ATTRIBUTE.exec(raw);
    while (match !== null) {
        attributes.set(match[1], match[2] ?? match[3] ?? "");
        match = ATTRIBUTE.exec(raw);
    }
    return attributes;
}

function serializeAttributes(attributes: Map<string, string>): string {
    let out = "";
    for (const [key, value] of attributes) {
        out += ` ${key}="${value.replace(/"/g, "&quot;")}"`;
    }
    return out;
}

function parseViewBox(raw: string | undefined): [number, number] | null {
    if (raw === undefined) return null;
    const parts = raw
        .trim()
        .split(/[\s,]+/)
        .map(Number);
    if (parts.length !== 4 || !parts.every(Number.isFinite)) return null;
    const [, , width, height] = parts;
    return width > 0 && height > 0 ? [width, height] : null;
}

const round = (value: number): number => Math.round(value * 100) / 100;

export function cleanSvg(text: string): string {
    return text
        .replace(COMMENT, "")
        .replace(SCRIPT, "")
        .replace(XML_DECLARATION, "")
        .replace(DOCTYPE, "")
        .replace(EVENT_HANDLER, "")
        .trim();
}

export function recolorSvg(
    svg: string,
    recolor: Record<string, string>
): string {
    return svg.replace(
        PAINT,
        (whole, name: string, quote: string, value: string) => {
            const next = recolor[value.trim().toLowerCase()];
            return next === undefined
                ? whole
                : `${name}=${quote}${next}${quote}`;
        }
    );
}

export function finalizeIconSvg(
    svgText: string,
    options: SvgOptions
): FinishedSvg | null {
    if (typeof svgText !== "string" || svgText.length === 0) return null;
    const cleaned = cleanSvg(svgText);
    const root = ROOT_TAG.exec(cleaned);
    if (root === null) return null;

    const attributes = parseAttributes(root[1] ?? "");
    let viewBox = parseViewBox(attributes.get("viewBox"));
    if (viewBox === null) {
        attributes.set("viewBox", DEFAULT_VIEW_BOX);
        viewBox = [24, 24];
    }
    const [boxWidth, boxHeight] = viewBox;
    const longSide = Math.max(boxWidth, boxHeight);

    attributes.set("xmlns", SVG_NAMESPACE);
    attributes.set(
        "width",
        String(round((PIXEL_LONG_SIDE * boxWidth) / longSide))
    );
    attributes.set(
        "height",
        String(round((PIXEL_LONG_SIDE * boxHeight) / longSide))
    );

    const body = cleaned.slice(root.index + root[0].length);
    return {
        svg: recolorSvg(
            `<svg${serializeAttributes(attributes)}>${body}`,
            options.recolor
        ),
        width: (options.size * boxWidth) / longSide,
        height: (options.size * boxHeight) / longSide,
    };
}

export function toSvgDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
