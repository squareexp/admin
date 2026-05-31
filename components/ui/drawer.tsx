"use client";

import * as React from "react";
import { Drawer as HeroDrawer, useOverlayState } from "@heroui/react";

import { cn } from "@/lib/utils";

type DrawerDirection = "bottom" | "left" | "right" | "top";

type DrawerContextValue = {
  direction: DrawerDirection;
  state: ReturnType<typeof useOverlayState>;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

type DrawerRootProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  direction?: DrawerDirection;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  shouldScaleBackground?: boolean;
};

function DrawerRoot({
  children,
  defaultOpen,
  direction = "bottom",
  onOpenChange,
  open,
}: DrawerRootProps) {
  const state = useOverlayState({
    defaultOpen,
    isOpen: open,
    onOpenChange,
  });

  return (
    <DrawerContext.Provider value={{ direction, state }}>
      <HeroDrawer state={state}>{children}</HeroDrawer>
    </DrawerContext.Provider>
  );
}

const DrawerTrigger = HeroDrawer.Trigger;
const DrawerPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DrawerClose = HeroDrawer.CloseTrigger;

const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HeroDrawer.Backdrop>
>(({ className, children, ...props }, ref) => (
  <HeroDrawer.Backdrop
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  >
    {children}
  </HeroDrawer.Backdrop>
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof HeroDrawer.Dialog>, "children"> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(DrawerContext);
  const placement = context?.direction ?? "bottom";

  return (
    <HeroDrawer.Content placement={placement}>
      <HeroDrawer.Dialog
        className={cn(
          "fixed z-50 flex h-auto flex-col border bg-background text-foreground shadow-lg",
          placement === "left" && "left-2 top-2 bottom-2 w-72",
          placement === "right" && "right-2 top-2 bottom-2 w-72",
          placement === "top" && "inset-x-2 top-2",
          placement === "bottom" && "inset-x-2 bottom-2",
          className,
        )}
        {...props}
      >
        <div ref={ref} className="contents">
          {children}
        </div>
      </HeroDrawer.Dialog>
    </HeroDrawer.Content>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeroDrawer.Header
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeroDrawer.Footer className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof HeroDrawer.Heading>
>(({ className, ...props }, ref) => (
  <HeroDrawer.Heading
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DrawerDescription.displayName = "DrawerDescription";

const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Close: DrawerClose,
  Header: DrawerHeader,
  Footer: DrawerFooter,
  Title: DrawerTitle,
  Description: DrawerDescription,
};

export {
  Drawer,
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
