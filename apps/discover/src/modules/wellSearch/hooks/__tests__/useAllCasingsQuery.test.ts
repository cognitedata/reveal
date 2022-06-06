import 'domain/wells/__mocks/setupWellsMockSDK';
import { setupServer } from 'msw/node';

import { getMockCasingsList } from '__mocks/mockCasings';
import { renderHookWithStore } from '__test-utils/renderer';

import { useAllCasingsQuery } from '../useAllCasingsQuery';

const mockServer = setupServer(getMockCasingsList());

describe('useAllCasingsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should be ok', async () => {
    const { result, waitFor } = renderHookWithStore(() =>
      useAllCasingsQuery({ wellboreIds: new Set(['wellbore A']) })
    );

    await waitFor(() => expect(result.current.isLoading).toEqual(false));

    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({ wellboreMatchingId: 'wellbore A' })
    );
  });
});
