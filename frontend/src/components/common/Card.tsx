import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <div className={clsx('fifa-card p-6', hover && 'hover:transform hover:-translate-y-1', className)}>
      {children}
    </div>
  );
};
