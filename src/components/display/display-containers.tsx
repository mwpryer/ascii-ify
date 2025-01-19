import React from "react";

import { cn } from "@/lib/utils";
import { DisplayToggle } from "@/components/display/display-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DisplayContainerProps = React.ComponentProps<"div">;
export function DisplayContainer({ children }: DisplayContainerProps) {
  return <div className="h-full w-full">{children}</div>;
}

type DisplayActionsContainerProps = React.ComponentProps<"div">;
export function DisplayActionsContainer({
  children,
}: DisplayActionsContainerProps) {
  return (
    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 bg-sidebar p-2">
      <div className="flex gap-2">{children}</div>
      <DisplayToggle />
      <SidebarTrigger className="place-self-end" />
    </div>
  );
}

type DisplayCanvasContainerProps = React.ComponentProps<"div">;
export function DisplayCanvasContainer({
  children,
}: DisplayCanvasContainerProps) {
  return (
    <div className="relative aspect-[640/480] w-full overflow-hidden border-t md:h-[480px] md:min-w-[640px] xl:h-[calc(480px*1.4)] xl:min-w-[calc(640px*1.4)]">
      {children}
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
    className={cn("absolute inset-0 w-full", className)}
    ref={ref}
    {...props}
  />
));
