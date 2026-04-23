import { cn } from "@/lib/utils"
import { glassInputClass, glassPillAccentButtonClass, glassPillButtonClass } from "./glass"

export const compactTextareaClassName = cn(
    glassInputClass,
    "min-h-[76px] rounded-[16px] px-2 py-2 text-[10px] placeholder:text-white/28",
  )
export const compactPillButtonClassName = cn(
    glassPillButtonClass,
    "h-8 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]",
  )
export const compactAccentButtonClassName = cn(
    glassPillAccentButtonClass,
    "h-8 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em]",
  )
export const compactMiniButtonClassName = cn(
    glassPillButtonClass,
    "h-7 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
  )
export const compactMiniAccentButtonClassName = cn(
    glassPillAccentButtonClass,
    "h-7 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
  )

   export const compactInputClassName = cn(
      glassInputClass,
      "h-7 rounded-[12px] px-2 text-[10px] placeholder:text-white/28",
    )
  