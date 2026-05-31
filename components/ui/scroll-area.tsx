"use client";

import * as React from "react";
import { ScrollShadow } from "@heroui/react";

import { cn } from "@/lib/utils";

type ScrollAreaProps = React.ComponentProps<typeof ScrollShadow>;

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <ScrollShadow
      ref={ref}
      className={cn("relative overflow-auto", className)}
      hideScrollBar={false}
      {...props}
    >
      {children}
    </ScrollShadow>
  ),
);
ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      "pointer-events-none absolute rounded-full bg-border/60",
      orientation === "vertical" ? "right-1 top-1 h-[calc(100%-0.5rem)] w-1" : "bottom-1 left-1 h-1 w-[calc(100%-0.5rem)]",
      className,
    )}
    {...props}
  />
));
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
