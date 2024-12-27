import { useState } from "react";
import { Check, Copy } from "lucide-react";

import {
  DisplayActionButton,
  DisplayActionButtonProps,
} from "@/components/display/display-action-button";

interface DisplayCopyButtonProps
  extends Omit<DisplayActionButtonProps, "icon" | "loading"> {
  onCopy: () => Promise<boolean>;
}

export function DisplayCopyButton({
  onCopy,
  tooltip,
  disabled,
  ...props
}: DisplayCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    if (await onCopy()) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  return (
    <DisplayActionButton
      icon={isCopied ? Check : Copy}
      onClick={handleCopy}
      disabled={disabled || isCopied}
      tooltip={tooltip}
      {...props}
    />
  );
}
