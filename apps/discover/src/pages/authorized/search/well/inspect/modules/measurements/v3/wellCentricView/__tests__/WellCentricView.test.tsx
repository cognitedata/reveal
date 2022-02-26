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

import { getMockConfig } from '__test-utils/fixtures/projectConfig';
import { getMockWellbore } from '__test-utils/fixtures/well/wellbore';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { NO_DATA_AVAILABLE_TEXT } from 'components/charts/common/NoDataAvailable/constants';
import { LOADING_TEXT } from 'components/loading/constants';

import { WellCentricView, Props } from '../WellCentricView';

describe('WellCentricView Tests api return empty sequence list', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(0, []),
    getMockDepthMeasurementData(0),
    getMockUserMe(),
    getMockConfigGet(
      getMockConfig({
        wells: {
          measurements: {
            enabled: true,
          },
        },
      })
    ),
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

    return testRenderer(WellCentricView, store, props);
  };

  // set location url correctly so child elements get rendered
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
        expect(screen.getByText(NO_DATA_AVAILABLE_TEXT)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

describe('WellCentricView Tests api return data sequence list', () => {
  const mockServer = setupServer(
    getMockDepthMeasurements(),
    getMockDepthMeasurementData(),
    getMockUserMe(),
    getMockConfigGet(
      getMockConfig({
        wells: {
          measurements: {
            enabled: true,
          },
          disabled: false,
        },
        general: {
          enableWellSDKV3: true,
        },
      })
    ),
    getMockWellsById()
  );

  const store = getMockedStore({
    wellInspect: {
      selectedWellIds: { 'test-well-1': true },
      selectedWellboreIds: { 'test-well-1': true },
    },
  });
  const wellbore = getMockWellbore();
  const testInit = async (props: Props) =>
    testRenderer(WellCentricView, store, props);

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('Should show well data', async () => {
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
        expect(
          screen.getByText(new RegExp(wellbore.name, 'g'))
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);
});
