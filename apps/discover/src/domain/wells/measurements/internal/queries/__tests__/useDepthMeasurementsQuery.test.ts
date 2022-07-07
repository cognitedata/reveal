import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockDepthMeasurements } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurements';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useDepthMeasurementsQuery } from '../useDepthMeasurementsQuery';

const mockServer = setupServer(getMockDepthMeasurements());

describe('useWellLogsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should be ok', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useDepthMeasurementsQuery({
          wellboreIds: ['pequin-wellbore-OMN2000002000'],
        }),
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
