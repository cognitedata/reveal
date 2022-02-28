import '__mocks/mockContainerAuth'; // should be first
import 'services/well/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';
import {
  getMockDepthMeasurements,
  getMockDepthMeasurementData,
} from 'services/well/measurements/__mocks/mockMeasurements';

import { getMockWellbore } from '__test-utils/fixtures/well/wellbore';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { NO_DATA_AVAILABLE_TEXT } from 'components/charts/common/NoDataAvailable/constants';
import { LOADING_TEXT } from 'components/loading/constants';

import { Measurements } from '../Measurements';

describe('Measurement with delayed loading and no data', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0, []),
    getMockDepthMeasurementData(0),
    getMockUserMe(),
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

  it('Should render "Load More" button', async () => {
    page();

    await waitFor(() => {
      expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    });
  });

  it('Should render EMPTY state', async () => {
    page();

    await waitFor(
      () => {
        expect(screen.getByText(NO_DATA_AVAILABLE_TEXT)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

describe('Measurement with delayed loading and data available', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(1000),
    getMockDepthMeasurementData(1000),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById()
  );
  const wellbore = getMockWellbore();

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

  it('Should render "Load More" button', async () => {
    page();

    await waitFor(() => {
      expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    });
  });

  it('Should show well bore curve', async () => {
    page();
    await waitFor(
      () => {
        expect(
          screen.getByText(new RegExp(wellbore.name, 'g'))
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);
});
