import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockDepthMeasurementData } from 'domain/wells/measurements0/service/__mocks/getMockDepthMeasurementData';
import { getMockDepthMeasurementDataRejectAll } from 'domain/wells/measurements0/service/__mocks/getMockDepthMeasurementDataRejectAll';
import { getMockDepthMeasurements } from 'domain/wells/measurements0/service/__mocks/getMockDepthMeasurements';
import { getMockWell } from 'domain/wells/well/service/__fixtures/well';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';
import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT, NO_RESULTS_TEXT } from 'components/Loading/constants';
import { SET_ERRORS } from 'modules/inspectTabs/types';

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
        expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);
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

describe('Measurement with loading errors', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0),
    getMockDepthMeasurementDataRejectAll(),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById([
      getMockWell({
        wellbores: [
          getMockWellbore(),
          getMockWellbore({
            name: 'wellbore C',
            matchingId: 'test-well-2',
            wellMatchingId: 'test-well-2',
            description: 'wellbore C desc',
          }),
        ],
      }),
    ])
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = async () => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true, 'test-well-2': true },
      },
    });
    testRenderer(Measurements, store);
    return { store };
  };

  it('Should throw error action', async () => {
    const { store } = await page();

    await waitFor(
      () => {
        expect(store.getActions().length).toBeGreaterThan(1);
      },
      { timeout: 5000 }
    );
    expect(store.getActions()[0].type).toEqual(SET_ERRORS);
  }, 10000);
});
