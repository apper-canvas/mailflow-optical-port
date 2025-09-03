import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  type = "text",
  placeholder,
  className,
  error,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
className={cn(
        "input-field bg-white",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;