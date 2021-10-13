import moment from 'moment';
import { RunStatusAPI, RunStatusUI } from 'model/Status';
import { mockDataRunsResponse } from 'utils/mockResponse';
import {
  filterByTimeBetween,
  filterRuns,
  isWithinDaysInThePast,
  mapStatus,
  mapStatusRow,
} from 'utils/runsUtils';

describe('runsUtils', () => {
  test('mapStatus - maps api status to view status', () => {
    const apiStatus = [
      { value: 'success', expected: RunStatusUI.SUCCESS },
      { value: 'Success', expected: RunStatusUI.SUCCESS },
      { value: RunStatusAPI.SUCCESS, expected: RunStatusUI.SUCCESS },
      { value: 'failure', expected: RunStatusUI.FAILURE },
      { value: 'Failure', expected: RunStatusUI.FAILURE },
      { value: RunStatusAPI.FAILURE, expected: RunStatusUI.FAILURE },
      { value: 'seen', expected: RunStatusUI.SEEN },
      { value: 'Seen', expected: RunStatusUI.SEEN },
      { value: RunStatusAPI.SEEN, expected: RunStatusUI.SEEN },
      { value: 'RunStatus.SEEN', expected: RunStatusUI.NOT_ACTIVATED },
    ];
    apiStatus.forEach(({ value, expected }) => {
      const res = mapStatus(value);
      expect(res).toEqual(expected);
    });
  });

  test('filterRuns - filters success and failure', () => {
    const res = filterRuns(mockDataRunsResponse.items);
    res.forEach(({ status }) => {
      expect(
        status === RunStatusUI.SUCCESS || status === RunStatusUI.FAILURE
      ).toEqual(true);
      expect(status !== RunStatusUI.SEEN).toEqual(true);
    });
  });

  test('filterByTimeBetween', () => {
    const isWithinTwoDaysInThePast = filterByTimeBetween(
      moment().subtract(2, 'days'),
      moment()
    );
    const res = isWithinTwoDaysInThePast({
      createdTime: moment().subtract(1, 'hour').valueOf(),
    });
    expect(res).toEqual(true);
  });

  test('isWithinDaysInThePast', () => {
    const isWithinAWeekInThePast = isWithinDaysInThePast(7);
    const res = isWithinAWeekInThePast({
      createdTime: moment().subtract(2, 'days').valueOf(),
    });
    expect(res).toEqual(true);
  });
});

describe('mapStatusRow', () => {
  const statuses = [
    { id: 1, status: RunStatusAPI.SUCCESS },
    { id: 2, status: RunStatusAPI.SUCCESS, message: 'this is the message' },
    { id: 3, status: RunStatusAPI.FAILURE },
    { id: 4, status: RunStatusAPI.FAILURE, message: 'error' },
    { id: 5, status: RunStatusAPI.SEEN, message: 'seen message' },
    { id: 6, status: RunStatusAPI.SEEN },
  ];

  test(`maps runs`, () => {
    const res = mapStatusRow(statuses);
    expect(res.length).toEqual(6);
    expect(res[0].status).toEqual(RunStatusUI.SUCCESS);
    expect(res[1].status).toEqual(RunStatusUI.SUCCESS);
    expect(res[2].status).toEqual(RunStatusUI.FAILURE);
    expect(res[3].status).toEqual(RunStatusUI.FAILURE);
  });
});
