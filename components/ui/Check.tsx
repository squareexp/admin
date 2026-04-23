
function Check({ isChecked, onClick }: { isChecked: boolean; onClick: () => void }) {
  return (
      <button
          type="button"
          onClick={onClick}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] transition ${isChecked
                  ? "border-[rgba(205,255,4,0.3)] bg-[rgba(205,255,4,0.15)] text-sq-brand-action"
                  : "border-white/20 text-transparent"
              }`}
      >
          ✓
      </button>
  )
}

export default Check