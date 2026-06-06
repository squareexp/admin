"use client";

import * as React from "react";
import { AlertDialog as HeroAlertDialog } from "@heroui/react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AlertDialog = HeroAlertDialog;
const AlertDialogTrigger = HeroAlertDialog.Trigger;
const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const AlertDialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroAlertDialog.Backdrop>
>(({ className, children, ...props }, ref) => (
  <HeroAlertDialog.Backdrop
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  >
    {children}
  </HeroAlertDialog.Backdrop>
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof HeroAlertDialog.Dialog>, "children"> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <HeroAlertDialog.Backdrop>
    <HeroAlertDialog.Container>
      <HeroAlertDialog.Dialog
        className={cn("grid w-full max-w-lg gap-4 p-6", className)}
        {...props}
      >
        <div ref={ref} className="contents">
          {children}
        </div>
      </HeroAlertDialog.Dialog>
    </HeroAlertDialog.Container>
  </HeroAlertDialog.Backdrop>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeroAlertDialog.Header
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props as any}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeroAlertDialog.Footer
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props as any}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof HeroAlertDialog.Heading>
>(({ className, ...props }, ref) => (
  <HeroAlertDialog.Heading ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroAlertDialog.Body>
>(({ className, ...props }, ref) => (
  <div ref={ref} className="contents">
    <HeroAlertDialog.Body className={cn("text-sm text-muted-foreground", className)} {...props} />
  </div>
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = ({
  className,
  ...props
}: React.ComponentProps<typeof HeroAlertDialog.CloseTrigger>) => (
  <HeroAlertDialog.CloseTrigger
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props as any}
  />
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
