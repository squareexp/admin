"use client";

import * as React from "react";
import { ToggleButton } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const toggleVariants = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 selected:bg-accent selected:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-9 min-w-9 px-2",
      sm: "h-8 min-w-8 px-1.5",
      lg: "h-10 min-w-10 px-2.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ToggleProps = Omit<React.ComponentProps<typeof ToggleButton>, "variant"> &
  VariantProps<typeof toggleVariants> & {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
  };

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      defaultPressed,
      isSelected,
      onPressedChange,
      onChange,
      pressed,
      size,
      variant,
      ...props
    },
    ref,
  ) => (
    <ToggleButton
      ref={ref}
      className={cn(toggleVariants({ variant, size }), className)}
      defaultSelected={defaultPressed}
      isSelected={pressed ?? isSelected}
      onChange={(selected: boolean) => {
        onChange?.(selected);
        onPressedChange?.(selected);
      }}
      variant={variant === "outline" ? "ghost" : "default"}
      {...props}
    />
  ),
);

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
