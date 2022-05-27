import '__mocks/mockContainerAuth'; // should be first
import 'services/wellSearch/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import {
  getMockDepthMeasurements,
  getMockDepthMeasurementData,
} from 'services/well/measurements/__mocks/mockMeasurements';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT, NO_RESULTS_TEXT } from 'components/Loading/constants';

import { CurveCentricView, Props } from '../CurveCentricView';

describe('CurveCentricView Tests api return empty sequence list', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0, []),
    getMockDepthMeasurementData(0),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById()
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    return testRenderer(CurveCentricView, store, props);
  };

  it('Should show loading', async () => {
    page({
      geomechanicsCurves: [],
      ppfgCurves: [],
      otherTypes: [],
      measurementReference: 'ft',
      pressureUnit: 'ppa',
    });
    await waitFor(() => {
      expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    });
  });

  it('Should show no data', async () => {
    page({
      geomechanicsCurves: [],
      ppfgCurves: [],
      otherTypes: [],
      measurementReference: 'ft',
      pressureUnit: 'ppa',
    });
    await waitFor(
      () => {
        expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

describe('CurveCentricView Tests api return data sequence list', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(),
    getMockDepthMeasurementData(),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById()
  );

  const store = getMockedStore({
    wellInspect: {
      selectedWellIds: { 'test-well-1': true },
      selectedWellboreIds: { 'test-well-1': true },
    },
  });
  const testInit = async (props: Props) =>
    testRenderer(CurveCentricView, store, props);

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('Should show loading', async () => {
    await testInit({
      geomechanicsCurves: [],
      ppfgCurves: [],
      otherTypes: [],
      measurementReference: 'ft',
      pressureUnit: 'ppa',
    });
    await waitFor(() => {
      expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    });
  });

  it('Should show PPFG curves ( only ppfg selected in filters )', async () => {
    await testInit({
      geomechanicsCurves: [],
      ppfgCurves: [
        {
          measurementType: 'fracture pressure pre drill mean',
          columnExternalId: 'FP_CARBONATE_ML',
          unit: 'psi',
        },
      ],
      otherTypes: [],
      measurementReference: 'ft',
      pressureUnit: 'ppa',
    });
    await waitFor(
      () => {
        expect(screen.getByText(/PPFG/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);
});
