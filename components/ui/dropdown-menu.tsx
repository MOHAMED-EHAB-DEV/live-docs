"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFloating } from "@/hooks/useFloating";
import { useDelayedUnmount } from "@/hooks/useDelayedUnmount";
import { Slot } from "./slot";

const DropdownMenuContext = React.createContext<any>(null);

const DropdownMenu = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      if (onOpenChange) onOpenChange(value);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<HTMLElement, any>(
  ({ className, children, asChild, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);
    const Component = asChild ? Slot : "div";

    return (
      <Component
        ref={(node: any) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          if (triggerRef) triggerRef.current = node;
        }}
        className={cn(!asChild && "cursor-pointer", className)}
        onClick={(e: any) => {
          if (props.onClick) props.onClick(e);
          setOpen(!open);
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = ({ children, className, align = "bottom-right" }: any) => {
  const { open, triggerRef, contentRef } =
    React.useContext(DropdownMenuContext);
  useFloating(triggerRef, contentRef, open, align, 6);

  const [mounted, setMounted] = React.useState(false);
  const shouldRender = useDelayedUnmount(open, 150);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed z-200 min-w-64 rounded-xl bg-dark-200 border border-dark-400 p-1.5 shadow-2xl focus:outline-hidden",
        open
          ? "animate-in fade-in-0 zoom-in-95"
          : "animate-out fade-out-0 zoom-out-95",
        className,
      )}
      style={{
        visibility: open ? "visible" : shouldRender ? "visible" : "hidden",
      }}
    >
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>,
    document.body,
  );
};

const DropdownMenuLabel = ({ className, children }: any) => (
  <div className={cn("px-3 py-2 text-xs font-semibold text-zinc-400", className)}>
    {children}
  </div>
);

const DropdownMenuItem = React.forwardRef<HTMLDivElement, any>(
  ({ className, children, onClick, asChild, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);
    const Component = asChild ? Slot : "div";

    return (
      <Component
        ref={ref as any}
        onClick={(e: any) => {
          if (onClick) onClick(e);
          setOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition select-none outline-hidden",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";


const DropdownMenuSeparator = ({ className }: any) => (
  <div className={cn("h-px my-1 bg-dark-400", className)} />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

