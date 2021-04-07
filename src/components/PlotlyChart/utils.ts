import { DatapointAggregate, Datapoints, DoubleDatapoint } from '@cognite/sdk';

export function convertLineStyle(lineStyle?: 'solid' | 'dashed' | 'dotted') {
  switch (lineStyle) {
    case 'solid':
      return 'solid';
    case 'dashed':
      return 'dash';
    case 'dotted':
      return 'dot';
    default:
      return 'solid';
  }
}

export type PlotlyEventData = {
  [key: string]: any;
};

export type SeriesData = {
  id: string | undefined;
  type: string;
  range: number[] | undefined;
  name: string | undefined;
  color: string | undefined;
  width: number | undefined;
  dash: string;
  mode: string | undefined;
  unit: string | undefined;
  datapoints: Datapoints | DatapointAggregate[];
};

export type AxisUpdate = {
  id: string;
  type: string;
  range: any[];
};

export function getYaxisUpdatesFromEventData(
  seriesData: SeriesData[],
  eventdata: PlotlyEventData
) {
  const axisUpdates: AxisUpdate[] = Object.values(
    Object.keys(eventdata)
      .filter((key) => key.includes('yaxis'))
      .reduce((result: { [key: string]: any }, key) => {
        const axisIndex = (+key.split('.')[0].split('yaxis')[1] || 1) - 1;
        const { id = '', type = '' } = seriesData[axisIndex] || {};

        return {
          ...result,
          [id]: {
            ...(result[id] || {}),
            id,
            type,
            range: ((result[id] || {}).range || []).concat(eventdata[key]),
          },
        };
      }, {})
  );

  return axisUpdates;
}

export function getXaxisUpdateFromEventData(
  eventdata: PlotlyEventData
): number[] {
  return Object.keys(eventdata)
    .filter((key) => key.includes('xaxis'))
    .map((key) => eventdata[key]);
}

export function calculateStackedYRange(
  datapoints: (Datapoints | DatapointAggregate)[],
  index: number,
  numSeries: number
): number[] {
  const data = datapoints.map((datapoint) =>
    'average' in datapoint
      ? datapoint.average
      : (datapoint as DoubleDatapoint).value
  );

  const min = Math.min(...(data as number[]));
  const max = Math.max(...(data as number[]));
  const range = max - min;

  const lower = min - index * range;
  const upper = lower + numSeries * range;

  return [lower, upper];
}
