import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: typeof LucideIcon;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-dark-200 text-dark-900 hover:bg-dark-300 focus:ring-dark-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-lg hover:shadow-xl',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl',
    warning: 'bg-cream-600 text-white hover:bg-cream-700 focus:ring-cream-500 shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs sm:px-3 sm:text-sm',
    md: 'px-3 py-2 text-sm sm:px-4 sm:text-base',
    lg: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;