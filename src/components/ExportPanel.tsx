import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { toHex, toHsl } from "@/lib/contrast";
import { toast } from "sonner";
import chroma from "chroma-js";

interface ExportPanelProps {
  bg: string;
  fg: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="outline" size="icon" className="absolute right-3 top-3 h-7 w-7" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function hslParts(hex: string): string {
  const [h, s, l] = chroma(hex).hsl();
  return `${Math.round(isNaN(h) ? 0 : h)} ${Math.round((isNaN(s) ? 0 : s) * 100)}% ${Math.round((isNaN(l) ? 0 : l) * 100)}%`;
}

export function ExportPanel({ bg, fg }: ExportPanelProps) {
  const cssCode = `:root {
  --color-background: ${toHex(bg)};
  --color-foreground: ${toHex(fg)};
  --color-background-hsl: ${toHsl(bg)};
  --color-foreground-hsl: ${toHsl(fg)};
}

/* Usage */
.element {
  background-color: var(--color-background);
  color: var(--color-foreground);
}`;

  const tailwindCode = `// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        "brand-bg": "${toHex(bg)}",
        "brand-fg": "${toHex(fg)}",
        // Or with HSL for opacity support:
        // "brand-bg": "hsl(${hslParts(bg)})",
        // "brand-fg": "hsl(${hslParts(fg)})",
      },
    },
  },
};

// Usage: className="bg-brand-bg text-brand-fg"`;

  const scssCode = `$color-background: ${toHex(bg)};
$color-foreground: ${toHex(fg)};

// RGB values
$color-background-rgb: ${chroma(bg).rgb().join(", ")};
$color-foreground-rgb: ${chroma(fg).rgb().join(", ")};

// Usage
.element {
  background-color: $color-background;
  color: $color-foreground;
}`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Export Code
      </p>
      <Tabs defaultValue="css">
        <TabsList className="h-8">
          <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
          <TabsTrigger value="tailwind" className="text-xs">Tailwind</TabsTrigger>
          <TabsTrigger value="scss" className="text-xs">SCSS</TabsTrigger>
        </TabsList>
        <TabsContent value="css" className="relative mt-2">
          <CopyButton text={cssCode} />
          <pre className="overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            {cssCode}
          </pre>
        </TabsContent>
        <TabsContent value="tailwind" className="relative mt-2">
          <CopyButton text={tailwindCode} />
          <pre className="overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            {tailwindCode}
          </pre>
        </TabsContent>
        <TabsContent value="scss" className="relative mt-2">
          <CopyButton text={scssCode} />
          <pre className="overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            {scssCode}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
