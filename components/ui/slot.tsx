import React from "react";
import { cn } from "@/lib/utils";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const childProps = children.props as React.HTMLAttributes<HTMLElement>;
    return React.cloneElement(children, {
      ...props,
      ref: (node: any) => {
        // Handle refs on the child
        const childRef = (children as any).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef) childRef.current = node;

        // Handle the forwarded ref
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<any>).current = node;
      },
      style: {
        ...props.style,
        ...childProps.style,
      },
      className: cn(props.className, childProps.className),
      onClick: (e: any) => {
        if (props.onClick) props.onClick(e);
        if (childProps.onClick) (childProps as any).onClick(e);
      },
    } as any);
  },
);
Slot.displayName = "Slot";
