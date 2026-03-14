import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:shadow-md",
        secondary: "border-border bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "border-transparent bg-transparent hover:bg-muted hover:text-foreground",
        outline: "border-border bg-card text-foreground shadow-xs hover:border-primary/30 hover:bg-accent/60",
        destructive: "border-destructive bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-3.5 py-2",
        sm: "h-8 rounded-md px-2.5",
        lg: "h-11 rounded-lg px-4.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, variant, size, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...(asChild ? props : { type, ...props })} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
