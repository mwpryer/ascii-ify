import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import {
  DisplayActionButton,
  DisplayActionButtonProps,
} from "@/components/display/display-action-button";

interface DisplayFullscreenButtonProps
  extends Omit<DisplayActionButtonProps, "icon" | "tooltip" | "loading"> {
  containerId: string;
}

export function DisplayFullscreenButton({
  containerId,
  disabled,
  ...props
}: DisplayFullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, [containerId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <DisplayActionButton
      variant="ghost"
      icon={isFullscreen ? Minimize2 : Maximize2}
      onClick={toggleFullscreen}
      disabled={disabled}
      tooltip={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      {...props}
    />
  );
}
