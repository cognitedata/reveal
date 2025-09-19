import dayjs from 'dayjs';

export type DateTimeFormatOptions = {
  date?: dayjs.ConfigType; // string | number | Date | Dayjs | null | undefined
  language?: string;
  format?: string; // Check out dayjs format options https://day.js.org/docs/en/display/format
};

export interface DateTimeFormatArguments extends DateTimeFormatOptions {
  thresholdInHours?: number; // hours
  showAbsolute?: boolean;
}
