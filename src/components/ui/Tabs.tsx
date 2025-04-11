// src/components/ui/Tabs.tsx
import React, { createContext, useContext, useState } from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsValueContext = createContext<string>('');
const TabsChangeContext = createContext<((value: string) => void) | undefined>(undefined);

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const onChange = onValueChange || (controlledValue === undefined ? setUncontrolledValue : undefined);
  
  return (
    <TabsValueContext.Provider value={value}>
      <TabsChangeContext.Provider value={onChange}>
        <div className={className}>
          {children}
        </div>
      </TabsChangeContext.Provider>
    </TabsValueContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex space-x-2 border-b border-dark-700 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
}) => {
  const selectedValue = useContext(TabsValueContext);
  const onChange = useContext(TabsChangeContext);
  const isActive = value === selectedValue;
  
  return (
    <button
      className={`py-3 px-6 font-medium text-sm ${
        isActive
          ? 'text-primary-500 border-b-2 border-primary-500'
          : 'text-gray-400 hover:text-white'
      } ${className}`}
      onClick={() => onChange?.(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const selectedValue = useContext(TabsValueContext);
  
  if (value !== selectedValue) {
    return null;
  }
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};