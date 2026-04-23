"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark";
}

export default function NubButton({ 
  children, 
  variant = "primary", 
  className,
  ...props 
}: NubButtonProps) {
  
  return (
    <button 
      className={cn(
        "relative w-[300px] h-[60px] cursor-pointer group transition-transform active:scale-95 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <svg 
        viewBox="0 0 545 107" 
        className={cn(
          "absolute inset-0 w-full h-full transition-colors",
          variant === "primary" && "text-[#D1F366] group-hover:text-[#bce045]",
          variant === "secondary" && "text-gray-100 group-hover:text-gray-200",
          variant === "dark" && "text-black group-hover:text-gray-900"
        )} 
        preserveAspectRatio="none"
      > 
         <path d="M376.5 0C395.912 1.77768e-06 412.908 10.3387 422.284 25.8096C424.816 29.9874 429.115 33 434 33C438.885 33 443.184 29.9874 445.716 25.8096C455.092 10.3387 472.088 0 491.5 0C521.047 0 545 23.9528 545 53.5C545 83.0472 521.047 107 491.5 107C472.63 107 456.043 97.2309 446.519 82.4746C443.719 78.1371 439.163 75 434 75C428.837 75 424.281 78.1371 421.481 82.4746C411.957 97.2309 395.37 107 376.5 107H53.5C23.9528 107 0 83.0472 0 53.5C0 23.9528 23.9528 0 53.5 0H376.5Z" fill="currentColor"/>
      </svg>
      
      <span className={cn(
        "relative z-10 text-lg font-bold pr-16 select-none",
        variant === "dark" ? "text-white" : "text-black"
      )}>
        {children}
      </span>
      
      <div className="absolute right-[5px] top-1/2 -translate-y-1/2 w-12 h-12 z-20">
         <Image 
           src="/icons/arrow_circled.png" 
           alt="Arrow" 
           fill
           className={cn(
             "object-contain -rotate-45 transition-opacity",
             variant === "secondary" && "opacity-60 group-hover:opacity-100",
             variant === "dark" && "invert bg-white/20 rounded-full " 
           )} 
         />
      </div>
    </button>
  );
}
