"use client";

import * as React from "react";
import { Button, Label, Separator, Surface } from "@heroui/react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type ContextMenuState = {
  close: () => void;
  open: boolean;
  openAt: (x: number, y: number) => void;
  x: number;
  y: number;
};

const ContextMenuContext = React.createContext<ContextMenuState | null>(null);

const ContextMenu = ({ children }: { children: React.ReactNode }) => {
  const [position, setPosition] = React.useState({ open: false, x: 0, y: 0 });

  const close = React.useCallback(() => {
    setPosition((current) => ({ ...current, open: false }));
  }, []);

  const openAt = React.useCallback((x: number, y: number) => {
    setPosition({ open: true, x, y });
  }, []);

  React.useEffect(() => {
    if (!position.open) return;

    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, position.open]);

  return (
    <ContextMenuContext.Provider value={{ close, openAt, ...position }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    asChild?: boolean;
    children: React.ReactNode;
  }
>(({ asChild, children, onContextMenu, ...props }, ref) => {
  const menu = React.useContext(ContextMenuContext);

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    onContextMenu?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    menu?.openAt(event.clientX, event.clientY);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onContextMenu?: React.MouseEventHandler<HTMLElement>;
    }>;

    return React.cloneElement(child, {
      ...props,
      onContextMenu: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onContextMenu?.(event);
        handleContextMenu(event);
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} onContextMenu={handleContextMenu} {...props}>
      {children}
    </div>
  );
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, style, ...props }, ref) => {
  const menu = React.useContext(ContextMenuContext);

  if (!menu?.open) return null;

  return (
    <Surface
      ref={ref}
      role="menu"
      className={cn("fixed z-50 min-w-[12rem] overflow-hidden p-1", className)}
      style={{ left: menu.x, top: menu.y, ...style }}
      variant="default"
      onClick={(event) => event.stopPropagation()}
      {...props}
    >
      {children}
    </Surface>
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Button>, "children" | "onSelect"> & {
    children?: React.ReactNode;
    inset?: boolean;
    onSelect?: (event: Event) => void;
  }
>(({ className, inset, onPress, onSelect, variant = "ghost", ...props }, ref) => {
  const menu = React.useContext(ContextMenuContext);
  const buttonProps = props as unknown as Partial<React.ComponentProps<typeof Button>>;

  return (
    <Button
      {...buttonProps}
      ref={ref}
      className={cn("h-auto w-full justify-start rounded-[12px] px-2 py-1.5 text-sm", inset && "pl-8", className)}
      variant={variant}
      onPress={(event) => {
        onPress?.(event);
        onSelect?.(event as unknown as Event);
        menu?.close();
      }}
    />
  );
});
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuLabel = React.forwardRef<
  HTMLLabelElement,
  {
    children?: React.ReactNode;
    className?: string;
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("block px-2 py-1.5 text-sm font-semibold text-white/50", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator ref={ref} className={cn("-mx-1 my-1", className)} {...props} />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuSubContent = ContextMenuContent;
const ContextMenuSubTrigger = ContextMenuItem;
const ContextMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const ContextMenuCheckboxItem = ContextMenuItem;
const ContextMenuRadioItem = ContextMenuItem;

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  Check,
  ChevronRight,
  Circle,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
