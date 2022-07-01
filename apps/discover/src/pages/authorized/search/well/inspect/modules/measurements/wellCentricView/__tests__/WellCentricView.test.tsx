import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import 'modules/map/__mocks/mockMapbox';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockDepthMeasurementData } from 'domain/wells/measurements0/service/__mocks/getMockDepthMeasurementData';
import { getMockDepthMeasurements } from 'domain/wells/measurements0/service/__mocks/getMockDepthMeasurements';
import { getMockWell } from 'domain/wells/well/service/__fixtures/well';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';
import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import {
  getMockDepthMeasurementDataWellboreOne,
  getMockDepthMeasurementItem,
} from '__test-utils/fixtures/measurements';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT, NO_RESULTS_TEXT } from 'components/Loading/constants';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { SET_ERRORS } from 'modules/inspectTabs/types';

import { WellCentricView, Props } from '../WellCentricView';

describe('WellCentricView Tests api return empty sequence list', () => {
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
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
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
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
    });
    await waitFor(
      () => {
        expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
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
    getMockConfigGet(),
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
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
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
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
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

describe('Measuremnts with loading errors ( unit )', () => {
  const mockDepthMeasurementItem =
    getMockDepthMeasurementItem('mockmatchindId');
  const mockServer = setupServer(
    getMockDepthMeasurements(0, [
      {
        ...mockDepthMeasurementItem,
        depthColumn: {
          ...mockDepthMeasurementItem.depthColumn,
          unit: {
            unit: 'wrongUnit' as any,
            factor: 1,
          },
        },
      },
    ]),
    getMockDepthMeasurementData(),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById([
      getMockWell({
        wellbores: [getMockWellbore()],
      }),
    ])
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = async (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true, 'test-well-2': true },
      },
    });
    testRenderer(WellCentricView, store, props);
    return { store };
  };

  it('Should throw error action for wrong unit', async () => {
    const { store } = await page({
      geomechanicsCurves: [],
      ppfgCurves: [
        {
          measurementType: 'fracture pressure pre drill mean',
          columnExternalId: 'FP_CARBONATE_ML',
          unit: 'psi',
        },
      ],
      otherTypes: [],
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
    });

    await waitFor(
      () => {
        expect(store.getActions().length).toEqual(1);
      },
      { timeout: 5000 }
    );
    expect(store.getActions()[0].type).toEqual(SET_ERRORS);
  }, 10000);
});

describe('Measuremnts with loading errors ( measurement type )', () => {
  const depthMeasurementData = getMockDepthMeasurementDataWellboreOne();
  const mockServer = setupServer(
    getMockDepthMeasurements(),
    getMockDepthMeasurementData(0, {
      ...depthMeasurementData,
      columns: [
        depthMeasurementData.columns[0], // TVD column
        depthMeasurementData.columns[1], // MD column
        {
          externalId: 'FP_CARBONATE_ML',
          measurementType: 'unsupported measurement type',
          unit: 'psi',
          valueType: 'double',
          name: 'FP_CARBONATE_ML',
        },
      ],
    }),
    getMockUserMe(),
    getMockConfigGet(),
    getMockWellsById([
      getMockWell({
        wellbores: [getMockWellbore()],
      }),
    ])
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = async (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true, 'test-well-2': true },
      },
    });
    testRenderer(WellCentricView, store, props);
    return { store };
  };

  it('Should throw error action for wrong unit', async () => {
    const { store } = await page({
      geomechanicsCurves: [],
      ppfgCurves: [
        {
          measurementType: 'fracture pressure pre drill mean',
          columnExternalId: 'FP_CARBONATE_ML',
          unit: 'psi',
        },
      ],
      otherTypes: [],
      measurementReference: DepthMeasurementUnit.TVD,
      pressureUnit: PressureUnit.PPG,
    });

    await waitFor(
      () => {
        expect(store.getActions().length).toEqual(1);
      },
      { timeout: 5000 }
    );
    expect(store.getActions()[0].type).toEqual(SET_ERRORS);
  }, 10000);
});
