import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';
import {
  getMockDepthMeasurements,
  getMockDepthMeasurementData,
} from 'services/well/measurements/__mocks/mockMeasurements';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/loading/constants';

import { Measurements } from '../Measurements';

describe('Favorite Details Content', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0),
    getMockDepthMeasurementData(0),
    getMockConfigGet(),
    getMockWellsById()
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = () => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    return testRenderer(Measurements, store);
  };

  it('should render "Load More" button', async () => {
    await page();

    await waitFor(() => {
      expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    });
  });
});
