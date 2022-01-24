import dayjs from 'dayjs';

export const formatOwner = (email: string): string => email.split('@')[0];

export const formatDate = (timestamp?: number): string => {
  if (timestamp) return dayjs(timestamp).format('MMM D, YYYY');
  return '';
};
