import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Wand2, Copy, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/ColorPicker";
import { ContrastResult } from "@/components/ContrastResult";
import { PreviewCard } from "@/components/PreviewCard";
import { ColorHistory, type ColorPair } from "@/components/ColorHistory";
import { checkWCAG, fixForeground, toHex } from "@/lib/contrast";
import { toast } from "sonner";

export default function Index() {
  const [bg, setBg] = useState("#ffffff");
  const [fg, setFg] = useState("#6b7280");
  const [history, setHistory] = useState<ColorPair[]>([]);
  const prevPairRef = useRef({ bg, fg });

  const result = checkWCAG(bg, fg);

  // Add to history on meaningful change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const prev = prevPairRef.current;
      if (prev.bg !== bg || prev.fg !== fg) {
        prevPairRef.current = { bg, fg };
        setHistory((h) => {
          const exists = h.some((p) => p.bg === bg && p.fg === fg);
          if (exists) return h;
          const newH = [{ bg, fg, ratio: result.ratio }, ...h];
          return newH.slice(0, 5);
        });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [bg, fg, result.ratio]);

  const swap = useCallback(() => {
    setBg(fg);
    setFg(bg);
  }, [bg, fg]);

  const fix = useCallback(() => {
    const fixed = fixForeground(bg, fg);
    setFg(fixed);
    toast.success(`Foreground adjusted to ${fixed}`);
  }, [bg, fg]);

  const copyHex = useCallback(() => {
    navigator.clipboard.writeText(`BG: ${toHex(bg)} | FG: ${toHex(fg)}`);
    toast.success("Colors copied!");
  }, [bg, fg]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Accessibility className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">Contrast Checker</h1>
              <p className="text-xs text-muted-foreground">WCAG 2.1 Compliance</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyHex}>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Colors</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          {/* Color pickers + swap */}
          <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
            <Card className="p-4 sm:p-5">
              <ColorPicker label="Background" color={bg} onChange={setBg} />
            </Card>

            <div className="flex items-center justify-center">
              <motion.div whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={swap}
                  title="Swap colors"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <Card className="p-4 sm:p-5">
              <ColorPicker label="Foreground" color={fg} onChange={setFg} />
            </Card>
          </div>

          {/* Results + Preview */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4 sm:p-5">
              <ContrastResult result={result} />
              {!result.aa.normalText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Button
                    onClick={fix}
                    className="w-full gap-2 bg-primary text-primary-foreground"
                  >
                    <Wand2 className="h-4 w-4" />
                    Fix for me (AA Normal)
                  </Button>
                </motion.div>
              )}
            </Card>

            <Card className="p-4 sm:p-5">
              <PreviewCard bg={bg} fg={fg} />
            </Card>
          </div>

          {/* History */}
          <ColorHistory
            history={history}
            onSelect={(pair) => {
              setBg(pair.bg);
              setFg(pair.fg);
            }}
          />
        </div>
      </main>
    </div>
  );
}
