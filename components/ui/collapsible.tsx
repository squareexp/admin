"use client";

import * as React from "react";
import { Disclosure } from "@heroui/react";

type CollapsibleProps = Omit<React.ComponentProps<typeof Disclosure>, "isExpanded"> & {
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function Collapsible({
  defaultOpen,
  disabled,
  onOpenChange,
  open,
  ...props
}: CollapsibleProps) {
  return (
    <Disclosure
      defaultExpanded={defaultOpen}
      isDisabled={disabled}
      isExpanded={open}
      onExpandedChange={onOpenChange}
      {...props}
    />
  );
}

const CollapsibleTrigger = Disclosure.Trigger;
const CollapsibleContent = Disclosure.Content;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
