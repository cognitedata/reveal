import { format, formatISO9075 } from 'date-fns';

import type { ScheduleRepeat, ValueOptionType } from './types';

export const INTERVAL_OPTIONS: ValueOptionType<string>[] = [
  { label: 'minutes', value: 'm' },
  { label: 'hours', value: 'h' },
  { label: 'days', value: 'd' },
];

export const getScheduleRepeat = (repeat: string): ScheduleRepeat => {
  const count = parseInt(repeat, 10);
  const interval = repeat.match(/[dhm]/)?.[0] ?? INTERVAL_OPTIONS[0].value;
  const intervalOption = INTERVAL_OPTIONS.find(
    (it) => it.value === repeat.match(/[dhm]/)?.[0]
  );
  const minutes =
    count *
    ({
      m: 1,
      h: 60,
      d: 60 * 24,
      w: 60 * 24 * 7,
    }[interval] ?? 0);
  return { count, interval, intervalOption, minutes };
};

export const getScheduleStart = (start: number | string) => {
  const date = new Date(start);
  const dateString = formatISO9075(date, { representation: 'date' });
  const timeString = format(new Date(start), 'HH:mm');
  return { date, dateString, timeString };
};
