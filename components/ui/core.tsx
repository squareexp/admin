import React from "react";
import {
  glassButtonAccentClass,
  glassButtonGhostClass,
  glassButtonNeutralClass,
  glassIconButtonClass,
  glassInputClass,
} from "@/components/ui/glass";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-gray-400 pl-1">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            `flex h-11 ${glassInputClass} px-4 py-2 text-sm`,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: glassButtonAccentClass,
      secondary: glassButtonNeutralClass,
      ghost: glassButtonGhostClass,
      icon: cn(glassIconButtonClass, "h-10 w-10 p-0"),
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-[14px] px-8 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
