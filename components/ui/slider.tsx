"use client";

import * as React from "react";
import { Slider as HeroSlider } from "@heroui/react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  React.ComponentProps<typeof HeroSlider>,
  "defaultValue" | "onChange" | "value"
> & {
  defaultValue?: number | number[];
  onValueChange?: (value: number[]) => void;
  value?: number | number[];
};

const firstValue = (value?: number | number[]) =>
  Array.isArray(value) ? value[0] : value;

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, defaultValue, onValueChange, value, ...props }, ref) => (
    <HeroSlider
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      defaultValue={firstValue(defaultValue)}
      value={firstValue(value)}
      onChange={(nextValue) => {
        if (typeof nextValue === "number") {
          onValueChange?.([nextValue]);
        }
      }}
      {...props}
    >
      <HeroSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <HeroSlider.Fill className="absolute h-full bg-primary" />
        <HeroSlider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </HeroSlider.Track>
    </HeroSlider>
  ),
);
Slider.displayName = "Slider";

export { Slider };
