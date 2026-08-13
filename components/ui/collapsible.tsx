import * as React from "react";
import { cn } from "@/lib/utils";

const Collapsible = ({ open, onOpenChange, children, className }: any) => {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            open,
            onOpenChange,
          });
        }
        return child;
      })}
    </div>
  );
};

import { Slot } from "./slot";

const CollapsibleTrigger = React.forwardRef<HTMLElement, any>(
  ({ className, children, asChild, open, onOpenChange, ...props }, ref) => {
    const Component = asChild ? Slot : "div";

    return (
      <Component
        ref={ref as any}
        onClick={(e: any) => {
          if (props.onClick) props.onClick(e);
          onOpenChange?.(!open);
        }}
        className={cn(!asChild && "cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

import { useDelayedUnmount } from "@/hooks/useDelayedUnmount"

const CollapsibleContent = ({ children, open }: any) => {
  const shouldRender = useDelayedUnmount(open, 200);
  if (!shouldRender) return null;
  return (
    <div className={cn("overflow-hidden duration-200", open ? "animate-in slide-in-from-top-2 fade-in" : "animate-out slide-out-to-top-2 fade-out")}>
      {children}
    </div>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
