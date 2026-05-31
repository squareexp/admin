"use client";

import * as React from "react";
import {
  Label as HeroLabel,
  ListBox,
  Select as HeroSelect,
  Separator as HeroSeparator,
} from "@heroui/react";
import { cn } from "@/lib/utils";

type SelectRootProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
};

const Select = React.forwardRef<HTMLDivElement, SelectRootProps>(
  (
    {
      children,
      className,
      defaultValue,
      disabled,
      onValueChange,
      placeholder,
      value,
      ...props
    },
    ref,
  ) => (
    <HeroSelect
      ref={ref}
      fullWidth
      className={className}
      defaultSelectedKey={defaultValue}
      isDisabled={disabled}
      placeholder={placeholder}
      selectedKey={value}
      variant="secondary"
      onSelectionChange={(key) => {
        if (key == null) return;
        onValueChange?.(String(key));
      }}
      {...props}
    >
      {children}
    </HeroSelect>
  ),
);
Select.displayName = "Select";

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectValue = ({
  className,
  placeholder,
}: {
  className?: string;
  placeholder?: string;
}) => (
  <HeroSelect.Value className={className}>
    {(state: { selectedText?: React.ReactNode }) =>
      state.selectedText ?? (
        <span className="text-field-placeholder">{placeholder}</span>
      )
    }
  </HeroSelect.Value>
);
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof HeroSelect.Trigger>, "children"> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <HeroSelect.Trigger
    ref={ref}
    className={cn("flex min-h-9 items-center justify-between", className)}
    {...props}
  >
    {children}
    <HeroSelect.Indicator />
  </HeroSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof HeroSelect.Popover>, "children"> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <HeroSelect.Popover
    ref={ref}
    className={cn("min-w-[var(--trigger-width)] p-1", className)}
    {...props}
  >
    <ListBox>{children}</ListBox>
  </HeroSelect.Popover>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof ListBox.Item>, "children" | "id" | "value"> & {
    children?: React.ReactNode;
    value: string;
  }
>(({ className, children, textValue, value, ...props }, ref) => (
  <ListBox.Item
    ref={ref}
    id={value}
    textValue={textValue ?? (typeof children === "string" ? children : value)}
    className={cn("flex items-center gap-2 px-2.5 py-2 text-sm", className)}
    {...props}
  >
    {children}
    <ListBox.ItemIndicator className="ml-auto" />
  </ListBox.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof HeroLabel>
>(({ className, ...props }, ref) => (
  <HeroLabel ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroSeparator>
>(({ className, ...props }, ref) => (
  <HeroSeparator ref={ref} className={cn("my-1", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
