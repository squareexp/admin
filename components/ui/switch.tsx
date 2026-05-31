"use client";

import * as React from "react";
import { Switch as HeroSwitch } from "@heroui/react";
import { cn } from "@/lib/utils";

type HeroSwitchProps = React.ComponentProps<typeof HeroSwitch>;

interface SwitchProps
  extends Omit<
    HeroSwitchProps,
    "children" | "defaultSelected" | "isSelected" | "onChange"
  > {
  checked?: boolean;
  children?: React.ReactNode;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(
  (
    {
      checked,
      children,
      className,
      defaultChecked,
      disabled,
      isDisabled,
      onCheckedChange,
      size = "sm",
      ...props
    },
    ref,
  ) => (
    <HeroSwitch
      ref={ref}
      className={cn("items-center gap-2", className)}
      defaultSelected={defaultChecked}
      isDisabled={disabled || isDisabled}
      isSelected={checked}
      size={size}
      onChange={onCheckedChange}
      {...props}
    >
      <HeroSwitch.Control>
        <HeroSwitch.Thumb />
      </HeroSwitch.Control>
      {children ? <HeroSwitch.Content>{children}</HeroSwitch.Content> : null}
    </HeroSwitch>
  ),
);
Switch.displayName = "Switch";

export { Switch };
