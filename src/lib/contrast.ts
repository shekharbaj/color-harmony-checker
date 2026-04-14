import chroma from "chroma-js";

export function getContrastRatio(bg: string, fg: string): number {
  try {
    const l1 = chroma(bg).luminance();
    const l2 = chroma(fg).luminance();
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1;
  }
}

export interface WCAGResult {
  ratio: number;
  aa: { normalText: boolean; largeText: boolean };
  aaa: { normalText: boolean; largeText: boolean };
}

export function checkWCAG(bg: string, fg: string): WCAGResult {
  const ratio = getContrastRatio(bg, fg);
  return {
    ratio,
    aa: { normalText: ratio >= 4.5, largeText: ratio >= 3 },
    aaa: { normalText: ratio >= 7, largeText: ratio >= 4.5 },
  };
}

export interface FixResult {
  hex: string;
  originalL: number;
  newL: number;
  deltaL: number;
  direction: "lighter" | "darker";
  achieved: boolean;
}

export function fixForeground(bg: string, fg: string, targetRatio = 4.5): string {
  return fixForegroundDetailed(bg, fg, targetRatio).hex;
}

export function fixForegroundDetailed(bg: string, fg: string, targetRatio = 4.5): FixResult {
  try {
    const bgColor = chroma(bg);
    const fgColor = chroma(fg);
    const [h, s, l] = fgColor.hsl();
    const safeH = isNaN(h) ? 0 : h;
    const safeS = isNaN(s) ? 0 : s;
    const safeL = isNaN(l) ? 0.5 : l;
    const bgL = bgColor.luminance();
    const fgL = fgColor.luminance();

    // Direction: if fg is lighter than bg, go lighter; else go darker
    const shouldLighten = fgL >= bgL;
    const step = 0.01; // 1% increments

    let currentL = safeL;
    for (let i = 0; i < 100; i++) {
      const candidate = chroma.hsl(safeH, safeS, currentL);
      const ratio = getContrastRatio(bg, candidate.hex());
      if (ratio >= targetRatio) {
        return {
          hex: candidate.hex(),
          originalL: Math.round(safeL * 100),
          newL: Math.round(currentL * 100),
          deltaL: Math.round((currentL - safeL) * 100),
          direction: shouldLighten ? "lighter" : "darker",
          achieved: true,
        };
      }
      currentL = shouldLighten ? currentL + step : currentL - step;
      currentL = Math.max(0, Math.min(1, currentL));
      // If we hit the boundary without finding a solution, break
      if ((shouldLighten && currentL >= 1) || (!shouldLighten && currentL <= 0)) break;
    }

    // Fallback: try the opposite direction
    currentL = safeL;
    const fallbackLighten = !shouldLighten;
    for (let i = 0; i < 100; i++) {
      currentL = fallbackLighten ? currentL + step : currentL - step;
      currentL = Math.max(0, Math.min(1, currentL));
      const candidate = chroma.hsl(safeH, safeS, currentL);
      const ratio = getContrastRatio(bg, candidate.hex());
      if (ratio >= targetRatio) {
        return {
          hex: candidate.hex(),
          originalL: Math.round(safeL * 100),
          newL: Math.round(currentL * 100),
          deltaL: Math.round((currentL - safeL) * 100),
          direction: fallbackLighten ? "lighter" : "darker",
          achieved: true,
        };
      }
    }

    return {
      hex: fg,
      originalL: Math.round(safeL * 100),
      newL: Math.round(safeL * 100),
      deltaL: 0,
      direction: shouldLighten ? "lighter" : "darker",
      achieved: false,
    };
  } catch {
    return { hex: fg, originalL: 50, newL: 50, deltaL: 0, direction: "darker", achieved: false };
  }
}

export function toHex(color: string): string {
  try {
    return chroma(color).hex();
  } catch {
    return color;
  }
}

export function toRgb(color: string): string {
  try {
    const [r, g, b] = chroma(color).rgb();
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return color;
  }
}

export function toHsl(color: string): string {
  try {
    const [h, s, l] = chroma(color).hsl();
    return `hsl(${Math.round(isNaN(h) ? 0 : h)}, ${Math.round((isNaN(s) ? 0 : s) * 100)}%, ${Math.round((isNaN(l) ? 0 : l) * 100)}%)`;
  } catch {
    return color;
  }
}

export function isValidColor(color: string): boolean {
  try {
    chroma(color);
    return true;
  } catch {
    return false;
  }
}
