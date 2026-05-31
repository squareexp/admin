import * as React from "react";
import { Alert as HeroAlert } from "@heroui/react";

import { cn } from "@/lib/utils";

type AlertProps = React.ComponentProps<typeof HeroAlert> & {
  variant?: "default" | "destructive";
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <HeroAlert
      ref={ref}
      role="alert"
      status={variant === "destructive" ? "danger" : "default"}
      className={cn("relative w-full px-4 py-3 text-sm", className)}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof HeroAlert.Title>
>(({ className, ...props }, ref) => (
  <HeroAlert.Title ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof HeroAlert.Description>
>(({ className, ...props }, ref) => (
  <HeroAlert.Description ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
