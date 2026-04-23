"use client";
import React from "react";
import {
  Tabs as UITabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabsProps = {
  children: React.ReactNode;
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function Tabs({ className, ...props }: TabsProps) {
  return <UITabs className={cn("mt-2 min-w-[80%]", className)} {...props} />;
}

export { TabsList, TabsTrigger, TabsContent };
