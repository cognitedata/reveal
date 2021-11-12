import { DateFormat } from '../../types/date-format.enum';

export abstract class DateUtils {
  /**
   * Convert UNIX timestamp to string
   * @param timestamp timestamp as number, ex. 1636107405779
   * @param format - DateFormat, default is enum DateFormat.DISPLAY_DATE_FORMAT
   */
  abstract parseTimestamp(
    timestamp: number,
    formatString?: DateFormat | string
  ): string;
}
