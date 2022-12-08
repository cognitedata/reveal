import dayjs from 'dayjs';

const now = dayjs();

export const timeFrameOptions = [
  { value: 'lastTwoWeeks' as const, label: 'Last two weeks' },
  { value: 'lastMonth' as const, label: 'Last month' },
  { value: 'lastThreeMonths' as const, label: 'Last three months' },
  { value: 'lastSixMonths' as const, label: 'Last six months' },
  { value: 'oneYearAgo' as const, label: 'One year ago' },
];

export const timeFrameStartDates = [
  now.subtract(2, 'week'),
  now.subtract(1, 'month'),
  now.subtract(3, 'month'),
  now.subtract(6, 'month'),
  now.subtract(1, 'year'),
];
