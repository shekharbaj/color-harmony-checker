import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, MousePointerClick, Star } from "lucide-react";

interface PreviewCardProps {
  bg: string;
  fg: string;
}

export function PreviewCard({ bg, fg }: PreviewCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Live Preview
      </p>

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
          style={{ backgroundColor: bg }}
          animate={{ backgroundColor: bg }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="text" className="m-0 p-6">
            <motion.div animate={{ color: fg }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-bold" style={{ color: fg }}>
                The quick brown fox
              </h2>
              <p className="mt-2 text-base" style={{ color: fg }}>
                jumps over the lazy dog. This text demonstrates how your color
                combination looks at normal reading size (16px).
              </p>
              <p className="mt-3 text-sm" style={{ color: fg, opacity: 0.8 }}>
                Smaller text (14px) — Check if this is still readable for body content
                and secondary information.
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="buttons" className="m-0 flex flex-wrap gap-3 p-6">
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: fg, color: bg }}
            >
              Primary Button
            </button>
            <button
              className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
              style={{ borderColor: fg, color: fg, backgroundColor: "transparent" }}
            >
              Outline Button
            </button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium underline"
              style={{ color: fg, backgroundColor: "transparent" }}
            >
              Link Button
            </button>
          </TabsContent>

          <TabsContent value="icons" className="m-0 flex flex-wrap items-center gap-4 p-6">
            {[Star, MousePointerClick, Type].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon className="h-8 w-8" style={{ color: fg }} />
                <span className="text-xs" style={{ color: fg }}>
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
