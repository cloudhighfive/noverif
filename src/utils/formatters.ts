// src/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const formatStatus = (status: string): { label: string; color: string } => {
  switch (status.toLowerCase()) {
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' };
    case 'completed':
      return { label: 'Completed', color: 'text-green-500 bg-green-500/10' };
    case 'failed':
      return { label: 'Failed', color: 'text-red-500 bg-red-500/10' };
    default:
      return { label: status, color: 'text-gray-500 bg-gray-500/10' };
  }
};