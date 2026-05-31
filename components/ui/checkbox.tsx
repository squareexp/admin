"use client";

import * as React from "react";
import { Checkbox as HeroCheckbox } from "@heroui/react";
import { cn } from "@/lib/utils";

type HeroCheckboxProps = React.ComponentProps<typeof HeroCheckbox>;

interface CheckboxProps
  extends Omit<
    HeroCheckboxProps,
    "children" | "defaultSelected" | "isSelected" | "onChange"
  > {
  checked?: boolean;
  children?: React.ReactNode;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  (
    {
      checked,
      children,
      className,
      defaultChecked,
      disabled,
      isDisabled,
      onCheckedChange,
      variant = "primary",
      ...props
    },
    ref,
  ) => (
    <HeroCheckbox
      ref={ref}
      className={cn("items-center gap-2", className)}
      defaultSelected={defaultChecked}
      isDisabled={disabled || isDisabled}
      isSelected={checked}
      variant={variant}
      onChange={onCheckedChange}
      {...props}
    >
      <HeroCheckbox.Control>
        <HeroCheckbox.Indicator />
      </HeroCheckbox.Control>
      {children ? <HeroCheckbox.Content>{children}</HeroCheckbox.Content> : null}
    </HeroCheckbox>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
