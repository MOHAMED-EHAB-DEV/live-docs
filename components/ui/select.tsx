"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFloating } from "@/hooks/useFloating";
import { useDelayedUnmount } from "@/hooks/useDelayedUnmount";
import { Slot } from "./Slot";

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  displayLabel?: React.ReactNode;
  registerItem: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const itemsMapRef = React.useRef<Map<string, React.ReactNode>>(new Map());

  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const isControlledValue = controlledValue !== undefined;
  const value = isControlledValue ? (controlledValue || defaultValue) : (uncontrolledValue || defaultValue);

  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlledValue) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlledValue, onValueChange]
  );

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlledOpen) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlledOpen, onOpenChange]
  );

  const registerItem = React.useCallback((itemVal: string, itemLabel: React.ReactNode) => {
    itemsMapRef.current.set(itemVal, itemLabel);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        handleOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleOpenChange]);

  const displayLabel = value ? itemsMapRef.current.get(value) : undefined;

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen: handleOpenChange,
        triggerRef,
        contentRef,
        displayLabel,
        registerItem,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
};
Select.displayName = "Select";

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, asChild = false, disabled, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectTrigger must be used within a Select component");
    }

    const { open, setOpen, triggerRef } = context;
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={(node: any) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
          if (triggerRef) (triggerRef as any).current = node;
        }}
        type={asChild ? undefined : "button"}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={(e: any) => {
          if (disabled) return;
          if (props.onClick) props.onClick(e);
          setOpen(!open);
        }}
        className={cn(
          !asChild &&
            "inline-flex h-9 w-fit items-center justify-between gap-1.5 rounded-xl border border-dark-400/70 bg-dark-300/60 px-2.5 py-1.5 text-sm text-blue-100 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-dark-400 hover:bg-dark-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]",
          className
        )}
        {...props}
      >
        <span className="inline-flex w-fit items-center gap-1.5 truncate">{children}</span>
        {!asChild && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              "size-4 shrink-0 text-blue-100/60 transition-transform duration-200 ms-1",
              open && "rotate-180"
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </Component>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

const defaultLabelMap: Record<string, string> = {
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  blockquote: "Quote",
  codeBlock: "Code Block",
  none: "No List",
  bulletList: "Bullet List",
  orderedList: "Numbered List",
  viewer: "can view",
  editor: "can edit",
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className, children }) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within a Select component");
  }

  const { displayLabel, value } = context;
  const resolved =
    children ||
    displayLabel ||
    (value ? defaultLabelMap[value] || value : undefined) ||
    placeholder ||
    "";

  return (
    <span className={cn("inline-block w-fit whitespace-nowrap font-medium", className)}>
      {resolved}
    </span>
  );
};
SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "bottom-center" | "top-center";
  offset?: number;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, position = "bottom-left", offset = 6, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectContent must be used within a Select component");
    }

    const { open, triggerRef, contentRef } = context;
    useFloating(triggerRef, contentRef, open, position, offset);

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
          "fixed z-160 min-w-32 overflow-hidden rounded-xl border border-dark-400 bg-dark-200/95 p-1.5 text-blue-100 shadow-2xl backdrop-blur-xl transition-all duration-150 ease-out focus:outline-none",
          open
            ? "animate-in fade-in zoom-in-95"
            : "animate-out fade-out zoom-out-95",
          className
        )}
        style={{
          visibility: open ? "visible" : shouldRender ? "visible" : "hidden",
        }}
        {...props}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </div>,
      document.body
    );
  }
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, disabled = false, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectItem must be used within a Select component");
    }

    const { onValueChange, setOpen, value: selectedValue, registerItem } = context;
    const isSelected = selectedValue === value;

    registerItem(value, children);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          if (props.onClick) props.onClick(e);
          onValueChange?.(value);
          setOpen(false);
        }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-blue-100 transition-colors duration-100 outline-none",
          isSelected
            ? "bg-blue-500/15 text-blue-400 font-medium"
            : "hover:bg-dark-300/80 hover:text-white",
          disabled && "pointer-events-none opacity-40 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 shrink-0 text-blue-400 ms-2"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
));
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-1.5 text-xs font-semibold text-blue-100/50", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-dark-400/50", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
