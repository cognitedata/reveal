import mapRuns from './runsUtils';
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
});
