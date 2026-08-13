import React from 'react';
import { cn, cva } from '@/lib/utils';
import { Slot } from './slot';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ring-offset-dark-100",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:ring-blue-500 border border-transparent",
        secondary: "bg-dark-300 text-blue-100 hover:bg-dark-400 hover:shadow-lg hover:shadow-dark-400/20 focus-visible:ring-dark-400 border border-transparent",
        outline: "bg-transparent border border-dark-400 text-blue-100 hover:border-dark-500 hover:bg-dark-400 focus-visible:ring-dark-400",
        ghost: "bg-transparent text-blue-100 hover:bg-dark-400 focus-visible:ring-dark-400 border border-transparent",
        destructive: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 focus-visible:ring-red-500 border border-transparent",
        flat: "bg-dark-200 text-blue-100 hover:bg-dark-300 border border-transparent"
      },
      size: {
        default: "h-11 px-6 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'flat';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean;
  as?: React.ElementType | string;
  href?: string;
  target?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, asChild = false, as, children, ...props }, ref) => {
    const Component = asChild ? Slot : (as || "button");

    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Component>
    );
  }
);
Button.displayName = 'Button';
