// src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div 
      className={`bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader = ({ children, className = '', ...props }: CardHeaderProps) => {
  return (
    <div 
      className={`px-4 py-5 sm:p-6 border-b border-dark-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => {
  return (
    <h3 
      className={`text-xl font-semibold text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const CardDescription = ({ children, className = '', ...props }: CardDescriptionProps) => {
  return (
    <p 
      className={`mt-2 text-sm text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardContent = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div 
      className={`px-4 py-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div 
      className={`px-4 py-4 sm:px-6 border-t border-dark-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };