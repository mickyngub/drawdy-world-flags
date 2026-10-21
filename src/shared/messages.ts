export type IconRef = {
    prefix: string;
    name: string;
    title: string;
};

export type IconPick = IconRef & { svg: string };

export type RecentFlag = {
    code: string;
    title: string;
};

export type IconSize = 32 | 64 | 128 | 256;

export type Style = "round" | "rectangle" | "square";

export type PlaceOptions = {
    size: IconSize;
    style: Style;
    label: boolean;
};

export type PersistedState = {
    recent: RecentFlag[];
    options: PlaceOptions;
};

export type WebviewToDriver =
    | { type: "ready" }
    | { type: "drop-icon"; icon: IconPick; x: number; y: number }
    | { type: "insert-icon"; icon: IconPick }
    | { type: "persist"; recent: RecentFlag[]; options: PlaceOptions };

export type DriverToWebview =
    | { type: "init"; recent: RecentFlag[]; options: PlaceOptions }
    | { type: "theme"; cssVars: string };
