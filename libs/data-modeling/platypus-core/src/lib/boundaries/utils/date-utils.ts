import { DateFormat } from '../types/date-format.enum';

export abstract class DateUtils {
  /**
   * Add days to Date object
   * @param dateObject - JS Date
   * @param days - days to be added
   */
  abstract addDays(date: Date, days: number): Date;

  /**
   * Convert string date string to Date object
   * @param dateString date as string, ex. 2019-09-10
   * @param format - DateFormat, default is YYYY-MM-DD
   */
  abstract parse(dateString: string, format?: DateFormat | string): Date;

  /**
   * 	Converts the value of the current Date object (or UNIX timestamp) to its equivalent string representation using the specified format.
   * @param date - JS Date object or UNIX timestamp
   * @param format - DateFormat or string, default DateFormat.DISPLAY_DATE_FORMAT
   */
  abstract format(
    date: Date | number | string,
    format?: DateFormat | string
  ): string;

  abstract toTimeDiffString(date: Date | number): string;

  abstract isValid(date: Date | number): boolean;
}
