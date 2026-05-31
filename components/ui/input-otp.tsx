"use client";

import * as React from "react";
import { InputOTP as HeroInputOTP } from "@heroui/react";
import { Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type InputOTPProps = React.ComponentProps<typeof HeroInputOTP> & {
  containerClassName?: string;
};

const InputOTP = React.forwardRef<React.ElementRef<typeof HeroInputOTP>, InputOTPProps>(
  ({ className, containerClassName, inputClassName, ...props }, ref) => (
    <HeroInputOTP
      ref={ref}
      className={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      inputClassName={cn("disabled:cursor-not-allowed", inputClassName, className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<typeof HeroInputOTP.Group>,
  React.ComponentProps<typeof HeroInputOTP.Group>
>(({ className, ...props }, ref) => (
  <HeroInputOTP.Group ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof HeroInputOTP.Slot>,
  React.ComponentProps<typeof HeroInputOTP.Slot>
>(({ className, ...props }, ref) => (
  <HeroInputOTP.Slot
    ref={ref}
    className={cn(
      "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      className,
    )}
    {...props}
  />
));
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<typeof HeroInputOTP.Separator>,
  React.ComponentProps<typeof HeroInputOTP.Separator>
>(({ className, children, ...props }, ref) => (
  <HeroInputOTP.Separator
    ref={ref}
    role="separator"
    className={cn("px-1 text-muted-foreground", className)}
    {...props}
  >
    {children ?? <Minus className="h-4 w-4" />}
  </HeroInputOTP.Separator>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
