import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isValidColor, toHex, toRgb, toHsl } from "@/lib/contrast";
import { motion } from "framer-motion";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(toHex(color));
  const [rgbValue, setRgbValue] = useState(toRgb(color));
  const [hslValue, setHslValue] = useState(toHsl(color));

  useEffect(() => {
    setHexValue(toHex(color));
    setRgbValue(toRgb(color));
    setHslValue(toHsl(color));
  }, [color]);

  const handleHexChange = (val: string) => {
    setHexValue(val);
    if (isValidColor(val)) onChange(toHex(val));
  };

  const handleRgbChange = (val: string) => {
    setRgbValue(val);
    if (isValidColor(val)) onChange(toHex(val));
  };

  const handleHslChange = (val: string) => {
    setHslValue(val);
    if (isValidColor(val)) onChange(toHex(val));
  };

  const handleEyeDropper = useCallback(async () => {
    if ("EyeDropper" in window) {
      try {
        // @ts-ignore - EyeDropper API
        const dropper = new window.EyeDropper();
        const result = await dropper.open();
        onChange(result.sRGBHex);
      } catch {}
    }
  }, [onChange]);

  return (
    <motion.div
      layout
      className="flex flex-col gap-3"
    >
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={toHex(color)}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
          />
        </div>

        <motion.div
          className="h-12 flex-1 rounded-lg border border-border"
          style={{ backgroundColor: isValidColor(color) ? color : "#ffffff" }}
          animate={{ backgroundColor: isValidColor(color) ? color : "#ffffff" }}
          transition={{ duration: 0.3 }}
        />

        {"EyeDropper" in window && (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleEyeDropper}
            title="Pick color from screen"
          >
            <Pipette className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="hex" className="w-full">
        <TabsList className="h-8 w-full">
          <TabsTrigger value="hex" className="text-xs">HEX</TabsTrigger>
          <TabsTrigger value="rgb" className="text-xs">RGB</TabsTrigger>
          <TabsTrigger value="hsl" className="text-xs">HSL</TabsTrigger>
        </TabsList>
        <TabsContent value="hex" className="mt-2">
          <Input
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="#000000"
          />
        </TabsContent>
        <TabsContent value="rgb" className="mt-2">
          <Input
            value={rgbValue}
            onChange={(e) => handleRgbChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="rgb(0, 0, 0)"
          />
        </TabsContent>
        <TabsContent value="hsl" className="mt-2">
          <Input
            value={hslValue}
            onChange={(e) => handleHslChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="hsl(0, 0%, 0%)"
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
