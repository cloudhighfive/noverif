// src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar = ({
  value,
  max = 100,
  label,
  className = '',
  showValue = false,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-primary-500 to-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-dark-700 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressBar };