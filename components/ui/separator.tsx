"use client";

import * as React from "react";
import { Separator as HeroSeparator } from "@heroui/react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroSeparator> & { decorative?: boolean }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <HeroSeparator
    ref={ref}
    orientation={orientation}
    className={cn(
      "shrink-0",
      orientation === "horizontal" ? "w-full" : "h-full",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
