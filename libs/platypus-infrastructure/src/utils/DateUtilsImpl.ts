import { DateFormat, DateUtils } from '@platypus/platypus-core';
import { format } from 'date-fns';

export class DateUtilsImpl implements DateUtils {
  parseTimestamp(
    timestamp: number,
    formatString?: DateFormat | string
  ): string {
    return format(timestamp, formatString || DateFormat.DISPLAY_DATE_FORMAT);
  }
}
