import * as React from "react";
import { Chip } from "@heroui/react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeVariants = ({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: BadgeVariant | null;
} = {}) =>
  cn(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    variant === "outline" && "bg-transparent text-foreground",
    className,
  );

export interface BadgeProps
  extends Omit<React.ComponentProps<typeof Chip>, "color" | "variant"> {
  variant?: BadgeVariant;
}

function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const color = variant === "destructive" ? "danger" : variant === "secondary" ? "default" : "accent";

  return (
    <Chip
      color={color}
      variant={variant === "outline" ? "tertiary" : variant === "secondary" ? "secondary" : "primary"}
      className={badgeVariants({ variant, className })}
      {...props}
    >
      {children}
    </Chip>
  );
}

export { Badge, badgeVariants };
