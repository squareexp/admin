"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // base layout
      "group relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border outline-none transition-all duration-150",
      // unchecked state
      "border-white/20 bg-white/4",
      // checked state — solid brand lime fill
      "data-[state=checked]:border-[#CDFF04]/50 data-[state=checked]:bg-[#CDFF04]",
      // focus ring
      "focus-visible:ring-2 focus-visible:ring-[#CDFF04]/40 focus-visible:ring-offset-0",
      // disabled
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check
        className="h-3 w-3 text-[#0a0c10]"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
