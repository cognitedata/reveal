import { addMinutes } from 'date-fns';
import {
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/charts/charts/types/types';
import {
  getYaxisUpdatesFromEventData,
  getXaxisUpdateFromEventData,
  calculateMaxRange,
  calculateSeriesData,
  formatPlotlyData,
  generateLayout,
  cleanTimeseriesCollection,
  cleanWorkflowCollection,
} from './utils';
import {
  calculateSeriesDataCase1,
  calculateSeriesDataCase2,
  calculateSeriesDataCase3,
  formatSeriesDataCase1,
  formatSeriesDataCase2,
  seriesDataExample1,
  seriesDataExample2,
} from './utils.mocks';

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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

    const axisUpdates = getYaxisUpdatesFromEventData(
      seriesDataExample1,
      eventdata
    );

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
    const calculatedMaxRange = calculateMaxRange(seriesDataExample2);
    expect(calculatedMaxRange).toEqual([0, 0.0032101851758732937]);
  });
});

describe('calculateSeriesData', () => {
  it('should generate correct result for timeseries, calculations and thresholds, as inputs and no axis merging', () => {
    const result = calculateSeriesData(calculateSeriesDataCase1.input);
    expect(result).toEqual(calculateSeriesDataCase1.result);
  });

  it('should generate correct result for timeseries and calculations as inputs with axis merging (all in one)', () => {
    const result = calculateSeriesData(calculateSeriesDataCase2.input);
    expect(result).toEqual(calculateSeriesDataCase2.result);
  });

  it('should generate correct result for timeseries and calculations as inputs with axis merging (multiple)', () => {
    const result = calculateSeriesData(calculateSeriesDataCase3.input);
    expect(result).toEqual(calculateSeriesDataCase3.result);
  });
});

describe('formatPlotlyData', () => {
  it('should generate correct result for timeseries and calculations as inputs using raw data (show min/max)', () => {
    const result = formatPlotlyData(
      formatSeriesDataCase1.input.seriesData,
      false
    );

    expect(result).toEqual(formatSeriesDataCase1.output);
  });

  it('should generate correct result for timeseries and calculations as inputs using aggregated data (show min/max)', () => {
    const result = formatPlotlyData(
      formatSeriesDataCase2.input.seriesData,
      false
    );

    expect(result).toEqual(formatSeriesDataCase2.output);
  });
});

describe('generateLayout', () => {
  it('should generate correct layout for given settings (case 1)', () => {
    const result = generateLayout({
      isPreview: false,
      isGridlinesShown: false,
      yAxisLocked: false,
      showYAxis: false,
      stackedMode: false,
      seriesData: seriesDataExample1,
      yAxisValues: { width: 0.05, margin: 0.01 },
      dateFrom: new Date('2021-01-01T00:00:00.000'),
      dateTo: new Date('2021-01-01T00:10:00.000'),
      dragmode: 'zoom',
    });

    expect(result).toEqual({
      margin: {
        l: 20,
        r: 20,
        b: 30,
        t: 30,
      },
      xaxis: {
        type: 'date',
        autorange: false,
        domain: [0, 1],
        range: ['2021-01-01 00:00:00.000', '2021-01-01 00:10:00.000'],
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#bfbfbf',
        spikedash: 'solid',
        showgrid: false,
      },
      spikedistance: -1,
      hovermode: 'x',
      showlegend: false,
      dragmode: 'zoom',
      annotations: [],
      shapes: [],
      yaxis: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#8E44AD',
        linewidth: 1,
        tickcolor: '#8E44AD',
        tickwidth: 1,
        side: 'left',
        anchor: 'free',
        position: 0.019,
        range: [1459.8294756630028, 1491.8053766553744],
        showgrid: false,
      },
      yaxis2: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#e1b12c',
        linewidth: 1,
        tickcolor: '#e1b12c',
        tickwidth: 1,
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.069,
        range: [1456.247265175954, 1488.6541100613447],
        showgrid: false,
      },
      yaxis3: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#0097e6',
        linewidth: 1,
        tickcolor: '#0097e6',
        tickwidth: 1,
        tickvals: [
          1523.9999095776425, 1523.9999255821442, 1523.999941586646,
          1523.999957591148, 1523.9999735956496, 1523.9999896001514,
        ],
        ticktext: [1520, 1520, 1520, 1520, 1520, 1520],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.11900000000000001,
        range: [1523.9999095776425, 1523.9999896001514],
        showgrid: false,
      },
    });
  });

  it('should generate correct layout for given settings (case 2)', () => {
    const result = generateLayout({
      isPreview: false,
      isGridlinesShown: true,
      yAxisLocked: false,
      showYAxis: false,
      stackedMode: false,
      seriesData: seriesDataExample1,
      yAxisValues: { width: 0.05, margin: 0.01 },
      dateFrom: new Date('2021-01-01T00:00:00.000'),
      dateTo: new Date('2021-01-01T00:10:00.000'),
      dragmode: 'zoom',
    });

    expect(result).toEqual({
      margin: {
        l: 20,
        r: 20,
        b: 30,
        t: 30,
      },
      xaxis: {
        type: 'date',
        autorange: false,
        domain: [0, 1],
        range: ['2021-01-01 00:00:00.000', '2021-01-01 00:10:00.000'],
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#bfbfbf',
        spikedash: 'solid',
        showgrid: true,
      },
      spikedistance: -1,
      hovermode: 'x',
      showlegend: false,
      dragmode: 'zoom',
      annotations: [],
      shapes: [],
      yaxis: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#8E44AD',
        linewidth: 1,
        tickcolor: '#8E44AD',
        tickwidth: 1,
        side: 'left',
        anchor: 'free',
        position: 0.019,
        range: [1459.8294756630028, 1491.8053766553744],
        showgrid: true,
      },
      yaxis2: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#e1b12c',
        linewidth: 1,
        tickcolor: '#e1b12c',
        tickwidth: 1,
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.069,
        range: [1456.247265175954, 1488.6541100613447],
        showgrid: true,
      },
      yaxis3: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: false,
        linecolor: '#0097e6',
        linewidth: 1,
        tickcolor: '#0097e6',
        tickwidth: 1,
        tickvals: [
          1523.9999095776425, 1523.9999255821442, 1523.999941586646,
          1523.999957591148, 1523.9999735956496, 1523.9999896001514,
        ],
        ticktext: [1520, 1520, 1520, 1520, 1520, 1520],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.11900000000000001,
        range: [1523.9999095776425, 1523.9999896001514],
        showgrid: true,
      },
    });
  });

  it('should generate correct layout for given settings (case 3)', () => {
    const result = generateLayout({
      isPreview: false,
      isGridlinesShown: true,
      yAxisLocked: false,
      showYAxis: true,
      stackedMode: false,
      seriesData: seriesDataExample1,
      yAxisValues: { width: 0.05, margin: 0.01 },
      dateFrom: new Date('2021-01-01T00:00:00.000'),
      dateTo: new Date('2021-01-01T00:10:00.000'),
      dragmode: 'zoom',
    });

    expect(result).toEqual({
      margin: {
        l: 20,
        r: 20,
        b: 30,
        t: 30,
      },
      xaxis: {
        type: 'date',
        autorange: false,
        domain: [0.11, 1],
        range: ['2021-01-01 00:00:00.000', '2021-01-01 00:10:00.000'],
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#bfbfbf',
        spikedash: 'solid',
        showgrid: true,
      },
      spikedistance: -1,
      hovermode: 'x',
      showlegend: false,
      dragmode: 'zoom',
      annotations: [
        {
          xref: 'paper',
          yref: 'paper',
          x: 0,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.05,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.1,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
      ],
      shapes: [
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 1,
          x1: 0.019,
          y1: 1,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 0,
          x1: 0.019,
          y1: 0,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 1,
          x1: 0.069,
          y1: 1,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 0,
          x1: 0.069,
          y1: 0,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 1,
          x1: 0.11900000000000001,
          y1: 1,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 0,
          x1: 0.11900000000000001,
          y1: 0,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
      ],
      yaxis: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#8E44AD',
        linewidth: 1,
        tickcolor: '#8E44AD',
        tickwidth: 1,
        side: 'left',
        anchor: 'free',
        position: 0.019,
        range: [1459.8294756630028, 1491.8053766553744],
        showgrid: true,
      },
      yaxis2: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#e1b12c',
        linewidth: 1,
        tickcolor: '#e1b12c',
        tickwidth: 1,
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.069,
        range: [1456.247265175954, 1488.6541100613447],
        showgrid: true,
      },
      yaxis3: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#0097e6',
        linewidth: 1,
        tickcolor: '#0097e6',
        tickwidth: 1,
        tickvals: [
          1523.9999095776425, 1523.9999255821442, 1523.999941586646,
          1523.999957591148, 1523.9999735956496, 1523.9999896001514,
        ],
        ticktext: [1520, 1520, 1520, 1520, 1520, 1520],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.11900000000000001,
        range: [1523.9999095776425, 1523.9999896001514],
        showgrid: true,
      },
    });
  });

  it('should generate correct layout for given settings (case 4)', () => {
    const result = generateLayout({
      isPreview: false,
      isGridlinesShown: true,
      yAxisLocked: true,
      showYAxis: true,
      stackedMode: false,
      seriesData: seriesDataExample1,
      yAxisValues: { width: 0.05, margin: 0.01 },
      dateFrom: new Date('2021-01-01T00:00:00.000'),
      dateTo: new Date('2021-01-01T00:10:00.000'),
      dragmode: 'zoom',
    });

    expect(result).toEqual({
      margin: {
        l: 20,
        r: 20,
        b: 30,
        t: 30,
      },
      xaxis: {
        type: 'date',
        autorange: false,
        domain: [0.11, 1],
        range: ['2021-01-01 00:00:00.000', '2021-01-01 00:10:00.000'],
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#bfbfbf',
        spikedash: 'solid',
        showgrid: true,
      },
      spikedistance: -1,
      hovermode: 'x',
      showlegend: false,
      dragmode: 'zoom',
      annotations: [
        {
          xref: 'paper',
          yref: 'paper',
          x: 0,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.05,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.1,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
      ],
      shapes: [
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 1,
          x1: 0.019,
          y1: 1,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 0,
          x1: 0.019,
          y1: 0,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 1,
          x1: 0.069,
          y1: 1,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 0,
          x1: 0.069,
          y1: 0,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 1,
          x1: 0.11900000000000001,
          y1: 1,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 0,
          x1: 0.11900000000000001,
          y1: 0,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
      ],
      yaxis: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: true,
        visible: true,
        linecolor: '#8E44AD',
        linewidth: 1,
        tickcolor: '#8E44AD',
        tickwidth: 1,
        side: 'left',
        anchor: 'free',
        position: 0.019,
        range: [1459.8294756630028, 1491.8053766553744],
        showgrid: true,
      },
      yaxis2: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: true,
        visible: true,
        linecolor: '#e1b12c',
        linewidth: 1,
        tickcolor: '#e1b12c',
        tickwidth: 1,
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.069,
        range: [1456.247265175954, 1488.6541100613447],
        showgrid: true,
      },
      yaxis3: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: true,
        visible: true,
        linecolor: '#0097e6',
        linewidth: 1,
        tickcolor: '#0097e6',
        tickwidth: 1,
        tickvals: [
          1523.9999095776425, 1523.9999255821442, 1523.999941586646,
          1523.999957591148, 1523.9999735956496, 1523.9999896001514,
        ],
        ticktext: [1520, 1520, 1520, 1520, 1520, 1520],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.11900000000000001,
        range: [1523.9999095776425, 1523.9999896001514],
        showgrid: true,
      },
    });
  });

  it('should generate correct layout for given settings (case 5)', () => {
    const result = generateLayout({
      isPreview: false,
      isGridlinesShown: true,
      yAxisLocked: false,
      showYAxis: true,
      stackedMode: true,
      seriesData: seriesDataExample1,
      yAxisValues: { width: 0.05, margin: 0.01 },
      dateFrom: new Date('2021-01-01T00:00:00.000'),
      dateTo: new Date('2021-01-01T00:10:00.000'),
      dragmode: 'zoom',
    });

    expect(result).toEqual({
      margin: {
        l: 20,
        r: 20,
        b: 30,
        t: 30,
      },
      xaxis: {
        type: 'date',
        autorange: false,
        domain: [0.11, 1],
        range: ['2021-01-01 00:00:00.000', '2021-01-01 00:10:00.000'],
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#bfbfbf',
        spikedash: 'solid',
        showgrid: true,
      },
      spikedistance: -1,
      hovermode: 'x',
      showlegend: false,
      dragmode: 'zoom',
      annotations: [
        {
          xref: 'paper',
          yref: 'paper',
          x: 0,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.05,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
        {
          xref: 'paper',
          yref: 'paper',
          x: 0.1,
          xanchor: 'left',
          y: 1,
          yanchor: 'bottom',
          text: 'PSI',
          showarrow: false,
          xshift: 15,
          yshift: 7,
        },
      ],
      shapes: [
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 1,
          x1: 0.019,
          y1: 1,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.015,
          y0: 0,
          x1: 0.019,
          y1: 0,
          line: {
            color: '#8E44AD',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 1,
          x1: 0.069,
          y1: 1,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.065,
          y0: 0,
          x1: 0.069,
          y1: 0,
          line: {
            color: '#e1b12c',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 1,
          x1: 0.11900000000000001,
          y1: 1,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
        {
          type: 'line',
          xref: 'paper',
          yref: 'paper',
          x0: 0.115,
          y0: 0,
          x1: 0.11900000000000001,
          y1: 0,
          line: {
            color: '#0097e6',
            width: 1,
          },
        },
      ],
      yaxis: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#8E44AD',
        linewidth: 1,
        tickcolor: '#8E44AD',
        tickwidth: 1,
        tickvals: [1, 1, 1, 1, 1, 1],
        ticktext: [1, 1, 1, 1, 1, 1],
        side: 'left',
        anchor: 'free',
        position: 0.019,
        range: [1, 1],
        showgrid: true,
      },
      yaxis2: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#e1b12c',
        linewidth: 1,
        tickcolor: '#e1b12c',
        tickwidth: 1,
        tickvals: [1, 1, 1, 1, 1, 1],
        ticktext: [1, 1, 1, 1, 1, 1],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.069,
        range: [1, 1],
        showgrid: true,
      },
      yaxis3: {
        hoverformat: '.3g',
        zeroline: false,
        type: 'linear',
        fixedrange: false,
        visible: true,
        linecolor: '#0097e6',
        linewidth: 1,
        tickcolor: '#0097e6',
        tickwidth: 1,
        tickvals: [1, 1, 1, 1, 1, 1],
        ticktext: [1, 1, 1, 1, 1, 1],
        side: 'left',
        overlaying: 'y',
        anchor: 'free',
        position: 0.11900000000000001,
        range: [1, 1],
        showgrid: true,
      },
    });
  });
});

describe('cleanTimeseriesCollection', () => {
  it('should remove callIds', () => {
    const tsCollection: ChartTimeSeries[] = [
      {
        id: 'abc-123',
        name: 'Timeseries 1',
        color: '#FFF',
        tsId: 123,
        enabled: true,
        createdAt: 0,
        statisticsCalls: [{ callId: '1', callDate: 0 }],
      },
    ];

    const cleanCollection = cleanTimeseriesCollection(tsCollection);

    expect(cleanCollection).toEqual([
      {
        id: 'abc-123',
        name: 'Timeseries 1',
        color: '#FFF',
        tsId: 123,
        enabled: true,
        createdAt: 0,
      },
    ]);
  });
});

describe('cleanWorkflowCollection', () => {
  it('should remove callIds', () => {
    const wfCollection: ChartWorkflow[] = [
      {
        version: 'v2',
        id: 'abc-123',
        name: 'Timeseries 1',
        color: '#FFF',
        enabled: true,
        createdAt: 0,
        flow: {
          elements: [],
          position: [0, 0],
          zoom: 1,
        },
        statisticsCalls: [{ callId: '1', callDate: 0 }],
        calls: [{ id: '2', callId: '2', callDate: 1, status: 'Success' }],
        settings: { autoAlign: true },
      },
    ];

    const cleanCollection = cleanWorkflowCollection(wfCollection);

    expect(cleanCollection).toEqual([
      {
        version: 'v2',
        id: 'abc-123',
        name: 'Timeseries 1',
        color: '#FFF',
        enabled: true,
        createdAt: 0,
        flow: {
          elements: [],
          position: [0, 0],
          zoom: 1,
        },
        settings: { autoAlign: true },
      },
    ]);
  });
});
