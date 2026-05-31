"use client";

import * as React from "react";
import { Popover as HeroPopover } from "@heroui/react";

import { cn } from "@/lib/utils";

const HoverCard = HeroPopover;
const HoverCardTrigger = HeroPopover.Trigger;

type HoverCardContentProps = Omit<
  React.ComponentProps<typeof HeroPopover.Content>,
  "children"
> & {
  align?: "start" | "center" | "end";
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ align = "center", children, className, side, sideOffset = 4, ...props }, ref) => (
    <HeroPopover.Content
      ref={ref}
      offset={sideOffset}
      placement={
        (side && align !== "center" ? `${side} ${align}` : side) as React.ComponentProps<
          typeof HeroPopover.Content
        >["placement"]
      }
      className={cn("z-50 w-64 p-0", className)}
      {...props}
    >
      <HeroPopover.Dialog className="p-4 outline-none">{children}</HeroPopover.Dialog>
    </HeroPopover.Content>
  ),
);
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
