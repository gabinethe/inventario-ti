import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-xs",
      secondary:
        "bg-indigo-50 text-indigo-900 hover:bg-indigo-100 focus:ring-indigo-300",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-indigo-300 shadow-2xs",
      ghost:
        "bg-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 focus:ring-indigo-200",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
