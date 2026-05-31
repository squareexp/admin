"use client";

import * as React from "react";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleButtonGroup>,
  "children" | "onChange"
> &
  VariantProps<typeof toggleVariants> & {
    children?: React.ReactNode;
    onValueChange?: (value: string | string[]) => void;
    type?: "single" | "multiple";
    value?: string | string[];
  };

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ children, className, onValueChange, size, type = "single", value, variant, ...props }, ref) => (
    <ToggleButtonGroup
      ref={ref}
      selectionMode={type === "multiple" ? "multiple" : "single"}
      selectedKeys={
        value == null ? undefined : new Set(Array.isArray(value) ? value : [value])
      }
      className={cn("flex items-center justify-center gap-1", className)}
      onSelectionChange={(keys) => {
        const nextValue = Array.from(keys).map(String);
        onValueChange?.(type === "multiple" ? nextValue : nextValue[0] ?? "");
      }}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleButtonGroup>
  ),
);

ToggleGroup.displayName = "ToggleGroup";

type ToggleGroupItemProps = Omit<React.ComponentProps<typeof ToggleButton>, "variant"> &
  VariantProps<typeof toggleVariants> & {
    value: string;
  };

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);

    return (
      <ToggleButton
        ref={ref}
        id={value}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          className,
        )}
        {...props}
      >
        {children}
      </ToggleButton>
    );
  },
);

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
