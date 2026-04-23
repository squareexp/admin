import * as React from "react"

import { glassInputClass } from "@/components/ui/glass"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-9 ${glassInputClass} py-1 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm`,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
