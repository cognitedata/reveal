import {
  getMockDepthMeasurementColumn,
  getDepthMeasurementRowsWithBreakingValues,
  getMockDepthMeasurementDataColumns,
  getMockPpfgsColumns,
  getMockGeomechanicsColumns,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { mockedWellboreResultFixture } from '__test-utils/fixtures/well';
import { UserPreferredUnit, PressureUnit, FEET } from 'constants/units';
import {
  MeasurementType,
  GeoPpfgFilterTypes,
  MeasurementChartData,
} from 'modules/wellSearch/types';

import {
  filterByChartType,
  filterByMainChartType,
  getSelectedWellboresTitle,
  getSelectedWellsTitle,
  mapToCurveCentric,
  getFilterType,
  pushCurveToChart,
  mapCurveToPlotly,
  mapMeasurementToPlotly,
  formatChartData,
} from '../utils';

describe('Measurement filter utils', () => {
  test('Should map chart data to curve centric data', () => {
    const wellbore = {
      ...mockedWellboreResultFixture[0],
      wellName: 'Test Well Name',
      color: '#FFFFFF',
    };
    const chart = {
      measurementType: MeasurementType.PPFG,
      line: {
        color: '#000000',
      },
    };
    expect(mapToCurveCentric([chart], wellbore)).toEqual([
      {
        ...chart,
        customdata: ['Test Well Name', 'wellbore B desc wellbore B'],
        line: {
          color: '#FFFFFF',
        },
      },
    ]);
  });

  test('Should return specific chart data', () => {
    const charts = [
      {
        measurementType: MeasurementType.PPFG,
      },
      {
        measurementType: MeasurementType.GEOMECHANNICS,
      },
    ];
    expect(filterByChartType(charts, [MeasurementType.PPFG])).toEqual([
      charts[0],
    ]);
  });

  test('Should return main chart data', () => {
    const charts = [
      {
        measurementType: MeasurementType.PPFG,
      },
      {
        measurementType: MeasurementType.FIT,
      },
    ];
    expect(filterByMainChartType(charts)).toEqual([charts[0]]);
  });

  test('Should return one wellbore count title', () => {
    expect(getSelectedWellboresTitle(1)).toEqual('1 wellbore selected');
  });

  test('Should return selected multiple wellbores count title', () => {
    expect(getSelectedWellboresTitle(10)).toEqual('10 wellbores selected');
  });

  test('Should return one well count title', () => {
    expect(getSelectedWellsTitle(1)).toEqual('From 1 well');
  });

  test('Should return selected multiple wells count title', () => {
    expect(getSelectedWellsTitle(10)).toEqual('From 10 wells');
  });
});

describe('getFilterType test', () => {
  test('Should return GEOMECHANICS', () => {
    expect(getFilterType(MeasurementType.GEOMECHANNICS)).toBe(
      GeoPpfgFilterTypes.GEOMECHANNICS
    );
  });
  test('Should return PPFG', () => {
    expect(getFilterType(MeasurementType.PPFG)).toBe(GeoPpfgFilterTypes.PPFG);
  });
  test('Should return OTHER for FIT', () => {
    expect(getFilterType(MeasurementType.FIT)).toBe(GeoPpfgFilterTypes.OTHER);
  });
  test('Should return OTHER for LOT', () => {
    expect(getFilterType(MeasurementType.LOT)).toBe(GeoPpfgFilterTypes.OTHER);
  });
});

describe('pushCurveToChart tests', () => {
  test('Should not push if x coordinate array is less than 2', () => {
    const charts: MeasurementChartData[] = [];
    pushCurveToChart(
      charts,
      MeasurementType.GEOMECHANNICS,
      {},
      false,
      'Curve Name',
      'Curve Description',
      [],
      []
    );
    expect(charts.length).toBe(0);
  });

  test('Should push to chart array if x coordinate array has at least 3 values', () => {
    const charts: MeasurementChartData[] = [];
    pushCurveToChart(
      charts,
      MeasurementType.GEOMECHANNICS,
      {},
      false,
      'Curve Name',
      'Curve Description',
      [5, 10, 15],
      []
    );
    expect(charts.length).toBe(1);
  });
});

describe('mapDepthMeasurementColumnToPlotly test', () => {
  test('Should create one chart ( Not bad values )', () => {
    const result = mapCurveToPlotly(
      getMockDepthMeasurementColumn(),
      [],
      'GEOMECHANICS',
      getMockMeasurement(),
      FEET,
      UserPreferredUnit.FEET,
      PressureUnit.PPG,
      MeasurementType.GEOMECHANNICS
    );
    expect(result.chartData.length).toBe(1);
  });
  test('Should not create graph if column is missing', () => {
    const result = mapCurveToPlotly(
      getMockDepthMeasurementColumn({
        externalId: 'TEST_ID',
      }),
      [],
      'GEOMECHANICS',
      getMockMeasurement(),
      FEET,
      UserPreferredUnit.FEET,
      PressureUnit.PPG,
      MeasurementType.GEOMECHANNICS
    );
    expect(result.chartData.length).toBe(0);
  });

  test('Should not create graph if wrong measurement type passed', () => {
    const result = mapCurveToPlotly(
      getMockDepthMeasurementColumn({
        externalId: 'TEST_ID',
      }),
      [],
      'GEOMECHANICS',
      getMockMeasurement(),
      FEET,
      UserPreferredUnit.FEET,
      PressureUnit.PPG,
      'wrong measurement type' as MeasurementType
    );
    expect(result.chartData.length).toBe(0);
  });

  test('Should create multiple graphs if there are breaking values Geomechanics', () => {
    const result = mapCurveToPlotly(
      getMockDepthMeasurementColumn(),
      [],
      'GEOMECHANICS',
      getMockMeasurement({
        rows: getDepthMeasurementRowsWithBreakingValues(),
      }),
      FEET,
      UserPreferredUnit.FEET,
      PressureUnit.PSI,
      MeasurementType.GEOMECHANNICS
    );
    // Should be three graphs ( 3 breaking points in data )
    expect(result.chartData.length).toBe(3);
    expect([0, -9999]).toEqual(
      expect.not.arrayContaining(result.chartData[0].x as number[])
    );
  });

  test('Should create multiple graphs if there are breaking values Ppfg', () => {
    const result = mapCurveToPlotly(
      getMockDepthMeasurementColumn(),
      [],
      'GEOMECHANICS',
      getMockMeasurement({
        rows: getDepthMeasurementRowsWithBreakingValues(),
      }),
      FEET,
      UserPreferredUnit.FEET,
      PressureUnit.PSI,
      MeasurementType.PPFG
    );
    // Should be three graphs ( 3 breaking points in data )
    expect(result.chartData.length).toBe(3);
    expect([0, -9999]).toEqual(
      expect.not.arrayContaining(result.chartData[0].x as number[])
    );
  });
});

describe('mapMeasurementToPlotly test', () => {
  test('Should return a chart (  ppfg )', () => {
    const result = mapMeasurementToPlotly(
      getMockDepthMeasurementDataColumns()[2],
      getMockMeasurement(),
      getMockGeomechanicsColumns(),
      getMockPpfgsColumns(),
      [],
      FEET,
      PressureUnit.PPG,
      UserPreferredUnit.FEET,
      []
    );
    expect(result.chartData.length).toBe(1);
  });

  test('Should return a chart ( geomechanics )', () => {
    const result = mapMeasurementToPlotly(
      getMockDepthMeasurementDataColumns()[3],
      getMockMeasurement(),
      getMockGeomechanicsColumns(),
      getMockPpfgsColumns(),
      [],
      FEET,
      PressureUnit.PPG,
      UserPreferredUnit.FEET,
      []
    );
    expect(result.chartData.length).toBe(1);
  });
});

describe('formatChartData test', () => {
  test('Should return a chart (  ppfg )', () => {
    const result = formatChartData(
      [getMockMeasurement()],
      getMockGeomechanicsColumns(),
      getMockPpfgsColumns(),
      [],
      PressureUnit.PPG,
      UserPreferredUnit.FEET
    );
    expect(result.chartData.length).toBe(2);
  });
});
