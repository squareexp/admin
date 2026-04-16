import React from "react";
import { cn } from "@/libs/utils";

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
            "flex h-11 w-full rounded-xl bg-dark-700 px-4 py-2 text-sm text-gray-100 shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow disabled:cursor-not-allowed disabled:opacity-50",
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
      primary: "bg-brand-yellow text-black hover:bg-[#ccec40]",
      secondary: "bg-dark-700 text-gray-200 hover:bg-dark-600",
      ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-dark-700/50",
      icon: "h-10 w-10 p-0 rounded-full  bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 h-11 px-8",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
