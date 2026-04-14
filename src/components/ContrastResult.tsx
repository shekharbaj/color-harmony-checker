import { WCAGResult } from "@/lib/contrast";
import { CheckCircle2, XCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ContrastResultProps {
  result: WCAGResult;
}

function StatusBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <motion.div
      layout
      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
    >
      <span className="text-sm font-medium">{label}</span>
      <AnimatePresence mode="wait">
        <motion.div
          key={pass ? "pass" : "fail"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pass ? (
            <Badge className="gap-1 bg-success text-success-foreground hover:bg-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pass
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Fail
            </Badge>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export function ContrastResult({ result }: ContrastResultProps) {
  const copyRatio = () => {
    navigator.clipboard.writeText(result.ratio.toFixed(2) + ":1");
    toast.success("Contrast ratio copied!");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contrast Ratio
          </p>
          <motion.p
            className="font-mono text-4xl font-bold tracking-tight"
            key={result.ratio.toFixed(2)}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {result.ratio.toFixed(2)}
            <span className="text-lg text-muted-foreground">:1</span>
          </motion.p>
        </div>
        <Button variant="outline" size="icon" onClick={copyRatio} title="Copy ratio">
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          WCAG AA
        </p>
        <div className="grid gap-2">
          <StatusBadge pass={result.aa.normalText} label="Normal Text (≥4.5:1)" />
          <StatusBadge pass={result.aa.largeText} label="Large Text (≥3:1)" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          WCAG AAA
        </p>
        <div className="grid gap-2">
          <StatusBadge pass={result.aaa.normalText} label="Normal Text (≥7:1)" />
          <StatusBadge pass={result.aaa.largeText} label="Large Text (≥4.5:1)" />
        </div>
      </div>
    </div>
  );
}
