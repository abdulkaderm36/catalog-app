import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 border-0 border-b border-[rgba(29,21,15,0.18)] bg-transparent px-0 py-3 text-base text-[color:var(--ink-900)] outline-none transition-colors placeholder:text-[color:var(--ink-500)] focus-visible:border-[color:var(--rust-500)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
