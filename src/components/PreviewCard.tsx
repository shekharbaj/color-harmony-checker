import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, MousePointerClick, Star, Eye } from "lucide-react";

// Color blindness simulation matrices (linear RGB transformation)
// Source: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
const CVD_MATRICES: Record<string, number[][]> = {
  none: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.011820, 0.042940, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.303900],
  ],
};

function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? Math.round(c * 12.92 * 255) : Math.round((1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
}

function simulateCVD(hex: string, matrix: number[][]): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const sr = matrix[0][0] * lr + matrix[0][1] * lg + matrix[0][2] * lb;
  const sg = matrix[1][0] * lr + matrix[1][1] * lg + matrix[1][2] * lb;
  const sb = matrix[2][0] * lr + matrix[2][1] * lg + matrix[2][2] * lb;

  const nr = linearToSrgb(sr);
  const ng = linearToSrgb(sg);
  const nb = linearToSrgb(sb);

  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

interface PreviewCardProps {
  bg: string;
  fg: string;
}

const CVD_LABELS: Record<string, string> = {
  none: "Normal Vision",
  protanopia: "Protanopia (Red-blind)",
  deuteranopia: "Deuteranopia (Green-blind)",
  tritanopia: "Tritanopia (Blue-blind)",
};

export function PreviewCard({ bg, fg }: PreviewCardProps) {
  const [cvdMode, setCvdMode] = useState("none");

  const matrix = CVD_MATRICES[cvdMode];
  const simBg = cvdMode === "none" ? bg : simulateCVD(bg, matrix);
  const simFg = cvdMode === "none" ? fg : simulateCVD(fg, matrix);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live Preview
        </p>
        <Select value={cvdMode} onValueChange={setCvdMode}>
          <SelectTrigger className="h-7 w-[180px] text-xs">
            <Eye className="mr-1.5 h-3 w-3 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CVD_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="text">
        <TabsList className="h-8">
          <TabsTrigger value="text" className="gap-1 text-xs">
            <Type className="h-3 w-3" /> Text
          </TabsTrigger>
          <TabsTrigger value="buttons" className="gap-1 text-xs">
            <MousePointerClick className="h-3 w-3" /> Buttons
          </TabsTrigger>
          <TabsTrigger value="icons" className="gap-1 text-xs">
            <Star className="h-3 w-3" /> Icons
          </TabsTrigger>
        </TabsList>

        <motion.div
          className="mt-3 overflow-hidden rounded-xl border border-border"
          style={{ backgroundColor: simBg }}
          animate={{ backgroundColor: simBg }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="text" className="m-0 p-6">
            <motion.div animate={{ color: simFg }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-bold" style={{ color: simFg }}>
                The quick brown fox
              </h2>
              <p className="mt-2 text-base" style={{ color: simFg }}>
                jumps over the lazy dog. This text demonstrates how your color
                combination looks at normal reading size (16px).
              </p>
              <p className="mt-3 text-sm" style={{ color: simFg, opacity: 0.8 }}>
                Smaller text (14px) — Check if this is still readable for body content
                and secondary information.
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="buttons" className="m-0 flex flex-wrap gap-3 p-6">
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: simFg, color: simBg }}
            >
              Primary Button
            </button>
            <button
              className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
              style={{ borderColor: simFg, color: simFg, backgroundColor: "transparent" }}
            >
              Outline Button
            </button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium underline"
              style={{ color: simFg, backgroundColor: "transparent" }}
            >
              Link Button
            </button>
          </TabsContent>

          <TabsContent value="icons" className="m-0 flex flex-wrap items-center gap-4 p-6">
            {[Star, MousePointerClick, Type].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon className="h-8 w-8" style={{ color: simFg }} />
                <span className="text-xs" style={{ color: simFg }}>
                  Icon {i + 1}
                </span>
              </div>
            ))}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
