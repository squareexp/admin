"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import StarBorder from "./startborder";

interface AnimatedButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "outline" | "dark";
    className?: string;
    arrowPossition?: "left" | "right";
    isLoading?: boolean;
}

export default function AnimatedButton({
    children,
    variant = "primary",
    className,
    arrowPossition = "left",
    isLoading = false,
    disabled,
    ...props
}: AnimatedButtonProps) {
    const isDisabled = disabled || isLoading;

    const styles = {
        primary: {
            initialBg: "bg-[var(--sq-brand-action)]",
            hoverBg: "bg-black",
            initialText: "text-black",
            hoverText: "group-hover:text-white",
            chevronColor: "text-black group-hover:text-white",
            borderColor: "border-transparent",
            starColor: "white",
        },
        outline: {
            initialBg: "bg-transparent",
            hoverBg: "bg-white/10",
            initialText: "text-white",
            hoverText: "group-hover:text-white",
            chevronColor: "text-white",
            borderColor: "border-white/20",
            starColor: "var(--sq-brand-action)",
        },
        dark: {
            initialBg: "bg-black",
            hoverBg: "bg-[var(--sq-brand-action)]",
            initialText: "text-white",
            hoverText: "group-hover:text-black",
            chevronColor: "text-white group-hover:text-black",
            borderColor: "border-black",
            starColor: "var(--sq-brand-action)",
        },
    };

    const currentStyle = styles[variant];

    return (
        <StarBorder
            as={motion.button}
            color={currentStyle.starColor}
            speed="3s"
            thickness={2}
            className={cn(
                "group relative overflow-hidden cursor-pointer rounded-xl h-14 text-lg font-bold uppercase tracking-wide transition-colors duration-300",
                "star-border-container group-hover:animate-star-border",
                currentStyle.borderColor,
                className,
                isDisabled && "cursor-not-allowed opacity-60"
            )}
            innerClassName={cn(
                "relative z-10 w-full h-full flex items-center justify-center gap-3 overflow-hidden rounded-[inherit] px-8",
                currentStyle.initialBg,
                currentStyle.initialText
            )}
            initial="initial"
            whileHover={isLoading ? "initial" : "hover"}
            disabled={isDisabled}
            {...(props as any)}
        >
            <motion.span
                className={cn("absolute inset-0 z-0 block", currentStyle.hoverBg)}
                variants={{
                    initial: { x: "-100%" },
                    hover: { x: "0%" },
                }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
            />

            <span
                className={cn(
                    "relative z-10 flex items-center justify-center gap-3 w-full",
                    currentStyle.hoverText
                )}
            >
                {isLoading ? (
                    <Loader2
                        className={cn(
                            "w-5 h-5 animate-spin",
                            currentStyle.chevronColor
                        )}
                    />
                ) : (
                    arrowPossition === "left" && (
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
                    )
                )}
<span className="transition-colors duration-750">{children}</span>
                {!isLoading && arrowPossition === "right" && (
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
        </StarBorder>
    );
}