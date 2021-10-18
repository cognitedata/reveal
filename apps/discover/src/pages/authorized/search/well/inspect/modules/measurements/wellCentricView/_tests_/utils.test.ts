import { mockedMeasurementsResultFixture } from '__test-utils/fixtures/well';

import { convertOtherDataToPlotly } from '../utils';

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
        'ppg'
      )
    ).toEqual({
      customdata: ['FIT - test name test description'],
      marker: {
        color: '#595959',
        line: { width: 2 },
        size: 16,
        symbol: 'triangle-up-open',
      },
      mode: 'markers',
      name: 'FIT - test name test description',
      type: 'scatter',
      x: [10],
      y: [100],
    });
  });
});
