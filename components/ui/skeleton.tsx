"use client";

import { Skeleton as HeroSkeleton } from "@heroui/react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeroSkeleton
      className={cn("rounded-md bg-white/8", className)}
      {...props}
    />
  );
}

export { Skeleton };
