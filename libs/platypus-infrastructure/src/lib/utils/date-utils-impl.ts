import { DataUtils, DateFormat, DateUtils } from '@platypus/platypus-core';
import { addDays, format, parse } from 'date-fns';

export class DateUtilsImpl implements DateUtils {
  addDays(date: Date, days: number): Date;
  addDays(date: number, days: number): Date;
  addDays(date: Date | number, days: number): Date {
    return addDays(date, days);
  }
  parse(
    date: string | number,
    format: string | DateFormat = DateFormat.SERVER_DATE_FORMAT
  ): Date {
    const dateString = DataUtils.isNumber(date)
      ? this.format(date as number)
      : (date as string);

    return parse(dateString, this.normalizeDateFormat(format), new Date());
  }

  format(
    date: Date | number | string,
    dateFormat: string | DateFormat = DateFormat.DISPLAY_DATE_FORMAT
  ): string {
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    let parsedDate = '';
    try {
      parsedDate = format(inputDate, this.normalizeDateFormat(dateFormat));
    } catch (err) {
      console.error(err, inputDate);
    }
    return parsedDate;
  }

  private normalizeDateFormat(format: string): string {
    return format.replace(/[D]{1,}/g, 'd').replace(/[Y]{1,}/g, 'y');
  }
}
