import { getTime } from 'date-fns';
import { isEqual } from 'lodash';
import { useDebounce } from 'use-debounce';

export const useDebouncedDateRange = (dateFrom: string, dateTo: string) => {
  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });
  return [
    getTime(new Date(debouncedRange.dateFrom)),
    getTime(new Date(debouncedRange.dateTo)),
  ];
};
