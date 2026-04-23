import { AlertCircle, Notebook, NotepadText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  children: React.ReactNode;
  type?: "info" | "warning" | "error" | "success";
}

export function Callout({ children, type = "info" }: CalloutProps) {
  const typeStyles = {
    info: "bg-blue-[#2E3363FF] ring-1 ring-slate-800 text-blue-800",
    warning: "bg-[#9465003E] ring-1 ring-yellow-100/20 text-yellow-400",
    error: "bg-[#94000024] ring-1 ring-red-100/20 text-red-500",
    success:
      "bg-[#273A32FF] ring-1 ring-[#A4E3C8FF] text-white text-lg ring-transparent -800 min-h-[200px]",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4  rounded-md",
        typeStyles[type]
      )}
    >
      <div className="flex flex-col space-y-2">
        {
          <div className="flex gap-2 text-2xl font-semibold items- items-end">
            {" "}
            {type != "success" ? (
              <AlertCircle className="h-10 w-10 mt-1" />
            ) : (
              <NotepadText
                strokeWidth={1.5}
                className="h-10 text-green-700 w-10 "
              />
            )}
            Note
          </div>
        }
        {children}
      </div>
    </div>
  );
}
