import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-[28px] border border-[rgba(247,242,232,0.5)] bg-[rgba(247,242,232,0.88)] shadow-[var(--shadow-soft)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-8", className)} {...props} />;
}

export { Card, CardContent };
