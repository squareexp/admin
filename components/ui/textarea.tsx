"use client";

import * as React from "react";
import { TextArea as HeroTextArea } from "@heroui/react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <HeroTextArea
      ref={ref}
      fullWidth
      variant="secondary"
      className={cn("flex min-h-[60px] px-3 py-2 text-base md:text-sm", className)}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
