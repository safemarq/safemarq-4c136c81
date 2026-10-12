import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-lg border border-input bg-card px-3.5 py-3 text-base text-foreground transition-colors placeholder:text-slate2 hover:border-ink/30 focus-visible:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:text-[15px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
