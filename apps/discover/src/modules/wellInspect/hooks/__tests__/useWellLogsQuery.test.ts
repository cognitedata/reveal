import 'services/well/__mocks/setupWellsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockDepthMeasurements } from 'services/well/measurements/__mocks/mockMeasurements';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useWellLogsQuery } from '../useWellLogsQuery';

const mockServer = setupServer(getMockDepthMeasurements());

describe('useWellLogsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should be ok', async () => {
    const { result, waitFor } = renderHook(
      () => useWellLogsQuery(['pequin-wellbore-OMN2000002000']),
      { wrapper }
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await waitFor(() => result.current.isLoading === false);
    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({
        wellboreMatchingId: 'pequin-wellbore-OMN2000002000',
      })
    );
  });
});
