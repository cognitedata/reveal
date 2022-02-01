import { Aggregate, DatapointAggregates } from '@cognite/sdk';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';
import { getGranularityInMS } from './timeseries';

export interface DatapointsToCSVProps {
  data: DatapointAggregates[];
  granularity: string;
  aggregate?: Aggregate;
  delimiter?: Delimiters;
  format?: string;
  formatLabel?: (externalId: string) => string;
  isRaw?: boolean;
}

export enum Delimiters {
  Comma = ',',
  Tab = '\t',
  Semicolon = ';',
}

export function datapointsToCSV({
  data,
  granularity,
  aggregate = 'average',
  delimiter = Delimiters.Comma,
  format,
  formatLabel = (str) => str,
  isRaw = false,
}: DatapointsToCSVProps): string {
  const labels = data.map(({ id, externalId }) => {
    const idString = externalId || id.toString();
    return formatLabel(idString);
  });

  const arrangedData = isRaw
    ? arrangeRawData(data)
    : arrangeDatapointsByTimestamp({
        data,
        aggregate,
        granularity,
      });

  const csvStrings = generateCSVStringsArray(arrangedData, delimiter, format);

  return [['timestamp', ...labels].join(delimiter), ...csvStrings].join('\r\n');
}

function arrangeRawData(data: DatapointAggregates[]): (number | string)[][] {
  return data[0].datapoints.map(({ timestamp, average }) => [
    new Date(timestamp).getTime(),
    average!,
  ]);
}

export function downloadCSV(src: string, filename: string = 'data.csv') {
  const blob = new Blob([src], { type: 'text/csv;charset=utf-8;' });

  saveAs(blob, filename);
}

function getStartEndAndIterationsTotal(
  data: DatapointAggregates[]
): [number, number, number] {
  let startTimestamp = Infinity;
  let endTimestamp = 0;
  const iterationsTotal = data.reduce((acc, { datapoints }) => {
    if (datapoints.length) {
      const start = datapoints[0].timestamp.getTime();
      const end = datapoints[datapoints.length - 1].timestamp.getTime();

      if (startTimestamp > start) {
        startTimestamp = start;
      }
      if (endTimestamp < end) {
        endTimestamp = end;
      }
    }

    return datapoints.length + acc;
  }, 0);

  return [startTimestamp, endTimestamp, iterationsTotal];
}

export function arrangeDatapointsByTimestamp({
  data,
  aggregate,
  granularity: granularityString,
}: Omit<DatapointsToCSVProps, 'delimiter' | 'timeseries'>): (
  | number
  | string
)[][] {
  if (!granularityString) {
    return [];
  }

  const arrangedData = [];
  const granularity = getGranularityInMS(granularityString);

  const pointers = Array(data.length).fill(0);
  const [startTimestamp, endTimestamp, iterationsTotal] =
    getStartEndAndIterationsTotal(data);

  let iterationLeft = iterationsTotal;
  let currentTimestamp = startTimestamp;

  while (iterationLeft > 0 && currentTimestamp <= endTimestamp) {
    const values: string[] = [];

    // eslint-disable-next-line no-loop-func
    data.forEach(({ datapoints }, index) => {
      const dpPointer = pointers[index];
      const datapoint = datapoints[dpPointer];

      if (datapoint) {
        const timestamp = datapoints[dpPointer].timestamp.getTime();

        if (timestamp === currentTimestamp) {
          const value = datapoints[dpPointer][aggregate!];
          values[index] = value!.toString();

          // eslint-disable-next-line no-plusplus
          pointers[index]++;
          // eslint-disable-next-line no-plusplus
          iterationLeft--;
        }
      }
    });

    if (values.length) {
      arrangedData.push([currentTimestamp, ...values]);
    }

    currentTimestamp += granularity;
  }

  return arrangedData;
}

function generateCSVStringsArray(
  arrangedData: (string | number)[][],
  delimiter: Delimiters,
  format?: string
): string[] {
  return arrangedData.map((timestampRow) => {
    const timestamp = timestampRow.shift();
    const pointer = format
      ? formatDate(new Date(timestamp || new Date()), format)
      : timestamp;

    return [pointer!.toString(), ...timestampRow].join(delimiter);
  });
}
