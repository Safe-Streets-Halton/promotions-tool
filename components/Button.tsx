import type { ComponentChildren } from "preact";

export interface ButtonProps {
  onClick?: () => void;
  children?: ComponentChildren;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = {
  primary: "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500",
  outline: "border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:ring-green-500"
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    href,
    disabled = false,
    type = "button",
    onClick,
    ...rest
  } = props;

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
  ].join(" ");

  if (href) {
    return (
      <a
        href={href}
        class={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      class={classes}
      {...rest}
    >
      {children}
    </button>
  );
}
