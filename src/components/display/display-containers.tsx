import React from "react";

import { cn } from "@/lib/utils";
import { DisplayToggle } from "@/components/display/display-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DisplayFullscreenButton } from "@/components/display/display-fullscreen-button";

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
      <div className="absolute right-2 top-2 z-50">
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
