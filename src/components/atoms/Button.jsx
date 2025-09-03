import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  variant = "primary", 
  size = "md", 
  children, 
  className,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-blue-600 text-white shadow-sm hover:shadow-md focus:ring-primary/20",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300/20",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300/20",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500/20",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md focus:ring-green-500/20"
  };

const sizes = {
    sm: "px-3 py-2 sm:py-1.5 text-sm rounded-md gap-1.5 min-h-[44px] sm:min-h-[36px]",
    md: "px-4 py-2.5 sm:py-2 text-sm rounded-md gap-2 min-h-[44px] sm:min-h-[40px]",
    lg: "px-6 py-3 text-base rounded-lg gap-2 min-h-[48px]"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" size={16} className="animate-spin" />
      )}
      {!loading && icon && iconPosition === "left" && (
        <ApperIcon name={icon} size={16} />
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon name={icon} size={16} />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;