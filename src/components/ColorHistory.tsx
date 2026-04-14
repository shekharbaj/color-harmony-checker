import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface ColorPair {
  bg: string;
  fg: string;
  ratio: number;
}

interface ColorHistoryProps {
  history: ColorPair[];
  onSelect: (pair: ColorPair) => void;
}

export function ColorHistory({ history, onSelect }: ColorHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Combinations
      </p>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {history.map((pair, i) => (
            <motion.button
              key={`${pair.bg}-${pair.fg}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              layout
              className="group flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-foreground/20"
              onClick={() => onSelect(pair)}
            >
              <div
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: pair.bg }}
              />
              <div
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: pair.fg }}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {pair.ratio.toFixed(1)}:1
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
