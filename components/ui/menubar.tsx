"use client";

import * as React from "react";
import { Button, Dropdown, Label, Separator, Surface } from "@heroui/react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const Menubar = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Surface>>(
  ({ className, ...props }, ref) => (
    <Surface
      ref={ref}
      className={cn("flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm", className)}
      {...props}
    />
  ),
);
Menubar.displayName = "Menubar";

const MenubarMenu = Dropdown;
const MenubarGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MenubarSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={cn("flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground", className)}
      {...props}
    />
  ),
);
MenubarTrigger.displayName = "MenubarTrigger";

type MenubarContentProps = Omit<React.ComponentProps<typeof Dropdown.Popover>, "children"> & {
  children: React.ReactNode;
};

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ children, className, ...props }, ref) => (
    <Dropdown.Popover ref={ref} className={cn("z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown.Popover>
  ),
);
MenubarContent.displayName = "MenubarContent";

type MenubarItemProps = Omit<React.ComponentProps<typeof Dropdown.Item>, "children"> & {
  children?: React.ReactNode;
  disabled?: boolean;
  inset?: boolean;
};

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, disabled, inset, ...props }, ref) => (
    <Dropdown.Item
      ref={ref}
      isDisabled={disabled}
      className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)}
      {...props}
    />
  ),
);
MenubarItem.displayName = "MenubarItem";

const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, inset, children, ...props }, ref) => (
    <MenubarItem ref={ref} className={cn(inset && "pl-8", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </MenubarItem>
  ),
);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = MenubarContent;

const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarItemProps & { checked?: boolean }>(
  ({ className, checked, children, ...props }, ref) => (
    <MenubarItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </MenubarItem>
  ),
);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

const MenubarRadioItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, children, ...props }, ref) => (
    <MenubarItem ref={ref} className={cn("pl-8", className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </MenubarItem>
  ),
);
MenubarRadioItem.displayName = "MenubarRadioItem";

const MenubarLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
));
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => (
    <Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  ),
);
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
