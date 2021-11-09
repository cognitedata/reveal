import {
  mockedMeasurementsResultFixture,
  mockedWellboreResultFixture,
} from '__test-utils/fixtures/well';
import { MeasurementType } from 'modules/wellSearch/types';

import {
  convertOtherDataToPlotly,
  filterByChartType,
  filterByMainChartType,
  getSelectedWellboresTitle,
  getSelectedWellsTitle,
  mapToCurveCentric,
} from '../utils';

const tenantConfig = {
  fit: {
    enabled: true,
    fieldInfo: {
      pressure: 'metadata.pressure',
      tvd: 'metadata.tvd',
      tvdUnit: 'metadata.tvd_unit',
      pressureUnit: 'metadata.pressure_unit',
    },
  },
};

describe('Measurement filter utils', () => {
  test('Should return converted other', () => {
    expect(
      convertOtherDataToPlotly(
        {
          ...mockedMeasurementsResultFixture[0],
          name: 'test name',
          description: 'test description',
          metadata: {
            pressure: '10',
            tvd: '100',
            tvdUnit: 'ft',
            pressureUnit: 'ppg',
          },
        },
        'fit',
        tenantConfig,
        'ppg',
        'ft'
      )
    ).toEqual({
      customdata: ['FIT - test name test description'],
      marker: {
        color: '#595959',
        line: { width: 2 },
        size: 2,
        symbol: 'triangle-up-open',
      },
      mode: 'markers',
      name: 'FIT - test name test description',
      type: 'scatter',
      x: [10],
      y: [100],
    });
  });

  test('Should map chart data to curve centric data', () => {
    const wellbore = {
      ...mockedWellboreResultFixture[0],
      metadata: {
        wellName: 'Test Well Name',
        color: '#FFFFFF',
      },
    };
    const chart = {
      measurementType: MeasurementType.ppfg,
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
        measurementType: MeasurementType.ppfg,
      },
      {
        measurementType: MeasurementType.geomechanic,
      },
    ];
    expect(filterByChartType(charts, [MeasurementType.ppfg])).toEqual([
      charts[0],
    ]);
  });

  test('Should return main chart data', () => {
    const charts = [
      {
        measurementType: MeasurementType.ppfg,
      },
      {
        measurementType: MeasurementType.fit,
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
