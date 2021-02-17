import moment from 'moment';
import mapRuns, {
  filterByTimeBetween,
  filterRuns,
  isWithinDaysInThePast,
  mapStatus,
  RunStatus,
} from './runsUtils';
import { Status } from '../model/Status';
import { mockDataRunsResponse } from './mockResponse';
import { StatusRow } from '../model/Runs';

describe('runsUtils', () => {
  test('Maps correctly', () => {
    const mock: StatusRow[] = mockDataRunsResponse.items;
    const res = mapRuns(mock);
    expect(res.length).toEqual(6);
    res.forEach(({ subRows, status, statusSeen }) => {
      expect(subRows).toBeDefined();
      expect(status).toBeDefined();
      expect(statusSeen).toBeDefined();
    });
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
