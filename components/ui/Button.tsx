import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline' | 'unstyled';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'none';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent";
  
  const variants = {
    primary: "justify-center font-bold uppercase tracking-widest bg-primary text-white border border-white/10 hover:bg-primary-light",
    secondary: "justify-center font-bold uppercase tracking-widest bg-neutral text-slate-700 border border-slate-200 hover:bg-slate-200",
    accent: "justify-center font-bold uppercase tracking-widest bg-accent text-primary border border-accent-light hover:bg-accent-light shadow-lg shadow-black/10",
    ghost: "justify-center font-bold uppercase tracking-widest bg-transparent text-slate-500 hover:text-primary hover:bg-slate-100 border border-transparent",
    danger: "justify-center font-bold uppercase tracking-widest bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    outline: "justify-center font-bold uppercase tracking-widest bg-transparent text-slate-600 border border-slate-200 hover:border-accent hover:text-accent",
    unstyled: "text-left",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-[10px] min-h-[40px]", // Aumentado de py-1.5 para py-2.5
    md: "px-6 py-3 text-xs min-h-[48px]",
    lg: "px-10 py-4 text-sm min-h-[56px]",
    icon: "justify-center p-3 min-w-[44px] min-h-[44px]", // Garantindo 44px conforme WCAG
    none: "",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="sr-only">Processando...</span>
        </span>
      ) : children}
    </button>
  );
};