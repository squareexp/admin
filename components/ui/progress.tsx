"use client";

import * as React from "react";
import { ProgressBar as HeroProgressBar } from "@heroui/react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroProgressBar>
>(({ className, value, ...props }, ref) => (
  <HeroProgressBar
    ref={ref}
    aria-label={props["aria-label"] ?? "Progress"}
    className={cn("w-full", className)}
    value={value}
    {...props}
  >
    <HeroProgressBar.Track className="h-2 rounded-full bg-primary/20">
      <HeroProgressBar.Fill className="rounded-full bg-primary" />
    </HeroProgressBar.Track>
  </HeroProgressBar>
));
Progress.displayName = "Progress";

export { Progress };
