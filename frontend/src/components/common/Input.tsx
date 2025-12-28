import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <input className={clsx('input-field', error && 'border-psg-red', className)} {...props} />
      {error && <p className="text-psg-red text-sm mt-1">{error}</p>}
    </div>
  );
};
