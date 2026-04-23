"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // layout
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all duration-200 outline-none",
      // unchecked: dark translucent track
      "data-[state=unchecked]:border-white/15 data-[state=unchecked]:bg-white/10",
      // checked: brand lime track
      "data-[state=checked]:border-[#CDFF04]/30 data-[state=checked]:bg-[#CDFF04]",
      // focus ring
      "focus-visible:ring-2 focus-visible:ring-[#CDFF04]/40 focus-visible:ring-offset-0",
      // disabled
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full shadow-md ring-0 transition-all duration-200",
        // unchecked thumb: white/50
        "data-[state=unchecked]:translate-x-[3px] data-[state=unchecked]:bg-white/50",
        // checked thumb: near-black for contrast against lime
        "data-[state=checked]:translate-x-[17px] data-[state=checked]:bg-[#0a0c10]",
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
