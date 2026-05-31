"use client";

import * as React from "react";
import { Tabs as HeroTabs } from "@heroui/react";
import { cn } from "@/lib/utils";

type TabsProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ children, className, defaultValue, onValueChange, value }, ref) => (
    <HeroTabs
      ref={ref}
      className={className}
      defaultSelectedKey={defaultValue}
      selectedKey={value}
      variant="secondary"
      onSelectionChange={(key) => onValueChange?.(String(key))}
    >
      {children}
    </HeroTabs>
  ),
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <HeroTabs.ListContainer ref={ref} className={cn("inline-flex", className)} {...props}>
    <HeroTabs.List aria-label="Tabs">{children}</HeroTabs.List>
  </HeroTabs.ListContainer>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, disabled, value, ...props }, ref) => (
  <HeroTabs.Tab
    {...(props as unknown as Partial<React.ComponentProps<typeof HeroTabs.Tab>>)}
    ref={ref}
    id={value}
    isDisabled={disabled}
    className={cn("inline-flex items-center justify-center whitespace-nowrap py-1 text-sm font-medium", className)}
  >
    {children}
    <HeroTabs.Indicator />
  </HeroTabs.Tab>
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => (
  <HeroTabs.Panel
    {...(props as unknown as Partial<React.ComponentProps<typeof HeroTabs.Panel>>)}
    ref={ref}
    id={value}
    className={cn("mt-2 focus-visible:outline-none", className)}
  >
    {children}
  </HeroTabs.Panel>
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
