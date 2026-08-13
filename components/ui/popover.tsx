"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFloating, Placement } from "@/hooks/useFloating";
import { useDelayedUnmount } from "@/hooks/useDelayedUnmount";
import { Slot } from "./slot";

export type PopoverPlacement = Placement;

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
  placement: PopoverPlacement;
  offset: number;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(
  undefined,
);

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
}

export const Popover = ({
  children,
  open: controlledOpen,
  onOpenChange,
  placement = "bottom",
  offset = 8,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const isOpen =
    controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = onOpenChange || setUncontrolledOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen, isOpen]);

  return (
    <PopoverContext.Provider
      value={{ isOpen, setIsOpen, triggerRef, contentRef, placement, offset }}
    >
      {children}
    </PopoverContext.Provider>
  );
};

export interface PopoverTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error("PopoverTrigger must be used within Popover");

    const { isOpen, setIsOpen, triggerRef } = context;
    const Component = asChild ? Slot : "div";

    return (
      <Component
        ref={(node: any) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
          if (triggerRef) (triggerRef as any).current = node;
        }}
        onClick={(e: any) => {
          if (props.onClick) props.onClick(e);
          setIsOpen(!isOpen);
        }}
        className={cn(!asChild && "cursor-pointer inline-block", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  placement?: PopoverPlacement;
  align?: "start" | "center" | "end";
  offset?: number;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(({ children, className, placement: contentPlacement, align, offset: contentOffset, ...props }, ref) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within Popover");

  const { isOpen, triggerRef, contentRef, placement: contextPlacement, offset: contextOffset } = context;

  const alignMap = {
    start: "bottom-start",
    center: "bottom",
    end: "bottom-end",
  } as const;

  const resolvedPlacement: PopoverPlacement =
    contentPlacement ||
    (align ? alignMap[align] : contextPlacement) ||
    "bottom";

  const resolvedOffset = contentOffset !== undefined ? contentOffset : contextOffset;

  useFloating(
    triggerRef,
    contentRef,
    isOpen,
    resolvedPlacement,
    resolvedOffset,
  );

  const [mounted, setMounted] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const shouldRender = useDelayedUnmount(isOpen, 200);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen && shouldRender) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setAnimating(false);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender || !mounted) return null;

  const isVisible = isOpen && animating;

  return createPortal(
    <div
      ref={(node) => {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
        if (contentRef) (contentRef as any).current = node;
      }}
      className={cn(
        "fixed z-200 min-w-50 p-4 bg-[#1f1f23] rounded-2xl shadow-xl border border-[#ffffff12] text-white transition-all duration-200 ease-out transform",
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1",
        className,
      )}
      style={{
        visibility: isOpen ? "visible" : shouldRender ? "visible" : "hidden",
      }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
});
PopoverContent.displayName = "PopoverContent";