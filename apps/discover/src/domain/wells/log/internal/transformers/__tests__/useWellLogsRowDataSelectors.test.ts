import 'domain/wells/__mocks/setupWellsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockDepthMeasurementData } from 'services/well/measurements/__mocks/mockMeasurements';

import { getMockDepthMeasurementDataWellboreOne } from '__test-utils/fixtures/measurements';
import { testWrapper } from '__test-utils/renderer';

import { useWellLogsRowDataKeyBySource } from '../useWellLogsRowDataSelectors';

const sequenceId = '23';
const sourceName = 'test-sourceName';

const mockServer = setupServer(
  getMockDepthMeasurementData(
    0,
    getMockDepthMeasurementDataWellboreOne({
      source: {
        sequenceExternalId: sequenceId,
        sourceName,
      },
      nextCursor: undefined,
    })
  )
);

describe('useWellLogsRowDataKeyBySource', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should be ok', async () => {
    const { result, waitFor } = renderHook(
      () => useWellLogsRowDataKeyBySource([sequenceId]),
      { wrapper: testWrapper }
    );

    expect(result.current.data).toEqual({});

    await waitFor(() => result.current.isLoading === false);

    expect(result.current.data[sequenceId]).toEqual(
      expect.objectContaining({
        source: {
          sequenceExternalId: sequenceId,
          sourceName,
        },
      })
    );
  });
});
