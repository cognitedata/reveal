import addDays from 'date-fns/addDays';
import addMinutes from 'date-fns/addMinutes';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';

export class TimeUtils {
  public static addMinutes(timeStamp: number, minutes: number) {
    return addMinutes(timeStamp, minutes);
  }
  public static addDays(timeStamp: number, days: number) {
    return addDays(timeStamp, days);
  }

  public static differenceInMilliseconds(
    laterTime: number,
    earlierTime: number
  ) {
    return differenceInMilliseconds(laterTime, earlierTime);
  }
}
