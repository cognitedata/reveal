import moment from 'moment';
import { Status } from 'model/Status';
import { mockDataRunsResponse } from 'utils/mockResponse';
import { StatusRow } from 'model/Runs';
import mapRuns, {
  filterByTimeBetween,
  filterRuns,
  isWithinDaysInThePast,
  mapStatus,
  mapStatusRow,
  RunStatus,
} from 'utils/runsUtils';

describe('runsUtils', () => {
  test('Maps correctly', () => {
    const mock: StatusRow[] = mockDataRunsResponse.items;
    const res = mapRuns(mock);
    expect(res.length).toEqual(11);
    res.forEach(({ subRows, status, statusSeen }) => {
      expect(subRows).toBeDefined();
      expect(status).toBeDefined();
      expect(statusSeen).toBeDefined();
    });
  });
  test('mapRuns - handles undefined', () => {
    const mock = undefined;
    const res = mapRuns(mock);
    expect(res.length).toEqual(0);
  });

  test('mapStatus - maps api status to view status', () => {
    const apiStatus = [
      { value: 'success', expected: Status.OK },
      { value: 'Success', expected: Status.OK },
      { value: RunStatus.SUCCESS, expected: Status.OK },
      { value: 'failure', expected: Status.FAIL },
      { value: 'Failure', expected: Status.FAIL },
      { value: RunStatus.FAILURE, expected: Status.FAIL },
      { value: 'seen', expected: Status.SEEN },
      { value: 'Seen', expected: Status.SEEN },
      { value: RunStatus.SEEN, expected: Status.SEEN },
      { value: 'RunStatus.SEEN', expected: Status.NOT_ACTIVATED },
    ];
    apiStatus.forEach(({ value, expected }) => {
      const res = mapStatus(value);
      expect(res).toEqual(expected);
    });
  });

  test('filterRuns - filters success and failure', () => {
    const res = filterRuns(mockDataRunsResponse.items);
    res.forEach(({ status }) => {
      expect(status === Status.OK || status === Status.FAIL).toEqual(true);
      expect(status !== Status.SEEN).toEqual(true);
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
    { id: 1, status: RunStatus.SUCCESS },
    { id: 2, status: RunStatus.SUCCESS, message: 'this is the message' },
    { id: 3, status: RunStatus.FAILURE },
    { id: 4, status: RunStatus.FAILURE, message: 'error' },
    { id: 5, status: RunStatus.SEEN, message: 'seen message' },
    { id: 6, status: RunStatus.SEEN },
  ];

  test(`maps runs`, () => {
    const res = mapStatusRow(statuses);
    expect(res.length).toEqual(6);
    expect(res[0].status).toEqual(Status.OK);
    expect(res[1].status).toEqual(Status.OK);
    expect(res[2].status).toEqual(Status.FAIL);
    expect(res[3].status).toEqual(Status.FAIL);
  });
});
