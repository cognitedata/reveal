import { Aggregate, CogniteClient, DatapointAggregate } from '@cognite/sdk';
import { subDays } from 'date-fns';
import { Chart } from 'models/chart/types';
import { convertUnits } from 'utils/units';
import { roundToSignificantDigits } from './numbers';

const OUTLIER_THRESHOLD = 1000;

const filterOutliers = (someArray: number[], threshold = 1.5) => {
  if (someArray.length < 4) {
    return someArray;
  }
  const values = [...someArray].slice().sort((a, b) => a - b);
  let q1;
  let q3;
  if ((values.length / 4) % 1 === 0) {
    // find quartiles
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
    q3 =
      (1 / 2) *
      (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  const iqr = q3 - q1;
  const maxValue = q3 + iqr * threshold;
  const minValue = q1 - iqr * threshold;

  return values.filter((x) => x >= minValue && x <= maxValue);
};

export async function calculateDefaultYAxis({
  sdk,
  chart,
  timeSeriesExternalId,
  inputUnit,
  outputUnit,
}: {
  sdk: CogniteClient;
  chart: Chart;
  timeSeriesExternalId: string;
  inputUnit?: string;
  outputUnit?: string;
}) {
  const dateFrom = subDays(new Date(chart.dateTo), 365);
  const dateTo = new Date(chart.dateTo);

  const lastYearDatapointsQuery = {
    items: [{ externalId: timeSeriesExternalId }],
    start: dateFrom,
    end: dateTo,
    aggregates: ['average'] as Aggregate[],
    granularity: '1h',
    limit: 8760, // 365 days * 24 hours = 1 year in hours
  };

  const lastYearDatapoints = await sdk.datapoints
    .retrieve(lastYearDatapointsQuery)
    .then((r) => r[0]?.datapoints);

  const lastYearDatapointsSorted = convertUnits(
    lastYearDatapoints as DatapointAggregate[],
    inputUnit,
    outputUnit
  )
    .map((datapoint: DatapointAggregate) => datapoint.average)
    .filter((value: number | undefined) => value !== undefined)
    .sort() as number[];

  const filteredSortedDatapoints = filterOutliers(
    lastYearDatapointsSorted,
    OUTLIER_THRESHOLD
  );

  const min = filteredSortedDatapoints[0];
  const max = filteredSortedDatapoints[filteredSortedDatapoints.length - 1];

  const isValidRange =
    !Number.isNaN(min) &&
    !Number.isNaN(max) &&
    typeof min === 'number' &&
    typeof max === 'number';

  const range = isValidRange
    ? [roundToSignificantDigits(min, 3), roundToSignificantDigits(max, 3)]
    : [];

  return range as number[];
}
