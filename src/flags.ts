import type { IconRef, Style } from "./shared/messages";
import { ROUND_PREFIX, SQUARED_PREFIX } from "./sources";

const SHAPE_SUFFIX = /-(4x3|1x1)$/;

export const FLAG_CODE = /^[a-z]{2}(-[a-z]{2,3})?$/;

export function flagRef(code: string, title: string, style: Style): IconRef {
    if (style === "round") return { prefix: ROUND_PREFIX, name: code, title };
    const shape = style === "rectangle" ? "4x3" : "1x1";
    return { prefix: SQUARED_PREFIX, name: `${code}-${shape}`, title };
}

export function flagCode(ref: IconRef): string {
    return ref.prefix === SQUARED_PREFIX
        ? ref.name.replace(SHAPE_SUFFIX, "")
        : ref.name;
}
