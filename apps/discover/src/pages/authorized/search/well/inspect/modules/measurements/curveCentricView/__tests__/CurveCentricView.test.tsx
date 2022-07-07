import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockDepthMeasurementData } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurementData';
import { getMockDepthMeasurements } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurements';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

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
          externalId: 'FP_CARBONATE_ML',
          unit: 'psi',
          valueType: 'double',
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
