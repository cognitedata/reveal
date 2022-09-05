import { CogniteClient, DatapointAggregates } from '@cognite/sdk';
import { Chart } from 'models/chart/types';
import { useCallback, useState } from 'react';
import { datapointsToCSV, Delimiters } from 'utils/csv';
import isTruthy from 'utils/isTruthy';
import JSZip from 'jszip';
import { wait } from 'utils/helpers';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';
import {
  fetchCalculationDataPoints,
  fetchRawCalculationDatapoints,
  fetchRawTsDatapoints,
  fetchTsDataPoints,
} from './utils';

export const useExportToCSV = ({
  timeseriesCollection = [],
  workflowCollection = [],
  granularity = '1d',
  name,
  dateFrom,
  dateTo,
  delimiter = ';' as Delimiters,
  enableHumanReadableDates,
  enableRawExport,
  sdk,
}: {
  timeseriesCollection: Chart['timeSeriesCollection'];
  workflowCollection: Chart['workflowCollection'];
  granularity?: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  delimiter?: Delimiters;
  enableHumanReadableDates: boolean;
  enableRawExport: boolean;
  sdk: CogniteClient;
}) => {
  const [error, setError] = useState<Error>();
  const [isExporting, setIsExporting] = useState(false);
  const [isDoneExporting, setIsDoneExporting] = useState(false);

  const onExport = useCallback(() => {
    (async function exportToCsv() {
      setError(undefined);
      setIsExporting(true);
      setIsDoneExporting(false);

      try {
        /**
         * Get all timeseries to download (by externalId)
         */
        const tsExternalIds = timeseriesCollection
          .filter((ts) => ts.enabled)
          .map((ts) => ts.tsExternalId)
          .filter((x) => x) as string[];

        /**
         * Get all calculations to download (by callId)
         */
        const wfCallIds = workflowCollection
          .filter((wf) => wf.enabled)
          .map((wf) => wf.calls?.[0]?.callId)
          .filter((x) => x) as string[];

        const aggregate = 'average';
        const humanReadableDateFormat = 'yyyy-MM-dd HH:mm:ss';
        const bundleName = `${name} ${formatDate(
          new Date(),
          humanReadableDateFormat
        )}`;

        /**
         * Fetch all datapoints for all the visible calculations
         */
        let calculationsData: DatapointAggregates[] = [];
        let calculationsError: Error | null = null;

        try {
          calculationsData = enableRawExport
            ? await fetchRawCalculationDatapoints(
                sdk,
                {
                  start: new Date(dateFrom || new Date()).getTime(),
                  end: new Date(dateTo || new Date()).getTime(),
                  items: wfCallIds.map((externalId) => ({ externalId })),
                  granularity,
                  aggregates: [aggregate],
                },
                workflowCollection
              )
            : await fetchCalculationDataPoints(sdk, {
                start: new Date(dateFrom || new Date()).getTime(),
                end: new Date(dateTo || new Date()).getTime(),
                items: wfCallIds.map((externalId) => ({ externalId })),
                granularity,
                aggregates: [aggregate],
              });
        } catch (ignoredErr) {
          calculationsError = ignoredErr as Error;
        }

        /**
         * Fetch all datapoints for all the visible time series
         */
        let tsData: DatapointAggregates[] = [];
        let tsError: Error | null = null;

        try {
          tsData = enableRawExport
            ? await fetchRawTsDatapoints(
                sdk,
                {
                  start: new Date(dateFrom || new Date()).getTime(),
                  end: new Date(dateTo || new Date()).getTime(),
                  items: tsExternalIds.map((externalId) => ({ externalId })),
                  granularity,
                  aggregates: [aggregate],
                },
                timeseriesCollection
              )
            : await fetchTsDataPoints(sdk, {
                start: new Date(dateFrom || new Date()).getTime(),
                end: new Date(dateTo || new Date()).getTime(),
                items: tsExternalIds.map((externalId) => ({ externalId })),
                granularity,
                aggregates: [aggregate],
              });
        } catch (ignoredErr) {
          tsError = ignoredErr as Error;
        }

        /**
         * Create combined collection of both timeseries and calculation results
         */
        const sourceData = [...tsData, ...calculationsData];

        /**
         * Split into separate files based on if raw or aggregated
         */
        const downloadChunks: {
          filename: string;
          output: DatapointAggregates[];
        }[] = enableRawExport
          ? sourceData.map((item) => ({
              filename:
                timeseriesCollection?.find(
                  (ts) => item.externalId === ts.tsExternalId
                )?.name ||
                workflowCollection?.find(
                  (wf) => item.externalId === wf.calls?.[0].callId
                )?.name ||
                item.externalId ||
                String(item.id),
              output: [item],
            }))
          : [
              !!tsData.length && {
                filename: `${bundleName} (timeseries)`,
                output: tsData,
              },
              !!calculationsData.length && {
                filename: `${bundleName} (calculations)`,
                output: calculationsData,
              },
            ].filter(isTruthy);

        /**
         * Handle .zip bundle download
         */
        const zipBundle = new JSZip();

        for (const chunk of downloadChunks) {
          /**
           * Convert to CSV
           */
          const csv = datapointsToCSV({
            data: chunk.output,
            aggregate,
            delimiter,
            format: enableHumanReadableDates
              ? humanReadableDateFormat
              : undefined,
            formatLabel: (externalId) =>
              timeseriesCollection?.find((ts) => externalId === ts.tsExternalId)
                ?.name ||
              workflowCollection?.find(
                (wf) => externalId === wf.calls?.[0].callId
              )?.name ||
              externalId,
            granularity,
            isRaw: enableRawExport,
          });

          /**
           * Add to .zip bundle
           */
          zipBundle.file(`${chunk.filename}.csv`, csv);
        }

        /**
         * Perform download
         */
        const fileContent = await zipBundle.generateAsync({ type: 'blob' });
        saveAs(fileContent as Blob, bundleName);

        /**
         * Handle any blocking errors
         */
        if (!downloadChunks.length) {
          if (tsError) {
            throw tsError;
          }
          if (calculationsError) {
            throw calculationsError;
          }
        }

        /**
         * Success indicator
         */
        setIsExporting(false);
        setIsDoneExporting(true);
        await wait(2000);
        setIsDoneExporting(false);
      } catch (err) {
        setError(err as Error);
        setIsExporting(false);
      }
    })();
  }, [
    sdk,
    dateFrom,
    dateTo,
    name,
    timeseriesCollection,
    workflowCollection,
    delimiter,
    granularity,
    enableHumanReadableDates,
    enableRawExport,
  ]);

  return {
    onExport,
    error,
    isExporting,
    isDoneExporting,
  };
};
