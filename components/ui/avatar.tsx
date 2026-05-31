"use client";

import * as React from "react";
import { Avatar as HeroAvatar } from "@heroui/react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroAvatar>
>(({ className, ...props }, ref) => (
  <HeroAvatar
    ref={ref}
    className={cn("relative h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<typeof HeroAvatar.Image>
>(({ className, ...props }, ref) => (
  <HeroAvatar.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof HeroAvatar.Fallback>
>(({ className, ...props }, ref) => (
  <HeroAvatar.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
