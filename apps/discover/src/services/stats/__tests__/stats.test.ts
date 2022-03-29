import '__mocks/mockContainerAuth';

import { setupServer } from 'msw/node';

import { getMockStatData } from '../__fixtures/stats';
import { getMockStatFindGet } from '../__mocks/getMockStatFindGet';
import { getMockStatGet } from '../__mocks/getMockStatGet';
import { STATS_ERROR } from '../constants';
import { stats } from '../stats';
import { StatsApiResult } from '../types';

const mockResponseData: StatsApiResult = {
  success: 'true',
  ...getMockStatData(),
};

describe('Stats errors', () => {
  const mockServer = setupServer(
    getMockStatFindGet(undefined),
    getMockStatGet(undefined)
  );
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected error', async () => {
    await expect(stats.get({ headers: {} })).rejects.toThrowError(STATS_ERROR);
  });
});

describe('Stats success', () => {
  const mockServer = setupServer(
    getMockStatFindGet(mockResponseData),
    getMockStatGet(mockResponseData)
  );
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with stat.get', async () => {
    const result = await stats.get({ headers: {} });
    expect(result).toEqual(mockResponseData.data.stats);
  });
});
