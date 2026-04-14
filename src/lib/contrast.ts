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

export function fixForeground(bg: string, fg: string, targetRatio = 4.5): string {
  try {
    const bgColor = chroma(bg);
    let fgColor = chroma(fg);
    const bgLum = bgColor.luminance();

    // Try adjusting lightness in the right direction
    const fgLum = fgColor.luminance();
    const shouldDarken = bgLum > 0.5;

    for (let i = 0; i < 100; i++) {
      const currentRatio = getContrastRatio(bg, fgColor.hex());
      if (currentRatio >= targetRatio) return fgColor.hex();

      const [h, s, l] = fgColor.hsl();
      const step = shouldDarken ? -0.01 : 0.01;
      const newL = Math.max(0, Math.min(1, (isNaN(l) ? 0.5 : l) + step));
      fgColor = chroma.hsl(isNaN(h) ? 0 : h, isNaN(s) ? 0 : s, newL);
    }
    return fgColor.hex();
  } catch {
    return fg;
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
