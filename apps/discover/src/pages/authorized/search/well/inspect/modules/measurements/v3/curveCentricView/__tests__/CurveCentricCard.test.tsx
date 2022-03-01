import 'modules/map/__mocks/mockMapbox';
import { screen } from '@testing-library/react';

import { getMockMeasurementChartData } from '__test-utils/fixtures/measurements';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { MeasurementTypeV3 as MeasurementType } from 'modules/wellSearch/types';

import { GEOMECHANICS_CRUVES_TITLE, PPFG_CURVES_TITLE } from '../constants';
import { CurveCentricCard, Props } from '../CurveCentricCard';

const GEOMECHANICS_CURVE_NAME_1 = 'Geomechanics curve 1';
const GEOMECHANICS_CURVE_NAME_2 = 'Geomechanics curve 1';
const PPFG_CURVE_NAME_1 = 'Geomechanics curve 1';
const PPFG_CURVE_NAME_2 = 'Geomechanics curve 2';
const LOT_CURVE_NAME = 'Geomechanics curve';
const FIT_CURVE_NAME = 'Geomechanics curve';

const X_AXIS = 'TVD(ft)';
const Y_AXIS = 'Pressure(ppg)';

describe('Favorite Details Content', () => {
  const page = (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    return testRenderer(CurveCentricCard, store, props);
  };

  // set location url correctly so child elements get rendered
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Geomechanics charts show title', async () => {
    const geomechanicsCurveOne = getMockMeasurementChartData({
      customdata: [GEOMECHANICS_CURVE_NAME_1],
    });
    const geomechanicsCurveTwo = getMockMeasurementChartData({
      customdata: [GEOMECHANICS_CURVE_NAME_2],
    });
    page({
      chartData: [geomechanicsCurveOne, geomechanicsCurveTwo],
      axisNames: {
        x: X_AXIS,
        y: Y_AXIS,
      },
      measurementType: MeasurementType.GEOMECHANNICS,
    });
    expect(screen.getByText(GEOMECHANICS_CRUVES_TITLE)).toBeInTheDocument();
  });

  it('Ppfg charts show title', async () => {
    const ppfgCurveOne = getMockMeasurementChartData({
      customdata: [PPFG_CURVE_NAME_1],
    });
    const ppfgCurveTwo = getMockMeasurementChartData({
      customdata: [PPFG_CURVE_NAME_2],
    });
    page({
      chartData: [ppfgCurveOne, ppfgCurveTwo],
      axisNames: {
        x: X_AXIS,
        y: Y_AXIS,
      },
      measurementType: MeasurementType.PPFG,
    });
    expect(screen.getByText(PPFG_CURVES_TITLE)).toBeInTheDocument();
  });

  it('No title for LOT', async () => {
    const lotCurve = getMockMeasurementChartData({
      customdata: [LOT_CURVE_NAME],
    });
    page({
      chartData: [lotCurve],
      axisNames: {
        x: X_AXIS,
        y: Y_AXIS,
      },
      measurementType: MeasurementType.LOT,
    });
    expect(
      screen.queryByText(GEOMECHANICS_CRUVES_TITLE)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(PPFG_CURVES_TITLE)).not.toBeInTheDocument();
  });

  it('No title for FIT', async () => {
    const fitCurve = getMockMeasurementChartData({
      customdata: [FIT_CURVE_NAME],
    });
    page({
      chartData: [fitCurve],
      axisNames: {
        x: X_AXIS,
        y: Y_AXIS,
      },
      measurementType: MeasurementType.LOT,
    });
    expect(
      screen.queryByText(GEOMECHANICS_CRUVES_TITLE)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(PPFG_CURVES_TITLE)).not.toBeInTheDocument();
  });
});
