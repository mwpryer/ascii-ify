import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
);

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & VariantProps<typeof inputVariants>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(inputVariants(), className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input, inputVariants };
