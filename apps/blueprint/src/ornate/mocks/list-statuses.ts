import { ListStatus } from '../react/components/list-tool-popup/types';

export const LIST_STATUSES: ListStatus[] = [
  {
    status: 'OPEN',
    styleOverrides: {
      fill: 'rgba(0, 200, 0, 0.3)',
    },
  },
  {
    status: 'CLOSED',
    styleOverrides: {
      fill: 'rgba(200, 0, 0, 0.3)',
    },
  },
];
