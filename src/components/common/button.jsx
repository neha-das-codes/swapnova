import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-700 to-primary-500 text-white hover:shadow-glow focus:ring-primary-500',
    secondary: 'bg-white text-primary-700 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 focus:ring-primary-300',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-700 focus:ring-white',
    ghost: 'bg-transparent text-primary-700 hover:bg-primary-50 focus:ring-primary-300',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed transform-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;