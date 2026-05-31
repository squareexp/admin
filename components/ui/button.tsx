"use client";

import * as React from "react";
import {
  Button as HeroButton,
  type ButtonProps as HeroButtonRootProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";

type LegacyButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "primary"
  | "tertiary"
  | "danger";

type LegacyButtonSize = "default" | "sm" | "lg" | "icon";

const variantClassNames: Record<LegacyButtonVariant, string> = {
  default: "",
  primary: "",
  destructive: "",
  danger: "",
  outline: "",
  secondary: "",
  tertiary: "",
  ghost: "",
  link: "border-transparent bg-transparent px-0 text-sq-brand-action shadow-none hover:bg-transparent hover:underline",
};

const sizeClassNames: Record<LegacyButtonSize, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8 text-sm",
  icon: "h-9 w-9 px-0",
};

const heroVariantMap: Record<
  LegacyButtonVariant,
  NonNullable<HeroButtonRootProps["variant"]>
> = {
  default: "primary",
  primary: "primary",
  destructive: "danger",
  danger: "danger",
  outline: "outline",
  secondary: "secondary",
  tertiary: "tertiary",
  ghost: "ghost",
  link: "ghost",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: LegacyButtonVariant | null;
  size?: LegacyButtonSize | null;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantClassNames[variant ?? "default"],
    sizeClassNames[size ?? "default"],
    className,
  );
}

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  asChild?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  onPress?: HeroButtonRootProps["onPress"];
  size?: LegacyButtonSize;
  variant?: LegacyButtonVariant;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      children,
      className,
      disabled,
      fullWidth,
      isDisabled,
      isPending,
      onClick,
      onPress,
      size = "default",
      type,
      value,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const resolvedClassName = buttonVariants({ variant, size, className });

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string;
        onClick?: React.MouseEventHandler<HTMLElement>;
      }>;

      return React.cloneElement(child, {
        ...props,
        className: cn(resolvedClassName, child.props.className),
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event);
          onClick?.(event as React.MouseEvent<HTMLButtonElement>);
        },
      });
    }

    const heroProps = props as unknown as Partial<HeroButtonRootProps>;

    return (
      <HeroButton
        {...heroProps}
        ref={ref}
        className={resolvedClassName}
        fullWidth={fullWidth}
        isDisabled={disabled || isDisabled}
        isIconOnly={size === "icon"}
        isPending={isPending}
        type={type}
        value={typeof value === "string" ? value : undefined}
        variant={heroVariantMap[variant]}
        onPress={(event) => {
          onPress?.(event);
          onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }}
      >
        {children}
      </HeroButton>
    );
  },
);
Button.displayName = "Button";

export { Button };
