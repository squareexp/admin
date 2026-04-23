export const glassInteractiveBaseClass =
  "border border-white/10 bg-white/5 text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/18 focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"

export const glassButtonBaseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] font-medium"

export const glassButtonNeutralClass = `${glassButtonBaseClass} ${glassInteractiveBaseClass}`

export const glassButtonAccentClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-200 hover:bg-[rgba(205,255,4,0.16)] hover:text-[var(--sq-brand-action)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(205,255,4,0.3)] disabled:cursor-not-allowed disabled:opacity-50"

export const glassButtonDangerClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-rose-400/22 bg-rose-400/10 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-200 hover:bg-rose-400/16 hover:text-white focus-visible:outline-none focus-visible:ring-0 focus-visible:border-rose-400/30 disabled:cursor-not-allowed disabled:opacity-50"

export const glassButtonGhostClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-transparent bg-transparent text-white/55 transition-all duration-200 hover:border-white/10 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/16"

export const glassIconButtonClass =
  `flex h-9 w-9 items-center justify-center rounded-full ${glassInteractiveBaseClass}`

export const glassPillButtonClass =
  `inline-flex items-center justify-center gap-2 rounded-full px-3 ${glassInteractiveBaseClass}`

export const glassPillAccentButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-3 border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-200 hover:bg-[rgba(205,255,4,0.16)] hover:text-[var(--sq-brand-action)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(205,255,4,0.3)] disabled:cursor-not-allowed disabled:opacity-50"

export const glassInputClass =
  "w-full rounded-[14px] border border-white/10 bg-white/5 px-3 text-sm text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-200 placeholder:text-white/35 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/18 focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"

export const glassMenuContentClass =
  "rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.98),rgba(8,12,18,0.98))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"

export const glassMenuItemClass =
  "rounded-[12px] text-white/70 transition-all focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white"

export const glassMenuDangerItemClass =
  "rounded-[12px] text-rose-200 transition-all focus:bg-rose-400/12 focus:text-rose-100 data-[state=open]:bg-rose-400/12 data-[state=open]:text-rose-100"

export const glassMenuLabelClass = "text-white/50"

export const glassMenuSeparatorClass = "bg-white/10"

export const glassTabsListClass =
  "inline-flex items-center justify-center rounded-[16px] border border-white/10 bg-white/5 p-1 text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"

export const glassTabsTriggerClass =
  "rounded-[12px] px-3 text-white/60 transition-all hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"

export const glassDialogContentClass =
  "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.98),rgba(8,12,18,0.98))] text-white shadow-[0_32px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl"

export const glassDialogCloseClass =
  `absolute right-4 top-4 ${glassIconButtonClass} h-9 w-9`

export const glassSegmentedControlClass =
  "flex overflow-hidden rounded-[16px] border border-white/10 bg-white/5 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"

export const glassSegmentedItemClass =
  "rounded-[14px] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/58 transition-all hover:text-white"

export const glassSegmentedItemActiveClass =
  "bg-white/10 text-white"
