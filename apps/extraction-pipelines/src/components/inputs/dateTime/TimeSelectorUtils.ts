import moment from 'moment';
import { Range } from '@cognite/cogs.js';
import { Time } from 'components/inputs/dateTime/TimeSelector';

export const createHalfHourOptions = () => {
  return Array.from(
    {
      length: 48,
    },
    (_, hour) => {
      const value = moment({
        hour: Math.floor(hour / 2),
        minutes: hour % 2 === 0 ? 0 : 30,
      });
      return {
        label: value.format('HH:mm'),
        value: {
          hours: value.hours(),
          min: value.minutes(),
        },
      };
    }
  );
};

export const optionTimeField = (range: Range, field: keyof Range) => {
  return ({
    value,
  }: {
    label: string;
    value: { hours: number; min: number };
  }) => {
    const startHours = range[field] as Date;
    return (
      startHours &&
      value.hours === startHours.getHours() &&
      value.min === startHours.getMinutes()
    );
  };
};

export const createDateWithTime = (
  dateRange: Range,
  timeRange: Range,
  field: keyof Range
) => {
  const date = dateRange[field] as Date;
  const time = timeRange[field] as Date;
  const now = new Date();
  return new Date(
    date?.getFullYear() ?? now.getFullYear(),
    date?.getMonth() ?? now.getMonth(),
    date?.getDate() ?? now.getDate(),
    time?.getHours() ?? now.getHours(),
    time?.getMinutes() ?? now.getMinutes()
  );
};

export const createDateFromTimeChange = (
  dateRange: Range,
  field: keyof Range,
  time: Time
) => {
  const date = dateRange[field] as Date;
  const now = new Date();
  return new Date(
    date?.getFullYear() ?? now.getFullYear(),
    date?.getMonth() ?? now.getMonth(),
    date?.getDate() ?? now.getDate(),
    time.hours,
    time.min
  );
};

const toTwoDigitString = (digit: number | undefined): string => {
  if (digit === undefined) {
    return '';
  }
  return digit < 10 ? `0${digit}` : `${digit}`;
};

export const rangeToTwoDigitString = (time: {
  hours?: number;
  min?: number;
}) => {
  return `${toTwoDigitString(time.hours)}:${toTwoDigitString(time.min)}`;
};

const TIME_FORMAT_LENGTH: Readonly<number> = 5;
export const parseTimeString = (input: string): Time | undefined => {
  if (input.length < TIME_FORMAT_LENGTH) {
    return undefined;
  }
  const date = moment(input, 'HH:mm');
  return date.isValid()
    ? {
        min: date.minutes(),
        hours: date.hours(),
      }
    : undefined;
};
