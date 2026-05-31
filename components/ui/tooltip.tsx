"use client";

import * as React from "react";
import { Tooltip as HeroTooltip } from "@heroui/react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: { children: React.ReactNode; delayDuration?: number }) => (
  <>{children}</>
);

const Tooltip = HeroTooltip;

const TooltipTrigger = ({
  asChild,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  children: React.ReactNode;
}) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return (
    <HeroTooltip.Trigger className={className} {...props}>
      {children}
    </HeroTooltip.Trigger>
  );
};
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroTooltip.Content> & {
    align?: "start" | "center" | "end";
    hidden?: boolean;
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
  }
>(({ align, className, hidden, side, sideOffset, ...props }, ref) => {
  if (hidden) return null;

  void align;

  return (
    <HeroTooltip.Content
      ref={ref}
      offset={sideOffset}
      placement={side}
      className={cn("z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground", className)}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
