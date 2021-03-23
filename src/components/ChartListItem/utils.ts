import dayjs from 'dayjs';

export const formatOwner = (email: string): string => email.split('@')[0];

export const formatDate = (timestamp?: number): string => {
  if (timestamp) return dayjs(timestamp).format('YYYY-MM-DD');
  return '';
};
