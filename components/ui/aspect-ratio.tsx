"use client";

import * as React from "react";
import { Surface } from "@heroui/react";

import { cn } from "@/lib/utils";

type AspectRatioProps = React.ComponentProps<typeof Surface> & {
  ratio?: number;
};

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 16 / 9, style, ...props }, ref) => (
    <Surface
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    />
  ),
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
