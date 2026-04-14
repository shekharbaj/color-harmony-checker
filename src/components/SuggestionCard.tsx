import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fixForegroundDetailed, type FixResult, checkWCAG } from "@/lib/contrast";

interface SuggestionCardProps {
  bg: string;
  fg: string;
  onApply: (hex: string) => void;
}

function SuggestionRow({
  label,
  targetRatio,
  bg,
  fg,
  currentlyPasses,
  onApply,
}: {
  label: string;
  targetRatio: number;
  bg: string;
  fg: string;
  currentlyPasses: boolean;
  onApply: (hex: string) => void;
}) {
  const fix = useMemo<FixResult>(
    () => fixForegroundDetailed(bg, fg, targetRatio),
    [bg, fg, targetRatio]
  );

  if (currentlyPasses) return null;

  const newResult = checkWCAG(bg, fix.hex);
  const newRatio = newResult.ratio;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-lg border border-border bg-card p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {fix.achieved ? (
          <Badge className="gap-1 bg-success text-success-foreground text-xs hover:bg-success">
            {newRatio.toFixed(2)}:1
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            No fix found
          </Badge>
        )}
      </div>

      {fix.achieved && (
        <div className="flex items-center gap-3">
          {/* Current color */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-8 w-8 rounded-md border border-border"
              style={{ backgroundColor: fg }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              {fg}
            </span>
          </div>

          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

          {/* Suggested color */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-8 w-8 rounded-md border border-border"
              style={{ backgroundColor: fix.hex }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              {fix.hex}
            </span>
          </div>

          {/* Delta feedback */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {fix.deltaL > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                L {fix.deltaL > 0 ? "+" : ""}
                {fix.deltaL}%
              </span>
            </div>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onApply(fix.hex)}
            >
              <Wand2 className="h-3 w-3" />
              Apply
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function SuggestionCard({ bg, fg, onApply }: SuggestionCardProps) {
  const result = checkWCAG(bg, fg);
  const hasIssues = !result.aa.normalText || !result.aaa.normalText;

  if (!hasIssues) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Smart Suggestions
      </p>
      <AnimatePresence mode="sync">
        {!result.aa.normalText && (
          <SuggestionRow
            key="aa"
            label="Fix to AA (≥4.5:1)"
            targetRatio={4.51}
            bg={bg}
            fg={fg}
            currentlyPasses={result.aa.normalText}
            onApply={onApply}
          />
        )}
        {!result.aaa.normalText && (
          <SuggestionRow
            key="aaa"
            label="Fix to AAA (≥7:1)"
            targetRatio={7.01}
            bg={bg}
            fg={fg}
            currentlyPasses={result.aaa.normalText}
            onApply={onApply}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
