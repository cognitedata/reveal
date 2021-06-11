import { mockDataRuns } from 'utils/mockResponse';
import {
  getDatesForXAxis,
  groupRunsByDate,
  getStatusCountGroupedByDate,
  mapDataForChart,
  creatTimeFormatterBy,
} from 'components/chart/runChartUtils';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';
import { mapStatusRow } from 'utils/runsUtils';

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
