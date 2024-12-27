import { LucideIcon } from "lucide-react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DisplayActionButtonProps extends ButtonProps {
  icon: LucideIcon;
  tooltip?: string;
  loading?: boolean;
}

export function DisplayActionButton({
  icon: Icon,
  tooltip,
  loading,
  disabled,
  ...props
}: DisplayActionButtonProps) {
  const button = (
    <Button
      variant="outline"
      size="icon"
      disabled={disabled || loading}
      aria-label={tooltip}
      {...props}
    >
      <Icon />
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
