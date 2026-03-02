import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '-';
  return format(parsed, formatStr);
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
};

export const getRelativeTime = (date) => {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '-';
  
  const now = new Date();
  const diffInDays = Math.floor((now - parsed) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(date);
};

export const isExpiringSoon = (expiryDate, days = 7) => {
  if (!expiryDate) return false;
  const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  const now = new Date();
  const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diffInDays <= days && diffInDays > 0;
};

export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  return new Date() > expiry;
};
