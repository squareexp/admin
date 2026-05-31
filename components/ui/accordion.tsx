"use client";

import * as React from "react";
import { Accordion as HeroAccordion } from "@heroui/react";
import { cn } from "@/lib/utils";

type AccordionProps = React.ComponentProps<typeof HeroAccordion> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
};

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className, collapsible, type, ...props }, ref) => {
    void collapsible;

    return (
      <HeroAccordion
        ref={ref}
        className={className}
        allowsMultipleExpanded={type === "multiple"}
        variant="surface"
        {...props}
      >
        {children}
      </HeroAccordion>
    );
  },
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroAccordion.Item> & { value?: string }
>(({ className, value, ...props }, ref) => (
  <HeroAccordion.Item
    ref={ref}
    id={value}
    className={cn("border-b border-white/10", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof HeroAccordion.Trigger>, "children"> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <HeroAccordion.Heading className="flex">
    <HeroAccordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all",
        className,
      )}
      {...(props as unknown as Partial<React.ComponentProps<typeof HeroAccordion.Trigger>>)}
    >
      {children}
      <HeroAccordion.Indicator />
    </HeroAccordion.Trigger>
  </HeroAccordion.Heading>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroAccordion.Panel>
>(({ className, children, ...props }, ref) => (
  <HeroAccordion.Panel ref={ref} className="overflow-hidden text-sm" {...props}>
    <HeroAccordion.Body className={cn("pb-4 pt-0", className)}>
      {children}
    </HeroAccordion.Body>
  </HeroAccordion.Panel>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
