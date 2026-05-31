"use client";

import * as React from "react";
import { Drawer, useOverlayState } from "@heroui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetContextValue = ReturnType<typeof useOverlayState>;

const SheetContext = React.createContext<SheetContextValue | null>(null);

type SheetProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function Sheet({ children, defaultOpen, onOpenChange, open }: SheetProps) {
  const state = useOverlayState({
    defaultOpen,
    isOpen: open,
    onOpenChange,
  });

  return (
    <SheetContext.Provider value={state}>
      <Drawer state={state}>{children}</Drawer>
    </SheetContext.Provider>
  );
}

const SheetTrigger = Drawer.Trigger;
const SheetClose = Drawer.CloseTrigger;
const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Drawer.Backdrop>
>(({ className, children, ...props }, ref) => (
  <Drawer.Backdrop
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  >
    {children}
  </Drawer.Backdrop>
));
SheetOverlay.displayName = "SheetOverlay";

interface SheetContentProps
  extends Omit<React.ComponentProps<typeof Drawer.Dialog>, "children"> {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const state = React.useContext(SheetContext);

    return (
      <Drawer.Backdrop isDismissable>
        <Drawer.Content placement={side}>
          <Drawer.Dialog
            className={cn(
              "gap-4 bg-background p-6 text-foreground shadow-lg",
              side === "left" || side === "right"
                ? "h-full w-3/4 sm:max-w-sm"
                : "w-full",
              className,
            )}
            {...props}
          >
            <div ref={ref} className="contents">
              <Drawer.CloseTrigger
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                onPress={() => state?.close()}
              >
                <X className="h-4 w-4" />
              </Drawer.CloseTrigger>
              {children}
            </div>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  },
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof Drawer.Heading>
>(({ className, ...props }, ref) => (
  <Drawer.Heading ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
