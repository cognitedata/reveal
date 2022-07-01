import 'modules/map/__mocks/mockMapbox';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { screen, fireEvent } from '@testing-library/react';

import { getMockMeasurementChartData } from '__test-utils/fixtures/measurements';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellCentricCard, Props } from '../WellCentricCard';

const GEOMECHANICS_CURVE_NAME = 'Geomechanics curve';
const PPFG_CURVE_NAME = 'Geomechanics curve';
const LOT_CURVE_NAME = 'Geomechanics curve';
const FIT_CURVE_NAME = 'Geomechanics curve';

const X_AXIS = 'TVD(ft)';
const Y_AXIS = 'Pressure(ppg)';

describe('WellCentricCard Tests', () => {
  const page = (props: Props) => {
    const store = getMockedStore({
      wellInspect: {
        selectedWellIds: { 'test-well-1': true },
        selectedWellboreIds: { 'test-well-1': true },
      },
    });

    return testRenderer(WellCentricCard, store, props);
  };

  // set location url correctly so child elements get rendered
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should plot wellbore data with curves and axis info', async () => {
    const geomechanicsCurve = getMockMeasurementChartData({
      customdata: [GEOMECHANICS_CURVE_NAME],
    });
    const ppfgCurve = getMockMeasurementChartData({
      customdata: [PPFG_CURVE_NAME],
    });
    const fitCurve = getMockMeasurementChartData({
      customdata: [LOT_CURVE_NAME],
    });
    const lotCurve = getMockMeasurementChartData({
      customdata: [FIT_CURVE_NAME],
    });
    const onToggle = jest.fn();
    const wellbore = getMockWellbore();
    page({
      wellbore,
      chartData: [geomechanicsCurve, ppfgCurve, fitCurve, lotCurve],
      axisNames: {
        x: X_AXIS,
        y: Y_AXIS,
      },
      filters: {
        nptEvents: {},
        ndsEvents: {},
      },
      selected: true,
      onToggle,
    });
    expect(screen.getByText(GEOMECHANICS_CURVE_NAME)).toBeInTheDocument();
    expect(screen.getByText(PPFG_CURVE_NAME)).toBeInTheDocument();
    expect(screen.getByText(LOT_CURVE_NAME)).toBeInTheDocument();
    expect(screen.getByText(FIT_CURVE_NAME)).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(wellbore.id);
  });
});
