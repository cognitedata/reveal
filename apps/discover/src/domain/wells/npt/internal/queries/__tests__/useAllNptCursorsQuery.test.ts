import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockNPTV3 } from 'domain/wells/npt/service/__fixtures/getMockNPTV3';
import { getMockNPTListPost } from 'domain/wells/npt/service/__mocks/getMockNPTListPost';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { useAllNptCursorsQuery } from '../useAllNptCursorsQuery';

const mockServer = setupServer(getMockNPTListPost());

describe('useAllNptCursorsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with input', async () => {
    const wellboreIds = new Set<string>();
    wellboreIds.add(getMockNPTV3().wellboreMatchingId);

    const { result, waitForNextUpdate } = renderHookWithStore(() =>
      useAllNptCursorsQuery({ wellboreIds })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual([getMockNPTV3()]);
  });
});
