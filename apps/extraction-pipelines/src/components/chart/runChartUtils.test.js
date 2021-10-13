import { mockDataRuns } from 'utils/mockResponse';
import {
  getDatesForXAxis,
  groupRunsByDate,
  getStatusCountGroupedByDate,
  mapDataForChart,
  creatTimeFormatterBy,
  DATE_HOUR_MIN_FORMAT,
  DATE_HOUR_FORMAT,
  mapRangeToGraphTimeFormat,
} from 'components/chart/runChartUtils';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';
import { mapStatusRow } from 'utils/runsUtils';
import moment from 'moment';

describe('Chart utils', () => {
  const numberOfDates = 4;
  test('format', () => {
    const formatter = creatTimeFormatterBy('YYYY-MM-DD');
    const res = formatter(new Date(2021, 4, 1, 10, 0).getTime());
    expect(res).toEqual('2021-05-01');
  });

  test('getDatesForXAxis', () => {
    const data = mockDataRuns.items;
    const res = getDatesForXAxis({ data, by: DATE_FORMAT });
    expect(res.length).toEqual(numberOfDates);
  });
  test('getStatusCountGroupedByDate', () => {
    const data = mockDataRuns.items;
    const res = getStatusCountGroupedByDate({
      data,
      status: 'success',
      by: DATE_FORMAT,
    });
    expect(res).toEqual([0, 2, 2, 4]);
  });

  test('groupRunsByDate', () => {
    const data = mockDataRuns.items;
    const res = groupRunsByDate({ data, by: DATE_FORMAT });
    const dates = Object.keys(res);
    expect(dates.length).toEqual(numberOfDates);
    expect(res[dates[0]].length).toEqual(3);
    expect(res[dates[1]].length).toEqual(3);
    expect(res[dates[2]].length).toEqual(4);
    expect(res[dates[3]].length).toEqual(8);
  });

  test('mapDataForChart', () => {
    const data = mockDataRuns.items;
    const res = mapDataForChart({ data: mapStatusRow(data), by: 'YYYY-MM-DD' });
    expect(res.allDates.length).toEqual(numberOfDates);
    expect(res.seenByDate.length).toEqual(numberOfDates);
    const seen = [2, 1, 1, 4];
    expect(res.seenByDate).toEqual(seen);
    expect(res.successByDate.length).toEqual(numberOfDates);
    const success = [0, 2, 2, 4];
    expect(res.successByDate).toEqual(success);
    expect(res.failureByDate.length).toEqual(numberOfDates);
    const fail = [1, 0, 1, 0];
    expect(res.failureByDate).toEqual(fail);
  });
});

describe('mapRangeToGraphTimeFormat', () => {
  const cases = [
    {
      range: {
        startDate: moment().subtract(10, 'seconds').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_MIN_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(10, 'minute').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_MIN_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(1, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_MIN_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(23, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_MIN_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(25, 'hour').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(1, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(6, 'day').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_HOUR_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(7, 'days').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(30, 'days').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_FORMAT,
    },
    {
      range: {
        startDate: moment().subtract(1, 'year').toDate(),
        endDate: moment().toDate(),
      },
      expected: DATE_FORMAT,
    },
  ];
  cases.forEach(({ range, expected }, i) => {
    test(`${i}: ${range.startDate.toISOString()} and ${range.endDate.toISOString()} should return ${expected}`, () => {
      const res = mapRangeToGraphTimeFormat(range);
      expect(res.format).toEqual(expected);
    });
  });
});
