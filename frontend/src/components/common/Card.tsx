/**
 * Card Component
 *
 * Following DESIGN_SYSTEM.md specifications:
 * - Background: var(--bg-card)
 * - Border: 1px solid rgba(255, 255, 255, 0.05)
 * - Border radius: var(--radius-xl) = 1rem
 * - Padding: var(--space-6) = 1.5rem
 * - Shadow: var(--shadow-lg)
 * - Hover: transform translateY(-4px), shadow-2xl, border-color rgba(218, 41, 28, 0.3)
 */

import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <div
      className={clsx(
        'rounded-xl p-6 shadow-lg transition-all duration-300',
        'border border-white/10',
        'backdrop-blur-md',
        hover && 'hover:shadow-2xl hover:-translate-y-1 hover:border-white/20',
        className
      )}
      style={{
        background: 'rgba(26, 41, 66, 0.75)',
      }}
    >
      {children}
    </div>
  );
};
