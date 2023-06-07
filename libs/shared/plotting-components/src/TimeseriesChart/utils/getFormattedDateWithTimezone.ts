import { getFormattedDate } from './getFormattedDate';
import { getFormattedTimezone } from './getFormattedTimezone';

export const getFormattedDateWithTimezone = (timestamp: Date) => {
  const date = getFormattedDate(timestamp);
  const timezone = getFormattedTimezone(timestamp);

  return `${date}, ${timezone}`;
};
