import dayjs from 'dayjs';

export const formatOwner = (email: string) => email.split('@')[0];

export const formatDate = (timestamp: number) =>
  dayjs(timestamp).format('YYYY-MM-DD');
