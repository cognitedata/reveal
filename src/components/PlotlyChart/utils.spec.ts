import { addMinutes } from 'date-fns';
import {
  getYaxisUpdatesFromEventData,
  getXaxisUpdateFromEventData,
  SeriesData,
  calculateMaxRange,
} from './utils';

const seriesData: SeriesData[] = [
  {
    unit: 'PSI',
    range: [1459.8294756630028, 1491.8053766553744],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        color: '#8E44AD',
        name: 'VAL_RESERVOIR_PT_well01',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:00:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:10:00.000Z') },
        ],
      },
    ],
  },
  {
    unit: 'PSI',
    range: [1456.247265175954, 1488.6541100613447],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        color: '#e1b12c',
        name: 'VAL_RESERVOIR_PT_well09',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:10:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:20:00.000Z') },
        ],
      },
    ],
  },
  {
    unit: 'PSI',
    range: [1523.9999095776425, 1523.9999896001514],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        name: 'VAL_RESERVOIR_PT_well07',
        color: '#0097e6',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:00:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:30:00.000Z') },
        ],
      },
    ],
  },
];

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

  it('handles valid input (2)', () => {
    const eventdata = {
      'yaxis.range[1]': 500,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1459.8294756630028, 500],
      },
    ]);
  });

  it('handles valid input (3)', () => {
    const eventdata = {
      'yaxis.range[0]': 500,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [500, 1491.8053766553744],
      },
    ]);
  });

  it('handles valid input (4)', () => {
    const eventdata = {
      'yaxis.range[0]': 0,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [0, 1491.8053766553744],
      },
    ]);
  });

  it('handles valid input (5)', () => {
    const eventdata = {
      'yaxis.range[1]': 0,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1459.8294756630028, 0],
      },
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

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
      addMinutes(
        new Date('2021-01-02T10:14:11.819Z'),
        new Date('2021-01-02T10:14:11.819Z').getTimezoneOffset()
      ).toJSON(),
      addMinutes(
        new Date('2021-02-14T09:17:59.198Z'),
        new Date('2021-02-14T09:17:59.198Z').getTimezoneOffset()
      ).toJSON(),
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

    const axisUpdates = getXaxisUpdateFromEventData(eventdata);

    expect(axisUpdates).toEqual([]);
  });
});

describe('calculateMaxRange', () => {
  it('should work for valid input', () => {
    const series = [
      {
        enabled: true,
        range: [0, 0.0032101851758732937],
        unit: '°C',
        series: [
          {
            type: 'timeseries',
            originalUnit: '',
            tsId: 4582687667743262,
            displayMode: 'lines',
            description: '-',
            unit: 'c',
            color: '#005d5d',
            lineWeight: 1,
            preferredUnit: 'c',
            name: 'VAL_21_PI_1017_04:Z.X.Value',
            createdAt: 1639571652630,
            range: [0, 0.0032101851758732937],
            lineStyle: 'solid',
            enabled: true,
            id: '455e160b-233a-43e2-9fb7-6179cae2830e',
            tsExternalId: 'VAL_21_PI_1017_04:Z.X.Value',
            width: 1,
            outdatedData: false,
            datapoints: [
              {
                timestamp: '2021-11-23T01:53:00.000Z',
                count: 6,
                sum: 0.016170318076615554,
                average: 0.0024455253893306754,
                min: 0.0024242157248303385,
                max: 0.0029570103896282155,
              },
            ],
            dash: 'solid',
            mode: 'lines',
          },
        ],
      },
      {
        enabled: true,
        range: [0, 0.0032101851758732937],
        unit: '°C',
        series: [
          {
            preferredUnit: 'c',
            color: '#9f1853',
            id: 'a66b0f37-e235-4f9a-b6a6-dea285fdc058',
            unit: 'c',
            displayMode: 'lines',
            enabled: true,
            tsId: 8070156109692675,
            name: 'VAL_21_PI_1032_04:Z.X.Value',
            originalUnit: '',
            type: 'timeseries',
            tsExternalId: 'VAL_21_PI_1032_04:Z.X.Value',
            lineWeight: 1,
            description: '-',
            createdAt: 1639571653988,
            range: [0, 0.0032101851758732937],
            lineStyle: 'solid',
            width: 1,
            outdatedData: false,
            datapoints: [
              {
                timestamp: '2021-11-23T01:53:00.000Z',
                count: 6,
                sum: 0.016346799645127898,
                average: 0.0029324450621639347,
                min: 0.002453353290949048,
                max: 0.0029866909628944935,
              },
            ],
            dash: 'solid',
            mode: 'lines',
          },
        ],
      },
      {
        enabled: true,
        range: [0, 0.0032101851758732937],
        unit: '°C',
        series: [
          {
            enabled: true,
            tsExternalId: 'VAL_21_PI_1069_04:Z.X.Value',
            lineStyle: 'solid',
            tsId: 8167271477847540,
            color: '#fa4d56',
            preferredUnit: 'c',
            lineWeight: 1,
            name: 'VAL_21_PI_1069_04:Z.X.Value',
            type: 'timeseries',
            unit: 'c',
            originalUnit: '',
            displayMode: 'lines',
            description: '-',
            createdAt: 1639571654886,
            id: '3f3db2ed-d795-4976-b6d1-effd415b5336',
            range: [0, 0.0032101851758732937],
            width: 1,
            outdatedData: false,
            datapoints: [
              {
                timestamp: '2021-11-23T01:53:00.000Z',
                count: 6,
                sum: 0.016718545636842694,
                average: 0.002706336103206125,
                min: 0.0026845359448666333,
                max: 0.0029769111467828012,
              },
            ],
            dash: 'solid',
            mode: 'lines',
          },
        ],
      },
    ] as SeriesData[];

    const calculatedMaxRange = calculateMaxRange(series);

    expect(calculatedMaxRange).toEqual([0, 0.0032101851758732937]);
  });
});
