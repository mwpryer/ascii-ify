import { Camera, LucideIcon, Upload } from "lucide-react";

import { useApp } from "@/context/app-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DisplayToggleProps = React.ComponentProps<typeof Tabs>;
export function DisplayToggle(props: DisplayToggleProps) {
  const { display, setDisplay } = useApp();

  return (
    <Tabs
      value={display}
      onValueChange={(value) => setDisplay(value as typeof display)}
      {...props}
    >
      <TabsList className="grid grid-cols-2">
        <DisplayToggleTrigger
          value="webcam"
          icon={Camera}
          label="Webcam"
          tooltip="Use Webcam"
        />
        <DisplayToggleTrigger
          value="upload"
          icon={Upload}
          label="Upload"
          tooltip="Use Upload"
        />
      </TabsList>
    </Tabs>
  );
}

interface DisplayToggleTriggerProps {
  value: string;
  icon: LucideIcon;
  label: string;
  tooltip: string;
}
function DisplayToggleTrigger({
  value,
  icon: Icon,
  label,
  tooltip,
}: DisplayToggleTriggerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Tooltip>
        <TabsTrigger
          value={value}
          className="relative h-full w-10 lg:hidden"
          asChild
        >
          <TooltipTrigger className="absolute inset-0 grid place-items-center">
            <Icon className="size-3.5" />
          </TooltipTrigger>
        </TabsTrigger>
        <TooltipContent sideOffset={8}>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <TabsTrigger value={value} className="hidden space-x-2 lg:inline-flex">
      <Icon className="size-3.5 lg:text-muted-foreground" />
      <span>{label}</span>
    </TabsTrigger>
  );
}
