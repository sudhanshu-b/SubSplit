import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-xl px-4 py-3 text-sm font-medium",
          "bg-white dark:bg-zinc-900",
          "text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "border border-zinc-200 dark:border-zinc-700",
          "transition-colors duration-150",
          "outline-none resize-none",
          "focus-visible:border-zinc-900 dark:focus-visible:border-zinc-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
