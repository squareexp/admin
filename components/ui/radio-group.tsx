"use client";

import * as React from "react";
import { Radio, RadioGroup as HeroRadioGroup } from "@heroui/react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroRadioGroup>
>(({ className, ...props }, ref) => (
  <HeroRadioGroup ref={ref} className={cn("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

type RadioGroupItemProps = Omit<React.ComponentProps<typeof Radio>, "children"> & {
  children?: React.ReactNode;
};

const RadioGroupItem = React.forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ className, children, ...props }, ref) => (
    <Radio
      ref={ref}
      className={cn("inline-flex items-center gap-2 text-sm", className)}
      {...props}
    >
      {children}
    </Radio>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
