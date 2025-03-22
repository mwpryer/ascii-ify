import { HexColorInput, HexColorPicker } from "react-colorful";
import { Check, X } from "lucide-react";

import { ASCII_COLOUR_PRESETS } from "@/lib/ascii";
import { cn } from "@/lib/utils";
import { ControlsHeadingLabel } from "@/components/controls/controls-heading-label";
import { Button } from "@/components/ui/button";
import { inputVariants } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function hexToRgb(hex: string) {
  if (hex[0] === "#") hex = hex.substring(1);

  let r = 0;
  let g = 0;
  let b = 0;

  if (hex.length < 6) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return `${r}, ${g}, ${b}`;
}

interface ColourInfoProps {
  colour: string;
}
function ColourInfo({ colour }: ColourInfoProps) {
  return (
    <div className="grid grid-cols-[2fr_3fr] gap-2">
      <div className="flex flex-col gap-1">
        <ControlsHeadingLabel>Hex</ControlsHeadingLabel>
        <span className="text-xs">{colour || "-"}</span>
      </div>
      <div className="flex flex-col gap-1">
        <ControlsHeadingLabel>RGB</ControlsHeadingLabel>
        <span className="text-xs">
          {colour ? `(${hexToRgb(colour)})` : "-"}
        </span>
      </div>
    </div>
  );
}

interface ColourPresetsProps {
  colour: string;
  onChange: (colour: string) => void;
}
function ColourPresets({ colour, onChange }: ColourPresetsProps) {
  return (
    <div className="flex flex-col gap-1">
      <ControlsHeadingLabel>Presets</ControlsHeadingLabel>

      <div className="flex justify-between gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onChange("")}
              className="relative overflow-hidden bg-gradient-to-bl from-gray-600 to-gray-800"
            >
              {colour === "" && (
                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <Check />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Source</TooltipContent>
        </Tooltip>
        {ASCII_COLOUR_PRESETS.map((preset) => (
          <Tooltip key={preset}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative overflow-hidden"
                onClick={() => onChange(preset)}
                style={{ backgroundColor: preset }}
              >
                {colour === preset && (
                  <div className="absolute inset-0 grid place-items-center bg-black/20">
                    <Check />
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{preset}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

interface ColourPickerProps {
  colour: string;
  onChange: (colour: string) => void;
}
function ColourPicker({ colour, onChange }: ColourPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("rounded-r-none border-r-0 focus:z-10 focus:border-r", {
            "bg-gradient-to-bl from-gray-600 to-gray-800": !colour,
          })}
          style={{ backgroundColor: colour }}
        />
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          <HexColorPicker color={colour} onChange={onChange} />
          <ColourInfo colour={colour} />
        </div>
        <Separator />
        <div className="p-2">
          <ColourPresets colour={colour} onChange={onChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ColourInputProps {
  colour: string;
  onChange: (colour: string) => void;
}
export function ColourInput({ colour, onChange }: ColourInputProps) {
  function handleChange(value: string) {
    onChange(value.toUpperCase());
  }

  return (
    <div className="relative flex items-center">
      <ColourPicker colour={colour} onChange={handleChange} />
      <HexColorInput
        color={colour}
        onChange={handleChange}
        placeholder="Using source"
        className={cn(inputVariants(), "flex-1 rounded-l-none focus:z-10")}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("")}
        className={cn("absolute right-1.5 size-6 text-muted-foreground", {
          hidden: !colour,
        })}
      >
        <X className="!size-3.5" />
      </Button>
    </div>
  );
}
