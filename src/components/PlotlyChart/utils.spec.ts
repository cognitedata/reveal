import {
  getYaxisUpdatesFromEventData,
  getXaxisUpdateFromEventData,
} from './utils';

describe('getYaxisUpdatesFromEventData', () => {
  it('handles valid input', () => {
    const eventdata = {
      'xaxis.range[0]': '2021-01-02 10:14:11.8191',
      'xaxis.range[1]': '2021-02-14 09:17:59.1984',
      'yaxis.range[0]': 1465.6653548178783,
      'yaxis.range[1]': 1482.7808212612363,
      'yaxis2.range[0]': 1462.1617953274906,
      'yaxis2.range[1]': 1479.5079294146385,
      'yaxis3.range[0]': 1523.9999241824444,
      'yaxis3.range[1]': 1523.9999670154064,
    };

    const seriesData = [
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1459.8294756630028, 1491.8053766553744],
        name: 'VAL_RESERVOIR_PT_well01',
        color: '#8E44AD',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        range: [1456.247265175954, 1488.6541100613447],
        name: 'VAL_RESERVOIR_PT_well09',
        color: '#e1b12c',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        range: [1523.9999095776425, 1523.9999896001514],
        name: 'VAL_RESERVOIR_PT_well07',
        color: '#0097e6',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
    ];

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1465.6653548178783, 1482.7808212612363],
      },
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        range: [1462.1617953274906, 1479.5079294146385],
      },
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        range: [1523.9999241824444, 1523.9999670154064],
      },
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

    const seriesData = [
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1459.8294756630028, 1491.8053766553744],
        name: 'VAL_RESERVOIR_PT_well01',
        color: '#8E44AD',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        range: [1456.247265175954, 1488.6541100613447],
        name: 'VAL_RESERVOIR_PT_well09',
        color: '#e1b12c',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        range: [1523.9999095776425, 1523.9999896001514],
        name: 'VAL_RESERVOIR_PT_well07',
        color: '#0097e6',
        width: 2,
        dash: 'solid',
        unit: 'PSI',
        datapoints: [],
      },
    ];

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([]);
  });
});

describe('getXaxisUpdate', () => {
  it('handles valid input', () => {
    const eventdata = {
      'xaxis.range[0]': '2021-01-02 10:14:11.8191',
      'xaxis.range[1]': '2021-02-14 09:17:59.1984',
      'yaxis.range[0]': 1465.6653548178783,
      'yaxis.range[1]': 1482.7808212612363,
      'yaxis2.range[0]': 1462.1617953274906,
      'yaxis2.range[1]': 1479.5079294146385,
      'yaxis3.range[0]': 1523.9999241824444,
      'yaxis3.range[1]': 1523.9999670154064,
    };

    const axisUpdates = getXaxisUpdateFromEventData(eventdata);

    expect(axisUpdates).toEqual([
      '2021-01-02 10:14:11.8191',
      '2021-02-14 09:17:59.1984',
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

    const axisUpdates = getXaxisUpdateFromEventData(eventdata);

    expect(axisUpdates).toEqual([]);
  });
});
