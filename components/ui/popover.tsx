"use client";

import * as React from "react";
import { Popover as HeroPopover } from "@heroui/react";

import { cn } from "@/lib/utils";

const Popover = HeroPopover;
const PopoverTrigger = HeroPopover.Trigger;

const PopoverAnchor = ({ children }: { children: React.ReactNode }) => <>{children}</>;

type PopoverContentProps = Omit<
  React.ComponentProps<typeof HeroPopover.Content>,
  "children"
> & {
  align?: "start" | "center" | "end";
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

const placementFor = (
  side?: PopoverContentProps["side"],
  align?: PopoverContentProps["align"],
) => {
  if (!side) return undefined;
  if (!align || align === "center") return side;
  return `${side} ${align}`;
};

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ align = "center", children, className, side, sideOffset = 4, ...props }, ref) => (
    <HeroPopover.Content
      ref={ref}
      offset={sideOffset}
      placement={placementFor(side, align) as React.ComponentProps<typeof HeroPopover.Content>["placement"]}
      className={cn("z-50 w-72 p-0", className)}
      {...props}
    >
      <HeroPopover.Dialog className="p-4 outline-none">{children}</HeroPopover.Dialog>
    </HeroPopover.Content>
  ),
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
