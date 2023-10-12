import { InputTimeSeries } from '@cognite/simconfig-api-sdk/rtk';

import { getInputOutputIndex } from './utils';

describe('getTimeSeriesIndex', () => {
  it('returns correctly when entry exists', () => {
    const inputTimeSeries: InputTimeSeries[] = [
      {
        aggregateType: 'average',
        name: '',
        sampleExternalId: '',
        sensorExternalId: '',
        type: 'lorem',
        unitType: '',
      },
      {
        aggregateType: 'average',
        name: '',
        sampleExternalId: '',
        sensorExternalId: '',
        type: 'ipsum',
        unitType: '',
      },
    ];

    expect(getInputOutputIndex(inputTimeSeries, 'ipsum')).toEqual({
      index: 1,
      didFindEntry: true,
    });
  });

  it('returns correctly when entry does not exist', () => {
    const inputTimeSeries: InputTimeSeries[] = [
      {
        aggregateType: 'average',
        name: '',
        sampleExternalId: '',
        sensorExternalId: '',
        type: 'lorem',
        unitType: '',
      },
      {
        aggregateType: 'average',
        name: '',
        sampleExternalId: '',
        sensorExternalId: '',
        type: 'ipsum',
        unitType: '',
      },
    ];

    expect(getInputOutputIndex(inputTimeSeries, 'foo')).toEqual({
      index: 2,
      didFindEntry: false,
    });
  });
});
