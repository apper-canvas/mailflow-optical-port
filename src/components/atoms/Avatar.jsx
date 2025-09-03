import React from "react";
import { cn } from "@/utils/cn";

const Avatar = ({ 
  name, 
  email, 
  size = "md", 
  className,
  ...props 
}) => {
  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "?";
  };

const sizes = {
    sm: "w-7 h-7 sm:w-8 sm:h-8 text-xs",
    md: "w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm",
    lg: "w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base"
  };

  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500"
  ];

  const getColor = (text) => {
    const index = (text || "").length % colors.length;
    return colors[index];
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-medium",
        sizes[size],
        getColor(name || email),
        className
      )}
      {...props}
    >
      {getInitials(name, email)}
    </div>
  );
};

export default Avatar;