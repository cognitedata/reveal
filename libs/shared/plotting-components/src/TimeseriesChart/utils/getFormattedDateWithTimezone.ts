import { getFormattedDate } from './getFormattedDate';
import { getFormattedTime } from './getFormattedTime';
import { getFormattedTimezone } from './getFormattedTimezone';

export const getFormattedDateWithTimezone = (timestamp: Date) => {
  const date = getFormattedDate(timestamp);
  const time = getFormattedTime(timestamp);
  const timezone = getFormattedTimezone(timestamp);

  return `${date}, ${time} ${timezone}`;
};
