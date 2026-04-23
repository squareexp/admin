"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "dark";
  className?: string;
  arrowPossition?: "left" | "right";
}

export default function AnimatedButton({
  children,
  variant = "primary",
  className,
  arrowPossition = "left",
  ...props
}: AnimatedButtonProps) {
  // Define colors based on variant
  const styles = {
    primary: {
      initialBg: "bg-[var(--sq-brand-action)]",
      hoverBg: "bg-black",
      initialText: "text-black",
      hoverText: "group-hover:text-white",
      chevronColor: "text-black group-hover:text-white",
      borderColor: "border-transparent",
    },
    outline: {
      initialBg: "bg-transparent",
      hoverBg: "bg-white/10",
      initialText: "text-white",
      hoverText: "group-hover:text-white",
      chevronColor: "text-white",
      borderColor: "border-white/20",
    },
    dark: {
      initialBg: "bg-black",
      hoverBg: "bg-[var(--sq-brand-action)]",
      initialText: "text-white",
      hoverText: "group-hover:text-black",
      chevronColor: "text-white group-hover:text-black",
      borderColor: "border-black",
    },
  };

  const currentStyle = styles[variant];

  return (
    <motion.button
      className={cn(
        "group relative overflow-hidden cursor-pointer rounded-xl px-8 h-14 text-lg font-bold uppercase tracking-wide border transition-colors duration-300",
        currentStyle.initialBg,
        currentStyle.initialText,
        currentStyle.borderColor,
        className
      )}
      initial="initial"
      whileHover="hover"
      {...(props as any)}
    >
      {/* Sliding Background Layer - Changed to span for valid HTML */}
      <motion.span
        className={cn("absolute inset-0 z-0 block", currentStyle.hoverBg)}
        variants={{
          initial: { x: "-100%" },
          hover: { x: "0%" },
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
      />

      {/* Content */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center gap-3",
          currentStyle.hoverText
        )}
      >
        {arrowPossition === "left" && (
          <motion.span
            variants={{
              initial: { x: 0 },
              hover: { x: 3 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center"
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-colors duration-750",
                currentStyle.chevronColor
              )}
            />
          </motion.span>
        )}
        <span className="transition-colors duration-750">{children}</span>
        {arrowPossition === "right" && (
          <motion.span
            variants={{
              initial: { x: 0 },
              hover: { x: 3 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center"
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-colors duration-750",
                currentStyle.chevronColor
              )}
            />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}
