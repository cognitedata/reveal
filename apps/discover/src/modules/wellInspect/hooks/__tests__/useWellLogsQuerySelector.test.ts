import 'services/well/__mocks/setupWellsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';
import { getMockDepthMeasurements } from 'services/well/measurements/__mocks/mockMeasurements';

import { mockedWellStateWithWellInspect } from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useSelectedWellboreLogs } from '../useWellLogsQuerySelectors';

const mockServer = setupServer(
  getMockDepthMeasurements(),
  getMockWellsById(),
  getMockConfigGet()
);

const mockStore = getMockedStore(mockedWellStateWithWellInspect);

describe('useSelectedWellboreLogs', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should be ok', async () => {
    const { result, waitFor } = renderHook(() => useSelectedWellboreLogs(), {
      wrapper: ({ children }) => testWrapper({ children, store: mockStore }),
    });

    await waitFor(() => result.current.data.length !== 0);

    expect(result.current.data[0]).toEqual(
      expect.objectContaining({
        wellboreMatchingId: 'test-well-1',
      })
    );
  });
});
