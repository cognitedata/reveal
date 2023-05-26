import dayjs from 'dayjs';

import { TimeOptions } from '../types';
export const TIME_SELECT: {
  [key in TimeOptions]: {
    label: string;
    getTime: () => [Date, Date];
  };
} = {
  '10Y': {
    label: '10Y',
    getTime: () => [
      dayjs().subtract(10, 'years').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '5Y': {
    label: '5Y',
    getTime: () => [
      dayjs().subtract(5, 'years').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '2Y': {
    label: '2Y',
    getTime: () => [
      dayjs().subtract(2, 'years').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '1Y': {
    label: '1Y',
    getTime: () => [
      dayjs().subtract(1, 'years').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '1M': {
    label: '1M',
    getTime: () => [
      dayjs().subtract(1, 'months').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '1W': {
    label: '1W',
    getTime: () => [
      dayjs().subtract(7, 'days').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '1D': {
    label: '1D',
    getTime: () => [
      dayjs().subtract(1, 'days').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '12H': {
    label: '12H',
    getTime: () => [
      dayjs().subtract(12, 'hours').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '6H': {
    label: '6H',
    getTime: () => [
      dayjs().subtract(6, 'hours').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '1H': {
    label: '1H',
    getTime: () => [
      dayjs().subtract(1, 'hours').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
  '15Min': {
    label: '15Min',
    getTime: () => [
      dayjs().subtract(15, 'minutes').startOf('seconds').toDate(),
      dayjs().startOf('seconds').toDate(),
    ],
  },
};
