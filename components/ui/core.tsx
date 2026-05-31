"use client";

import React from "react";
import {
  Button as HeroButton,
  Input as HeroInput,
  Label as HeroLabel,
  type ButtonProps as HeroButtonProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <HeroLabel htmlFor={inputId} className="pl-1 text-xs font-medium text-gray-400">
            {label}
          </HeroLabel>
        ) : null}
        <HeroInput
          ref={ref}
          id={inputId}
          fullWidth
          variant="secondary"
          className={cn("flex h-11 px-4 py-2 text-sm", className)}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  disabled?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  onPress?: HeroButtonProps["onPress"];
  variant?: "primary" | "secondary" | "ghost" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      disabled,
      isDisabled,
      isPending,
      onClick,
      onPress,
      type,
      value,
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const heroVariant =
      variant === "secondary" ? "secondary" : variant === "ghost" ? "ghost" : "primary";

    const heroProps = props as unknown as Partial<HeroButtonProps>;

    return (
      <HeroButton
        {...heroProps}
        ref={ref}
        className={cn(
          "inline-flex h-11 items-center justify-center px-8 text-sm font-medium",
          variant === "icon" && "h-10 w-10 px-0",
          className,
        )}
        isDisabled={disabled || isDisabled}
        isIconOnly={variant === "icon"}
        isPending={isPending}
        type={type}
        value={typeof value === "string" ? value : undefined}
        variant={heroVariant}
        onPress={(event) => {
          onPress?.(event);
          onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }}
      />
    );
  },
);
Button.displayName = "Button";
