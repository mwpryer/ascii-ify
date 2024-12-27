import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type ControlsHeadingLabelProps = React.ComponentProps<typeof Label>;
export function ControlsHeadingLabel({
  className,
  ...props
}: ControlsHeadingLabelProps) {
  return (
    <Label
      className={cn(
        "text-xs font-semibold uppercase text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
