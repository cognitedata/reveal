import dayjs from 'dayjs';

// todo(DEG-558): remove dateFrom & dateTo
export const relativeTimeOptions = [
  {
    label: '1d' as const,
    dateFrom: () => dayjs().subtract(1, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '2d' as const,
    dateFrom: () => dayjs().subtract(2, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1w' as const,
    dateFrom: () => dayjs().subtract(1, 'week').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1M' as const,
    dateFrom: () => dayjs().subtract(1, 'month').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '6M' as const,
    dateFrom: () => dayjs().subtract(6, 'months').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1y' as const,
    dateFrom: () => dayjs().subtract(1, 'year').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
];
