import { DateRange, FileInfo } from '@cognite/sdk';
import moment from 'moment';
import { mockFileInfo } from 'src/__test-utils/data/mockFileInfo';
import { timeFormat } from 'src/modules/FilterSidePanel/Components/Filters/TimeFilter';
import { DateActions, DateOptions } from 'src/modules/FilterSidePanel/types';
import {
  calculateTotalSeconds,
  filterByTime,
  validate,
} from './filterByTimeUtils';

describe('Testing calculateTotalSeconds fn', () => {
  it('If item time is 0', () => {
    const date = new Date(2021, 0, 0, 0, 0, 0, 0);
    expect(calculateTotalSeconds(date)).toBe(0);
  });
});

describe('Testing validate function in time filter', () => {
  const timeRange: DateRange = {
    min: moment('6:00 AM', timeFormat).valueOf(),
    max: moment('6:00 PM', timeFormat).valueOf(),
  };
  it('Time within the range', () => {
    const date = new Date(2021, 0, 0, 8, 0, 0, 0);
    expect(validate(timeRange, date)).toBe(true);
  });
  it('Time below the range', () => {
    const date = new Date(2021, 0, 0, 4, 0, 0, 0);
    expect(validate(timeRange, date)).toBe(false);
  });
  it('Time higher the range', () => {
    const date = new Date(2021, 0, 0, 20, 0, 0, 0);
    expect(validate(timeRange, date)).toBe(false);
  });
  it('If item time is 0', () => {
    const date = new Date(2021, 0, 0, 0, 0, 0, 0);
    expect(validate(timeRange, date)).toBe(false);
  });

  const timeRangeZeroMin: DateRange = {
    min: moment('0:00 AM', timeFormat).valueOf(),
    max: moment('6:00 PM', timeFormat).valueOf(),
  };
  it('If range has 0 min time and valid date', () => {
    const date = new Date(2021, 0, 0, 4, 0, 0, 0);
    expect(validate(timeRangeZeroMin, date)).toBe(true);
  });
  it('If range has 0 min time and invalid date', () => {
    const date = new Date(2021, 0, 0, 20, 0, 0, 0);
    expect(validate(timeRangeZeroMin, date)).toBe(false);
  });
});

describe('Testing filterByTime fn', () => {
  const items: FileInfo[] = mockFileInfo;
  it('No filters defined', () => {
    expect(filterByTime({}, items)).toHaveLength(items.length);
  });
  it('min time defined', () => {
    expect(
      filterByTime(
        {
          timeRange: {
            min: moment('8:00 AM', timeFormat).valueOf(),
          },
        },
        items
      )
    ).toHaveLength(11);
  });
  it('max time defined', () => {
    expect(
      filterByTime(
        {
          timeRange: {
            max: moment('1:00 PM', timeFormat).valueOf(),
          },
        },
        items
      )
    ).toHaveLength(8);
  });
  it('min and max time defined', () => {
    expect(
      filterByTime(
        {
          timeRange: {
            min: moment('8:00 AM', timeFormat).valueOf(),
            max: moment('1:00 PM', timeFormat).valueOf(),
          },
        },
        items
      )
    ).toHaveLength(4);
  });
  it('with uploaded after filter defined', () => {
    expect(
      filterByTime(
        {
          timeRange: {
            max: moment('1:00 PM', timeFormat).valueOf(),
          },
          dateFilter: {
            action: DateActions.created,
            dateOption: DateOptions.before,
          },
        },
        items
      )
    ).toHaveLength(8);
  });
  it('with captured range filter defined', () => {
    expect(
      filterByTime(
        {
          timeRange: {
            min: moment('8:00 AM', timeFormat).valueOf(),
            max: moment('1:00 PM', timeFormat).valueOf(),
          },
          dateFilter: {
            action: DateActions.created,
            dateOption: DateOptions.before,
          },
        },
        items
      )
    ).toHaveLength(4);
  });
});
