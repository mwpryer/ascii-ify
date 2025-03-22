import React, { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { DisplayFullscreenButton } from "@/components/display/display-fullscreen-button";
import { DisplayToggle } from "@/components/display/display-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";

type DisplayContainerProps = React.ComponentProps<"div">;
export function DisplayContainer({ children }: DisplayContainerProps) {
  return <div className="flex h-full w-full flex-col">{children}</div>;
}

type DisplayActionsContainerProps = React.ComponentProps<"div">;
export function DisplayActionsContainer({
  children,
}: DisplayActionsContainerProps) {
  return (
    <div className="grid grid-cols-[auto,1fr] items-center gap-2 border-b bg-sidebar p-2">
      <div className="flex gap-2">
        <SidebarTrigger />
        {children}
      </div>
      <DisplayToggle />
    </div>
  );
}

type DisplayCanvasContainerProps = React.ComponentProps<"div">;
export function DisplayCanvasContainer({
  children,
}: DisplayCanvasContainerProps) {
  return (
    <div id="preview-container" className="relative flex-1 overflow-hidden">
      {children}
      <div className="absolute right-2 top-2 z-[100]">
        <DisplayFullscreenButton containerId="preview-container" />
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
    }, 2000);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (disableZoom) return;

      // Adjusted sensitivity
      const delta = e.deltaY * -0.003;
      setZoom((prev) => {
        const newZoom = Math.min(Math.max(0.1, prev + delta), 5);
        return Number(newZoom.toFixed(2));
      });

      // Show controls when scrolling
      setIsInteracting(true);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      hideTimeout.current = setTimeout(() => {
        setIsInteracting(false);
      }, 2000);
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
        "absolute bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur transition-opacity duration-300",
        isInteracting
          ? "opacity-100"
          : "pointer-events-none opacity-0 hover:pointer-events-auto hover:opacity-100",
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
      >
        <ZoomOut className="size-4" />
      </Button>
      <Slider
        value={[zoom]}
        min={0.1}
        max={5}
        step={0.1}
        onValueChange={handleZoomChange}
        className="w-32"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setZoom((prev) => Math.min(5, prev + 0.1))}
      >
        <ZoomIn className="size-4" />
      </Button>
      <div className="mx-2 h-8 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={resetView}
        title="Reset view"
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}
