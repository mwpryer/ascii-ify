import { FormEvent, useEffect, useRef, useState } from "react";
import { Download, Eye, EyeOff, Upload, X, Link } from "lucide-react";

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
  ZoomContainer,
} from "@/components/display/display-containers";
import { DisplayCopyButton } from "@/components/display/display-copy-button";
import { VideoControls } from "@/components/display/video-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function UploadDisplay() {
  const { config } = useApp();
  const {
    isUploading,
    hasUpload,
    type,
    inputRef: uploadInputRef,
    canvasRef: uploadCanvasRef,
    uploadFile,
    uploadUrl,
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
  const [url, setUrl] = useState("");

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

  function handleUrlSubmit(e: FormEvent) {
    e.preventDefault();
    if (url.trim()) {
      uploadUrl(url.trim());
      setUrl("");
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
          accept="image/jpeg,image/png,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile(file);
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
          tooltip={type === "video" ? "Download Video" : "Download PNG"}
          disabled={!hasUpload || !isAsciiActive}
          loading={isAsciiDownloading}
        />
      </DisplayActionsContainer>

      <DisplayCanvasContainer>
        <DisplayInset className={cn({ hidden: hasUpload })}>
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="outline"
                onClick={() => uploadInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="size-4" />
                Upload
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                (JPG, PNG, MP4, WebM, MOV)
              </p>
            </div>

            <div className="flex w-full items-center">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleUrlSubmit} className="w-full">
              <div className="flex overflow-hidden rounded-md border border-input focus-within:border-primary">
                <div className="flex items-center pl-3 text-muted-foreground">
                  <Link className="size-4" />
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isUploading}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-auto rounded-none border-0 border-l"
                  disabled={isUploading || !url.trim()}
                >
                  Load
                </Button>
              </div>
            </form>
          </div>
        </DisplayInset>

        <ZoomContainer disableZoom={!hasUpload}>
          <DisplayCanvas
            ref={uploadCanvasRef}
            className={cn("w-auto", { hidden: isAsciiActive })}
          />
          <DisplayCanvas
            ref={asciiCanvasRef}
            className={cn("w-auto", { hidden: !isAsciiActive })}
          />
        </ZoomContainer>

        {type === "video" && hasUpload && <VideoControls videoRef={videoRef} />}
      </DisplayCanvasContainer>
    </DisplayContainer>
  );
}
