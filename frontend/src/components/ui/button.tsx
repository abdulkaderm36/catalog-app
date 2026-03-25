import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--rust-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sand-50)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--ink-900)] text-[color:var(--sand-50)] hover:-translate-y-px",
        ghost:
          "border border-[rgba(247,242,232,0.45)] bg-[rgba(247,242,232,0.08)] text-[color:var(--sand-50)] hover:-translate-y-px",
        rust: "bg-[color:var(--rust-500)] text-white hover:-translate-y-px",
        subtle:
          "border border-[color:var(--line)] bg-[rgba(247,242,232,0.7)] text-[color:var(--ink-900)] hover:-translate-y-px",
      },
      size: {
        default: "min-h-12 px-5",
        sm: "min-h-10 px-4 text-xs",
        lg: "min-h-14 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
