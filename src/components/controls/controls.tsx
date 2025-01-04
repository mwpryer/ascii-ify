import { ArrowLeftRight, Lock, RefreshCcw, Unlock } from "lucide-react";
import { useState } from "react";

import { useApp } from "@/context/app-context";
import {
  ASCII_CHAR_PRESETS,
  ASCII_CONSTRAINTS,
  DEFAULT_ASCII_CONFIG,
} from "@/lib/ascii";
import { cn } from "@/lib/utils";
import { ColourInput } from "@/components/controls/controls-colour-input";
import { ControlsHeadingLabel } from "@/components/controls/controls-heading-label";
import { DisplayToggle } from "@/components/display/display-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Controls() {
  const { config, updateConfig } = useApp();
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(
    config.outputWidth / config.outputHeight,
  );
  const [isInverted, setIsInverted] = useState(false);

  function handleWidthChange(width: number) {
    if (isAspectRatioLocked) {
      const newHeight = Math.round(width / aspectRatio);
      const height = Math.min(
        Math.max(newHeight, ASCII_CONSTRAINTS.OUTPUT_HEIGHT.MIN),
        ASCII_CONSTRAINTS.OUTPUT_HEIGHT.MAX,
      );
      updateConfig({
        outputWidth: width,
        outputHeight: height,
      });
    } else {
      updateConfig({ outputWidth: width });
      setAspectRatio(width / config.outputHeight);
    }
  }

  function handleHeightChange(height: number) {
    if (isAspectRatioLocked) {
      const newWidth = Math.round(height * aspectRatio);
      const width = Math.min(
        Math.max(newWidth, ASCII_CONSTRAINTS.OUTPUT_WIDTH.MIN),
        ASCII_CONSTRAINTS.OUTPUT_WIDTH.MAX,
      );
      updateConfig({
        outputHeight: height,
        outputWidth: width,
      });
    } else {
      updateConfig({ outputHeight: height });
      setAspectRatio(config.outputWidth / height);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="sm:hidden">
        <DisplayToggle />
        <SidebarSeparator className="-ml-2 -mr-2 mt-2" />
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase text-foreground">
          Controls
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                updateConfig(DEFAULT_ASCII_CONFIG);
                setAspectRatio(
                  DEFAULT_ASCII_CONFIG.outputWidth /
                    DEFAULT_ASCII_CONFIG.outputHeight,
                );
              }}
              className="size-6 text-muted-foreground"
            >
              <RefreshCcw className="!size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2">
        <div className="mb-1 flex items-center gap-2">
          <ControlsHeadingLabel>Resolution</ControlsHeadingLabel>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
                className="size-6 text-muted-foreground"
              >
                {isAspectRatioLocked ? (
                  <Lock className="!size-3.5" />
                ) : (
                  <Unlock className="!size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isAspectRatioLocked ? "Unlock Ratio" : "Lock Ratio"}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col">
          <ControlLabel>Width (characters)</ControlLabel>
          <ControlsNumberSlider
            value={config.outputWidth}
            onValueChange={handleWidthChange}
            min={ASCII_CONSTRAINTS.OUTPUT_WIDTH.MIN}
            max={ASCII_CONSTRAINTS.OUTPUT_WIDTH.MAX}
          />
        </div>

        <div className="flex flex-col">
          <ControlLabel>Height (characters)</ControlLabel>
          <ControlsNumberSlider
            value={config.outputHeight}
            onValueChange={handleHeightChange}
            min={ASCII_CONSTRAINTS.OUTPUT_HEIGHT.MIN}
            max={ASCII_CONSTRAINTS.OUTPUT_HEIGHT.MAX}
          />
        </div>
      </div>

      <SidebarSeparator className="-ml-2 -mr-2" />

      <div className="flex flex-col gap-2">
        <ControlsHeadingLabel className="mb-1">Characters</ControlsHeadingLabel>

        <div className="flex flex-col gap-1.5">
          <ControlLabel>Preset</ControlLabel>
          <Select
            value={
              ASCII_CHAR_PRESETS.includes(config.chars) ? config.chars : ""
            }
            onValueChange={(value) => updateConfig({ chars: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {ASCII_CHAR_PRESETS.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <ControlLabel>Custom</ControlLabel>
          <div className="relative flex items-center">
            <Input
              value={config.chars}
              onChange={(e) => updateConfig({ chars: e.target.value })}
              placeholder="Enter characters..."
              className="pr-8"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsInverted(!isInverted);
                updateConfig({
                  chars: config.chars.split("").reverse().join(""),
                });
              }}
              className="absolute right-1.5 size-6 text-muted-foreground"
            >
              <ArrowLeftRight
                className={cn("!size-3.5", { "-scale-x-100": isInverted })}
              />
            </Button>
          </div>
        </div>
      </div>

      <SidebarSeparator className="-ml-2 -mr-2" />

      <div className="flex flex-col gap-2">
        <ControlsHeadingLabel className="mb-1">Font</ControlsHeadingLabel>

        <div className="flex flex-col">
          <ControlLabel>Size (px)</ControlLabel>
          <ControlsNumberSlider
            value={config.fontSize}
            onValueChange={(fontSize) => updateConfig({ fontSize })}
            min={ASCII_CONSTRAINTS.FONT_SIZE.MIN}
            max={ASCII_CONSTRAINTS.FONT_SIZE.MAX}
          />
        </div>

        <div className="-mt-0.5 flex flex-col gap-1.5">
          <ControlLabel>Colour</ControlLabel>
          <ColourInput
            colour={config.colour}
            onChange={(colour) => updateConfig({ colour })}
          />
        </div>
      </div>
    </div>
  );
}

type ControlLabelProps = React.ComponentProps<typeof Label>;
function ControlLabel(props: ControlLabelProps) {
  return <Label className="text-xs" {...props} />;
}

interface ControlsNumberSliderProps
  extends Omit<React.ComponentProps<typeof Slider>, "value" | "onValueChange"> {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
}
function ControlsNumberSlider({
  className,
  value,
  onValueChange,
  min,
  max,
  ...props
}: ControlsNumberSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[value]}
        onValueChange={([value]) => onValueChange(value)}
        min={min}
        max={max}
        step={1}
        className={cn("flex-1", className)}
        {...props}
      />
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          if (!isNaN(parsed)) {
            const clamped = Math.min(Math.max(parsed, min), max);
            onValueChange(clamped);
          }
        }}
        className="w-20"
      />
    </div>
  );
}
