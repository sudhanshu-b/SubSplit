import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // layout
          "flex w-full rounded-xl px-4 py-3 text-sm font-medium",
          // colours
          "bg-white dark:bg-zinc-900",
          "text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          // border — thickens on focus instead of ring shadow
          "border border-zinc-200 dark:border-zinc-700",
          "transition-colors duration-150",
          // focus: just make the border darker, no ring/shadow bleed
          "outline-none",
          "focus-visible:border-zinc-900 dark:focus-visible:border-zinc-200",
          // disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
