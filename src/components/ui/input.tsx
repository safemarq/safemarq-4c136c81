import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-base text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate2 hover:border-ink/30 focus-visible:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:h-11 md:text-[15px]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
