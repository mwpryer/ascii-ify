import React, { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { DisplayFullscreenButton } from "@/components/display/display-fullscreen-button";
import { DisplayToggle } from "@/components/display/display-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DisplayContainerProps = React.ComponentProps<"div">;
export function DisplayContainer({ children }: DisplayContainerProps) {
  return <div className="flex h-full w-full flex-col">{children}</div>;
}

type DisplayActionsContainerProps = React.ComponentProps<"div">;
export function DisplayActionsContainer({
  children,
}: DisplayActionsContainerProps) {
  return (
    <div className="relative flex items-center gap-2 border-b bg-sidebar p-2">
      <div className="flex gap-2">
        <SidebarTrigger />
        {children}
      </div>
      <div className="absolute left-0 right-0 mx-auto hidden w-fit lg:block">
        <DisplayToggle />
      </div>
      <div className="ml-auto lg:hidden">
        <DisplayToggle />
      </div>
    </div>
  );
}

type DisplayCanvasContainerProps = React.ComponentProps<"div">;
export function DisplayCanvasContainer({
  children,
}: DisplayCanvasContainerProps) {
  return (
    <div
      id="preview-container"
      className="group relative flex-1 overflow-hidden bg-black"
    >
      {children}
      <div className="absolute right-2 top-2 z-10">
        <DisplayFullscreenButton
          containerId="preview-container"
          className="pointer-events-none opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100"
        />
      </div>
    </div>
  );
}

type DisplayInsetProps = React.ComponentProps<"div">;
export function DisplayInset({
  children,
  className,
  ...props
}: DisplayInsetProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 grid place-items-center bg-black",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type DisplayCanvasProps = React.ComponentProps<"canvas">;
export const DisplayCanvas = React.forwardRef<
  HTMLCanvasElement,
  DisplayCanvasProps
>(({ className, ...props }, ref) => (
  <canvas
    className={cn(
      "absolute left-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain",
      className,
    )}
    ref={ref}
    {...props}
  />
));

const ZOOM_CONTROLS_TIMEOUT = 2000;

type ZoomContainerProps = React.ComponentProps<"div"> & {
  disableZoom?: boolean;
};
export function ZoomContainer({
  children,
  disableZoom,
  ...props
}: ZoomContainerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout>();

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsInteracting(true);

    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    hideTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, ZOOM_CONTROLS_TIMEOUT);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (disableZoom) return;

      const delta = e.deltaY * -0.003;
      setZoom((prev) => {
        const newZoom = Math.min(Math.max(0.1, prev + delta), 5);
        return Number(newZoom.toFixed(2));
      });

      setIsInteracting(true);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }

      hideTimeout.current = setTimeout(() => {
        setIsInteracting(false);
      }, ZOOM_CONTROLS_TIMEOUT);
    },
    [disableZoom],
  );

  const handleZoomChange = useCallback(
    (value: number[]) => {
      if (disableZoom) return;
      setZoom(value[0]);
    },
    [disableZoom],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disableZoom) return;
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });

        setIsInteracting(true);
        if (hideTimeout.current) {
          clearTimeout(hideTimeout.current);
        }
      }
    },
    [pan, disableZoom],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    hideTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, ZOOM_CONTROLS_TIMEOUT);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (disableZoom) {
      resetView();
    }
  }, [disableZoom, resetView]);

  return (
    <div
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        {
          "cursor-grab": !disableZoom && !isDragging,
          "cursor-grabbing": isDragging,
        },
      )}
      {...props}
    >
      <div
        className={cn(
          "relative h-full w-full origin-center transition-transform duration-100 ease-out",
        )}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {children}
      </div>
      {!disableZoom && (
        <ZoomSlider
          isInteracting={isInteracting}
          zoom={zoom}
          setZoom={setZoom}
          handleZoomChange={handleZoomChange}
          resetView={resetView}
        />
      )}
    </div>
  );
}

interface ZoomSliderProps extends React.ComponentProps<"div"> {
  isInteracting: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  handleZoomChange: (value: number[]) => void;
  resetView: () => void;
}
export function ZoomSlider({
  isInteracting,
  zoom,
  setZoom,
  handleZoomChange,
  resetView,
  ...props
}: ZoomSliderProps) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur transition-opacity duration-100",
        {
          "opacity-100": isInteracting,
          "pointer-events-none opacity-0 hover:pointer-events-auto hover:opacity-100":
            !isInteracting,
        },
      )}
      {...props}
    >
      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
            disabled={zoom <= 0.1}
            className="size-8"
          >
            <ZoomOut />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom out</TooltipContent>
      </Tooltip>

      <Slider
        value={[zoom]}
        min={0.1}
        max={5}
        step={0.1}
        onValueChange={handleZoomChange}
        className="w-32"
      />

      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setZoom((prev) => Math.min(5, prev + 0.1))}
            disabled={zoom >= 5}
          >
            <ZoomIn />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetView}
            className="size-8"
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset view</TooltipContent>
      </Tooltip>
    </div>
  );
}
