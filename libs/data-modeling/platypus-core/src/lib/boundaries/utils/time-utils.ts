export abstract class TimeUtils {
  /**
   * Get hour from time string
   * @param timeString time as string in 24 format - 11:35
   */
  abstract getHourFromTimeString(timeString: string): string;

  /**
   * Get minutes from time string
   * @param timeString time as string in 24 format - 11:35
   */
  abstract getMinuteFromTimeString(timeString: string): string;

  /**
   * Convert hours and minutes in 12h format string
   * @param hours - hours to be converted
   * @param minutes - minutes
   * @param over24Disabled - flag that indicates if (+24) string should be appended if is hour is 24+
   */
  abstract getTwelveHourTimeString(hours?: number, minutes?: number): string;

  /**
   * Convert hours and minutes as 24h format string
   * @param hours
   * @param minutes
   */
  abstract getMilitaryTimeString(hours: number, minutes: number): string;

  /**
   * Check if start time is after end time. Time is expected to be in 24h format
   * @param startTimeString
   * @param endTimeString
   */
  abstract checkIfEndTimeIsAfterStartTime(
    startTimeString: string,
    endTimeString: string
  ): boolean;

  abstract isTwelveHourTimeFormat(input: string): boolean;

  abstract isMilitaryTimeFormat(input: string): boolean;
}
