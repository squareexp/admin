"use client";

import * as React from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextValue = ReturnType<typeof useOverlayState>;

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps) {
  const state = useOverlayState({
    defaultOpen,
    isOpen: open,
    onOpenChange,
  });

  return (
    <DialogContext.Provider value={state}>
      <Modal state={state}>{children}</Modal>
    </DialogContext.Provider>
  );
}

const DialogTrigger = Modal.Trigger;
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogClose = Modal.CloseTrigger;

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Modal.Backdrop>
>(({ className, children, ...props }, ref) => (
  <Modal.Backdrop
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  >
    {children}
  </Modal.Backdrop>
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof Modal.Dialog>, "children"> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  const state = React.useContext(DialogContext);

  return (
    <Modal.Backdrop isDismissable>
      <Modal.Container>
        <Modal.Dialog
          className={cn("grid w-full max-w-lg gap-4 p-6", className)}
          {...props}
        >
          <div ref={ref} className="contents">
            {children}
            <Modal.CloseTrigger
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              onPress={() => state?.close()}
            >
              <X className="h-4 w-4" />
            </Modal.CloseTrigger>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof Modal.Heading>
>(({ className, ...props }, ref) => (
  <Modal.Heading ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
