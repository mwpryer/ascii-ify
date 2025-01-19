import { useEffect, useRef } from "react";
import { Download, Eye, EyeOff, Upload, X } from "lucide-react";

import { useApp } from "@/context/app-context";
import { useUpload } from "@/hooks/use-upload";
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

export function UploadDisplay() {
  const { config } = useApp();
  const {
    isUploading,
    hasUpload,
    type,
    inputRef: uploadInputRef,
    canvasRef: uploadCanvasRef,
    upload,
    clear,
    videoRef,
  } = useUpload();
  const {
    isActive: isAsciiActive,
    isDownloading: isAsciiDownloading,
    canvasRef: asciiCanvasRef,
    show: showAscii,
    hide: hideAscii,
    copy: copyAscii,
    download: downloadAscii,
  } = useAscii(uploadCanvasRef.current, {
    ...config,
    animate: type === "video",
  });
  const initialised = useRef(false);

  useEffect(() => {
    if (hasUpload) {
      if (!initialised.current) {
        showAscii();
        initialised.current = true;
      }
    } else {
      initialised.current = false;
    }
  }, [hasUpload, showAscii]);

  function toggleAscii() {
    if (isAsciiActive) {
      hideAscii();
    } else {
      if (uploadCanvasRef.current) showAscii();
    }
  }

  return (
    <DisplayContainer>
      <DisplayActionsContainer>
        <DisplayActionButton
          onClick={hasUpload ? clear : () => uploadInputRef.current?.click()}
          icon={hasUpload ? X : Upload}
          tooltip={hasUpload ? "Remove Upload" : "Upload Media"}
          loading={isUploading}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              upload(file);
              e.target.value = "";
            }
          }}
        />
        <DisplayActionButton
          onClick={toggleAscii}
          icon={!hasUpload || !isAsciiActive ? Eye : EyeOff}
          tooltip={!hasUpload || !isAsciiActive ? "Show ASCII" : "Hide ASCII"}
          disabled={!hasUpload}
        />
        <DisplayCopyButton
          onCopy={copyAscii}
          tooltip="Copy ASCII"
          disabled={!hasUpload || !isAsciiActive}
        />
        <DisplayActionButton
          onClick={async () => {
            if (videoRef.current) {
              await downloadAscii(videoRef.current);
              clear();
            } else {
              await downloadAscii();
            }
          }}
          icon={Download}
          tooltip="Download ASCII"
          disabled={!hasUpload || !isAsciiActive}
          loading={isAsciiDownloading}
        />
      </DisplayActionsContainer>

      <DisplayCanvasContainer>
        <DisplayInset className={cn({ hidden: hasUpload })}>
          <Button
            variant="outline"
            onClick={() => uploadInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="size-4 text-muted-foreground" />
            Upload
          </Button>
        </DisplayInset>

        <div className="absolute inset-0 overflow-auto">
          <DisplayCanvas
            ref={uploadCanvasRef}
            className={cn("w-auto", { hidden: isAsciiActive })}
          />
          <DisplayCanvas
            ref={asciiCanvasRef}
            className={cn("w-auto", { hidden: !isAsciiActive })}
          />
        </div>
      </DisplayCanvasContainer>
    </DisplayContainer>
  );
}
