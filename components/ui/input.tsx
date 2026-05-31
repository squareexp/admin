"use client";

import * as React from "react";
import { Input as HeroInput } from "@heroui/react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <HeroInput
        ref={ref}
        fullWidth
        type={type}
        variant="secondary"
        className={cn("flex h-9 px-3 py-1 text-base md:text-sm", className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
