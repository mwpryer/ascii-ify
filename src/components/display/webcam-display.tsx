import { Camera, CameraOff, Download, Eye, EyeOff } from "lucide-react";

import { useApp } from "@/context/app-context";
import { useWebcam } from "@/hooks/use-webcam";
import { useAscii } from "@/hooks/use-ascii";
import { cn } from "@/lib/utils";
import { DisplayActionButton } from "@/components/display/display-action-button";
import {
  DisplayActionsContainer,
  DisplayCanvas,
  DisplayCanvasContainer,
  DisplayContainer,
  DisplayInset,
} from "@/components/display/display-containers";
import { DisplayCopyButton } from "@/components/display/display-copy-button";
import { Button } from "@/components/ui/button";

export function WebcamDisplay() {
  const { config } = useApp();
  const {
    isLoading: isWebcamLoading,
    isActive: isWebcamActive,
    canvasRef: webcamCanvasRef,
    start: _startWebcam,
    stop: _stopWebcam,
  } = useWebcam();
  const {
    isActive: isAsciiActive,
    canvasRef: asciiCanvasRef,
    show: showAscii,
    hide: hideAscii,
    copy: copyAscii,
    download: downloadAscii,
  } = useAscii(webcamCanvasRef.current, {
    ...config,
    animate: true,
  });

  function startWebcam() {
    _startWebcam();
    showAscii();
  }

  function stopWebcam() {
    _stopWebcam();
    hideAscii();
  }

  function toggleAscii() {
    if (isAsciiActive) {
      hideAscii();
    } else {
      if (webcamCanvasRef.current) showAscii();
    }
  }

  return (
    <DisplayContainer>
      <DisplayActionsContainer>
        <DisplayActionButton
          onClick={isWebcamActive ? stopWebcam : startWebcam}
          icon={isWebcamActive ? CameraOff : Camera}
          tooltip={isWebcamActive ? "Stop webcam" : "Start webcam"}
          loading={isWebcamLoading}
        />
        <DisplayActionButton
          onClick={toggleAscii}
          icon={!isWebcamActive || !isAsciiActive ? Eye : EyeOff}
          tooltip={
            !isWebcamActive || !isAsciiActive ? "Show ASCII" : "Hide ASCII"
          }
          disabled={!isWebcamActive}
        />
        <DisplayCopyButton
          onCopy={copyAscii}
          tooltip="Copy ASCII"
          disabled={!isWebcamActive || !isAsciiActive}
        />
        <DisplayActionButton
          onClick={() => downloadAscii()}
          icon={Download}
          tooltip="Download ASCII"
          disabled={!isWebcamActive || !isAsciiActive}
        />
      </DisplayActionsContainer>

      <DisplayCanvasContainer>
        <DisplayInset className={cn({ hidden: isWebcamActive })}>
          <Button
            variant="outline"
            onClick={startWebcam}
            disabled={isWebcamLoading}
          >
            <Camera className="size-4" />
            Start
          </Button>
        </DisplayInset>

        <DisplayCanvas
          ref={webcamCanvasRef}
          className={cn({ hidden: isAsciiActive })}
        />
        <DisplayCanvas
          ref={asciiCanvasRef}
          className={cn({ hidden: !isAsciiActive })}
        />
      </DisplayCanvasContainer>
    </DisplayContainer>
  );
}
