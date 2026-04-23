"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedButton from "./animated-button";

interface SupportCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "dark";
}

export function SupportCard({ icon: Icon, title, description, actionText, onClick, variant = "primary" }: SupportCardProps) {
  return (
    <div 
      className="bg-white rounded-3xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group border border-zinc-100"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
          <Icon className="w-7 h-7" />
        </div>
        
        <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 min-h-[80px]">
          {description}
        </p>

        <AnimatedButton 
            className="w-full text-sm h-12" 
            variant={variant === "dark" ? "primary" : "dark"}
        >
          {actionText}
        </AnimatedButton>
      </div>
    </div>
  );
}
