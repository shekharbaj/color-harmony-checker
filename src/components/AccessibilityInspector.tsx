import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Wand2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  SunMoon,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  checkWCAG,
  fixForegroundDetailed,
  type WCAGResult,
  type FixResult,
} from "@/lib/contrast";

/* ── tiny status row ─────────────────────────────── */
function StatusRow({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {pass ? (
        <Badge className="h-5 gap-1 bg-success text-success-foreground text-[10px] hover:bg-success">
          <CheckCircle2 className="h-3 w-3" /> Pass
        </Badge>
      ) : (
        <Badge variant="destructive" className="h-5 gap-1 text-[10px]">
          <XCircle className="h-3 w-3" /> Fail
        </Badge>
      )}
    </div>
  );
}

/* ── fix suggestion row ──────────────────────────── */
function FixRow({
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
    [bg, fg, targetRatio],
  );

  if (currentlyPasses) return null;

  const newRatio = checkWCAG(bg, fix.hex).ratio;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-lg border border-border bg-muted/40 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {fix.achieved ? (
          <Badge className="h-5 gap-1 bg-success text-success-foreground text-[10px] hover:bg-success">
            {newRatio.toFixed(2)}:1
          </Badge>
        ) : (
          <Badge variant="destructive" className="h-5 text-[10px]">
            No fix
          </Badge>
        )}
      </div>

      {fix.achieved && (
        <div className="flex items-center gap-2">
          {/* before */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="h-7 w-7 rounded border border-border"
              style={{ backgroundColor: fg }}
            />
            <span className="font-mono text-[9px] text-muted-foreground">
              {fg}
            </span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          {/* after */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="h-7 w-7 rounded border border-border"
              style={{ backgroundColor: fix.hex }}
            />
            <span className="font-mono text-[9px] text-muted-foreground">
              {fix.hex}
            </span>
          </div>

          {/* delta + apply */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {fix.deltaL > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                L&nbsp;{fix.originalL}% → {fix.newL}%
              </span>
            </div>
            <Button
              size="sm"
              className="h-6 gap-1 px-2 text-[10px]"
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

/* ── main inspector ──────────────────────────────── */
interface AccessibilityInspectorProps {
  bg: string;
  fg: string;
  grayscale: boolean;
  onGrayscaleChange: (v: boolean) => void;
  onApply: (hex: string) => void;
}

export function AccessibilityInspector({
  bg,
  fg,
  grayscale,
  onGrayscaleChange,
  onApply,
}: AccessibilityInspectorProps) {
  const result: WCAGResult = checkWCAG(bg, fg);
  const allPass = result.aa.normalText && result.aaa.normalText;
  const severe = result.ratio < 3;

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-border bg-sidebar p-4">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Eye className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-none">Inspector</h2>
          <p className="text-[10px] text-muted-foreground">Accessibility fixes</p>
        </div>
      </div>

      {/* ratio */}
      <div className="mb-3 flex items-baseline justify-between">
        <motion.span
          key={result.ratio.toFixed(2)}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-mono text-3xl font-bold tracking-tight"
        >
          {result.ratio.toFixed(2)}
          <span className="text-base text-muted-foreground">:1</span>
        </motion.span>
        {severe ? (
          <Badge variant="destructive" className="text-[10px]">Critical</Badge>
        ) : allPass ? (
          <Badge className="bg-success text-success-foreground text-[10px] hover:bg-success">
            All Pass
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px]">Issues</Badge>
        )}
      </div>

      {/* color preview strip */}
      <div className="mb-4 flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Background</span>
          <div
            className="h-8 rounded border border-border"
            style={{ backgroundColor: bg }}
          />
          <span className="font-mono text-[10px] text-muted-foreground">{bg}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Foreground</span>
          <div
            className="h-8 rounded border border-border"
            style={{ backgroundColor: fg }}
          />
          <span className="font-mono text-[10px] text-muted-foreground">{fg}</span>
        </div>
      </div>

      <Separator className="mb-3" />

      {/* WCAG breakdown */}
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        WCAG 2.1 Status
      </p>
      <div className="mb-1 space-y-0.5">
        <p className="text-[10px] font-medium text-muted-foreground">Level AA</p>
        <StatusRow pass={result.aa.normalText} label="Normal Text (≥4.5:1)" />
        <StatusRow pass={result.aa.largeText} label="Large Text (≥3:1)" />
      </div>
      <div className="mb-3 space-y-0.5">
        <p className="text-[10px] font-medium text-muted-foreground">Level AAA</p>
        <StatusRow pass={result.aaa.normalText} label="Normal Text (≥7:1)" />
        <StatusRow pass={result.aaa.largeText} label="Large Text (≥4.5:1)" />
      </div>

      <Separator className="mb-3" />

      {/* suggestions or success */}
      <AnimatePresence mode="sync">
        {allPass ? (
          <motion.div
            key="pass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 flex-col items-center justify-center gap-2 py-6"
          >
            <ShieldCheck className="h-10 w-10 text-success" />
            <p className="text-sm font-medium">Contrast is optimal</p>
            <p className="text-xs text-muted-foreground">
              All WCAG 2.1 criteria pass.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Smart Fixes
            </p>
            <FixRow
              label="Fix to AA (≥4.5:1)"
              targetRatio={4.51}
              bg={bg}
              fg={fg}
              currentlyPasses={result.aa.normalText}
              onApply={onApply}
            />
            <FixRow
              label="Fix to AAA (≥7:1)"
              targetRatio={7.01}
              bg={bg}
              fg={fg}
              currentlyPasses={result.aaa.normalText}
              onApply={onApply}
            />
          </div>
        )}
      </AnimatePresence>

      {/* tools section at bottom */}
      <div className="mt-auto pt-4">
        <Separator className="mb-3" />
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tools
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
          <Label
            htmlFor="grayscale-panel"
            className="flex cursor-pointer items-center gap-1.5 text-xs"
          >
            <SunMoon className="h-3.5 w-3.5 text-muted-foreground" />
            Luminance Only View
          </Label>
          <Switch
            id="grayscale-panel"
            checked={grayscale}
            onCheckedChange={onGrayscaleChange}
          />
        </div>
      </div>
    </aside>
  );
}
