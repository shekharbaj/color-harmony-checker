import { useMemo } from "react";
import chroma from "chroma-js";
import { getContrastRatio } from "@/lib/contrast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ContrastMapProps {
  bg: string;
  fg: string;
  onSelectFg: (color: string) => void;
}

const STEPS = 11;

export function ContrastMap({ bg, fg, onSelectFg }: ContrastMapProps) {
  const grid = useMemo(() => {
    try {
      const fgColor = chroma(fg);
      const [h, s] = fgColor.hsl();
      const safeH = isNaN(h) ? 0 : h;
      const safeS = isNaN(s) ? 0 : s;

      const rows: { color: string; ratio: number; lightness: number; saturation: number }[][] = [];

      for (let si = 0; si < STEPS; si++) {
        const row: typeof rows[0] = [];
        const sat = si / (STEPS - 1); // 0 to 1
        for (let li = 0; li < STEPS; li++) {
          const light = li / (STEPS - 1); // 0 to 1
          const c = chroma.hsl(safeH, sat, light);
          const hex = c.hex();
          const ratio = getContrastRatio(bg, hex);
          row.push({ color: hex, ratio, lightness: light, saturation: sat });
        }
        rows.push(row);
      }

      return rows;
    } catch {
      return [];
    }
  }, [bg, fg]);

  const currentRatio = getContrastRatio(bg, fg);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Contrast Map
        </p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            ≥4.5:1
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
            ≥3:1
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20" style={{ backgroundColor: "hsl(0, 72%, 51%)" }} />
            Fail
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col">
          {grid.map((row, si) => (
            <div key={si} className="flex">
              {row.map((cell, li) => {
                const isPass = cell.ratio >= 4.5;
                const isLargePass = cell.ratio >= 3;
                const isCurrent = chroma(fg).hex() === cell.color;

                return (
                  <Tooltip key={li}>
                    <TooltipTrigger asChild>
                      <button
                        className="relative flex-1 aspect-square transition-transform hover:scale-125 hover:z-10"
                        style={{ backgroundColor: cell.color }}
                        onClick={() => onSelectFg(cell.color)}
                      >
                        {isCurrent && (
                          <span className="absolute inset-0 border-2 border-foreground rounded-sm" />
                        )}
                        {isPass && (
                          <span className="absolute bottom-0 right-0 h-1 w-1 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-mono text-xs">
                      <p>{cell.color}</p>
                      <p className={isPass ? "text-green-500" : isLargePass ? "text-yellow-500" : "text-red-500"}>
                        {cell.ratio.toFixed(1)}:1
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5">
          <span className="text-[10px] text-muted-foreground">← Dark</span>
          <span className="text-[10px] font-medium text-muted-foreground">Lightness →</span>
          <span className="text-[10px] text-muted-foreground">Light →</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Rows = saturation (top=0%, bottom=100%). Click any cell to apply that foreground color.
      </p>
    </div>
  );
}
