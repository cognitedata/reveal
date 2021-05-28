import moment from 'moment';
import {
  DAYS_30,
  DAYS_7,
  HOURS_1,
  HOURS_24,
  quickFilterOptions,
} from 'components/table/QuickDateTimeFilters';
import { findSelectedRangeOption, isDateDiffLessThanDays } from './dateUtils';

describe('dateUtils', () => {
  const cases = [
    {
      desc: '2020-03-13',
      value: 1584137100000,
      numberOfDays: 1,
      expected: false,
    },
    { desc: 'Now', value: moment(), numberOfDays: 1, expected: true },
  ];
  cases.forEach(({ desc, value, numberOfDays, expected }) => {
    test(`isDateDiffLessThanDays - ${desc}`, () => {
      // @ts-ignore
      const res = isDateDiffLessThanDays(value, numberOfDays, 'days');
      expect(res).toEqual(expected);
    });
  });
});

describe('findSelectedRangeOption', () => {
  const cases = [
    {
      dateRange: {
        startDate: moment().subtract(1, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: HOURS_1,
    },
    {
      dateRange: {
        startDate: moment().subtract(2, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: undefined,
    },
    {
      dateRange: {
        startDate: moment().subtract(24, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: HOURS_24,
    },
    {
      dateRange: {
        startDate: moment().subtract(1, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: HOURS_24,
    },
    {
      dateRange: {
        startDate: moment().subtract(2, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: undefined,
    },
    {
      dateRange: {
        startDate: moment().subtract(7, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: DAYS_7,
    },
    {
      dateRange: {
        startDate: moment().subtract(30, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: DAYS_30,
    },
    {
      dateRange: {
        startDate: moment().subtract(1, 'month').toDate(),
        endDate: moment().toDate(),
      },
      expected: DAYS_30,
    },
    {
      dateRange: {
        startDate: moment().subtract(1, 'month').toDate(),
        endDate: moment().subtract(1, 'hour').toDate(),
      },
      expected: undefined,
    },
  ];
  cases.forEach(({ dateRange, expected }) => {
    test(`start: ${dateRange.startDate} end: ${dateRange.endDate} result: ${expected}`, () => {
      const res = findSelectedRangeOption(quickFilterOptions(), dateRange);
      expect(res).toEqual(expected);
    });
  });
});
