"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useDelayedUnmount } from "@/hooks/useDelayedUnmount";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const Dialog = ({ open, onOpenChange, children }: any) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

import { Slot } from "./Slot";

const DialogTrigger = React.forwardRef<HTMLElement, any>(
  ({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    if (!context) return null;

    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref as any}
        className={className}
        onClick={(e: any) => {
          if (props.onClick) props.onClick(e);
          context.onOpenChange(true);
        }}
        {...(asChild ? {} : { type: "button" })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";


const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    const [mounted, setMounted] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const isOpen = context?.open ?? false;
    const shouldRender = useDelayedUnmount(isOpen, 200);

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
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div 
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={() => context?.onOpenChange(false)}
        />
        <div
          ref={ref}
          className={cn(
            "relative z-100 w-full max-w-lg p-6 bg-dark-200 border border-dark-400 shadow-xl rounded-2xl text-white grid gap-4 transition-all duration-200 ease-out transform",
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-start",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
};
