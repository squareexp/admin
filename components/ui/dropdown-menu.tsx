"use client";

import * as React from "react";
import { Dropdown, Label, Separator } from "@heroui/react";
import { Check, ChevronRight, Circle } from "lucide-react";

import {
  glassMenuContentClass,
  glassMenuItemClass,
  glassMenuLabelClass,
  glassMenuSeparatorClass,
} from "@/components/ui/glass";
import { cn } from "@/lib/utils";

const DropdownMenu = Dropdown;
const DropdownMenuTrigger = Dropdown.Trigger;
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

type DropdownMenuContentProps = Omit<
  React.ComponentProps<typeof Dropdown.Popover>,
  "children"
> & {
  children: React.ReactNode;
  sideOffset?: number;
};

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, sideOffset = 4, ...props }, ref) => (
    <Dropdown.Popover
      ref={ref}
      offset={sideOffset}
      className={cn(`${glassMenuContentClass} z-50 min-w-[8rem] overflow-hidden p-1`, className)}
      {...props}
    >
      <Dropdown.Menu className="max-h-[min(32rem,var(--visual-viewport-height)-2rem)] overflow-y-auto overflow-x-hidden">
        {children}
      </Dropdown.Menu>
    </Dropdown.Popover>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";

type DropdownMenuItemProps = Omit<
  React.ComponentProps<typeof Dropdown.Item>,
  "children"
> & {
  children?: React.ReactNode;
  disabled?: boolean;
  inset?: boolean;
  onSelect?: (event?: unknown) => void;
};

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, disabled, inset, onAction, onSelect, ...props }, ref) => (
    <Dropdown.Item
      ref={ref}
      isDisabled={disabled}
      className={cn(
        `relative flex cursor-default select-none items-center gap-2 px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 ${glassMenuItemClass}`,
        inset && "pl-8",
        className,
      )}
      onAction={() => {
        onAction?.();
        onSelect?.();
      }}
      {...props}
    >
      {children}
    </Dropdown.Item>
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps & { checked?: boolean }
>(({ checked, children, className, ...props }, ref) => (
  <DropdownMenuItem ref={ref} className={cn("pl-8", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked ? <Check className="h-4 w-4" /> : null}
    </span>
    {children}
  </DropdownMenuItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, ...props }, ref) => (
    <DropdownMenuItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </DropdownMenuItem>
  ),
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuItem ref={ref} className={cn(inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuItem>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = DropdownMenuContent;

const DropdownMenuLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(`px-2 py-1.5 text-sm font-semibold ${glassMenuLabelClass}`, inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn(`-mx-1 my-1 h-px ${glassMenuSeparatorClass}`, className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
