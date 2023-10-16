import * as dayjs from 'dayjs';

export type DaySuffix = 'st' | 'nd' | 'rd' | 'th';

export const subtractDate = (
  date: string | number | Date | dayjs.Dayjs,
  value: number,
  unit: dayjs.ManipulateType
) => {
  return dayjs(date).subtract(value, unit);
};

export const getDaySuffix = (day: number): DaySuffix => {
  if (day > 3 && day < 21) {
    return 'th';
  }
  return ['st', 'nd', 'rd'][(day % 10) - 1] as DaySuffix;
};
