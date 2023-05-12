import { DateRange } from '../types';
import { formatDate } from './formatDate';

export const formatDateRangeForAxis = (
  dateRange: DateRange
): [string, string] => {
  const [from, to] = dateRange;

  return [formatDate(from), formatDate(to)];
};
