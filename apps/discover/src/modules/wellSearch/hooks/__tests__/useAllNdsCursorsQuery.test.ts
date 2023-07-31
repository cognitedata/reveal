import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockNDSEventsPost } from 'domain/wells/nds/service/__mocks/getMockNDSEventsPost';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { useAllNdsCursorsQuery } from '../useAllNdsCursorsQuery';

const mockServer = setupServer(getMockNDSEventsPost());

describe('useAllNdsCursorsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should return filtered NDS events', async () => {
    const { result, waitFor } = renderHookWithStore(() =>
      useAllNdsCursorsQuery({
        wellboreIds: new Set(['wellboreMatchingId-2']),
      })
    );
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({ wellboreMatchingId: 'wellboreMatchingId-2' })
    );
  });
  test('should return undefined when no wellboreId is passed', async () => {
    const { result } = renderHookWithStore(() =>
      useAllNdsCursorsQuery({
        wellboreIds: new Set([]),
      })
    );

    expect(result.current.data).toBeUndefined();
  });
});
