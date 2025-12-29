/**
 * Button Component
 *
 * Following DESIGN_SYSTEM.md specifications:
 * - Primary: background var(--psg-red), uppercase, letter-spacing, shadow-md
 * - Secondary: transparent bg, 2px border, font-semibold
 * - Font weight: var(--font-bold) = 700
 * - Padding: var(--space-3) var(--space-6) = 0.75rem 1.5rem
 * - Border radius: var(--radius-md) = 0.5rem
 * - Hover: transform translateY(-2px), shadow-glow
 */

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'font-bold uppercase tracking-wide px-6 py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-psg-red text-white hover:bg-[#C31E1A] hover:shadow-glow hover:-translate-y-0.5',
    secondary: 'bg-transparent text-white border-2 border-psg-navy font-semibold hover:bg-psg-navy hover:border-psg-red',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/50',
    success: 'bg-fifa-green text-black font-bold hover:bg-green-500 hover:shadow-fifa-green/50',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
