import {
  Button,
  Checkbox,
  Icon,
  Input,
  Modal,
  SegmentedControl,
  Tooltip,
} from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import DateRangeSelector from 'components/DateRangeSelector';
import chartAtom from 'models/chart/atom';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components/macro';
import { datapointsToCSV, Delimiters, downloadCSV } from 'utils/csv';
import { wait } from 'utils/helpers';
import { format as formatDate } from 'date-fns';
import { DatapointAggregates } from '@cognite/sdk';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { fetchDataPoints, fetchRawDatapoints } from './utils';

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

const delimiterOptions: { id: string; value: Delimiters; label: string }[] = [
  { id: '1', value: Delimiters.Semicolon, label: ';' },
  { id: '2', value: Delimiters.Comma, label: ',' },
  { id: '3', value: Delimiters.Tab, label: 'tab' },
];

const CSVModal = ({ isOpen = false, onClose = () => {} }: Props) => {
  const [chart] = useRecoilState(chartAtom);
  const [isModalVisible, setIsModalVisible] = useState(isOpen);
  const [selectedDelimiterId, setSelectedDelimiterId] = useState(
    delimiterOptions[0].id
  );
  const [selectedGranularity, setSelectedGranularity] = useState('1d');
  const [isHumanReadableDates, setIsHumanReadableDates] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDoneExporting, setIsDoneExporting] = useState(false);
  const [isRawDownload, setIsRawDownload] = useState(false);
  const [error, setError] = useState<Error>();
  const sdk = useSDK();

  const selectedDelimiter = delimiterOptions.find(
    ({ id }) => id === selectedDelimiterId
  )?.value;

  useEffect(() => {
    setIsModalVisible(isOpen);
  }, [isOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    onClose();
  }, [onClose]);

  const handleExport = useCallback(() => {
    (async function exportToCsv() {
      setError(undefined);
      setIsExporting(true);
      setIsDoneExporting(false);

      try {
        const sourceCollection = chart?.sourceCollection || [];
        const timeseriesCollection = chart?.timeSeriesCollection || [];

        /**
         * Get all timeseries to download
         */
        const externalIds = sourceCollection
          .filter(({ type }) => type === 'timeseries')
          .map(({ id }) => timeseriesCollection.find((ts) => id === ts.id)!)
          .filter((ts) => ts.enabled)
          .map((ts) => ts.tsExternalId)
          .filter((x) => x) as string[];

        const aggregate = 'average';
        const granularity = selectedGranularity || '1d';
        const humanReadableDateFormat = 'yyyy-MM-dd HH:mm:ss';
        const bundleName = `${chart?.name} ${formatDate(
          new Date(),
          humanReadableDateFormat
        )}`;

        /**
         * Fetch all datapoints for all the visible time series
         */
        const data = isRawDownload
          ? await fetchRawDatapoints(
              sdk,
              {
                start: new Date(chart?.dateFrom || new Date()).getTime(),
                end: new Date(chart?.dateTo || new Date()).getTime(),
                items: externalIds.map((externalId) => ({ externalId })),
                granularity,
                aggregates: [aggregate],
              },
              chart?.timeSeriesCollection
            )
          : await fetchDataPoints(sdk, {
              start: new Date(chart?.dateFrom || new Date()).getTime(),
              end: new Date(chart?.dateTo || new Date()).getTime(),
              items: externalIds.map((externalId) => ({ externalId })),
              granularity,
              aggregates: [aggregate],
            });

        /**
         * Split into separate downloads if downloading raw data
         */
        const downloadChunks: {
          filename: string;
          output: DatapointAggregates[];
        }[] = isRawDownload
          ? data.map((item) => ({
              filename:
                chart?.timeSeriesCollection?.find(
                  (ts) => item.externalId === ts.tsExternalId
                )?.name ||
                item.externalId ||
                String(item.id),
              output: [item],
            }))
          : [
              {
                filename: bundleName,
                output: data,
              },
            ];

        /**
         * Handle download of single CSV (aggregates)
         */
        if (!isRawDownload) {
          /**
           * Convert to CSV
           */
          const csv = datapointsToCSV({
            data: downloadChunks[0].output,
            aggregate,
            delimiter: selectedDelimiter,
            format: isHumanReadableDates ? humanReadableDateFormat : undefined,
            formatLabel: (externalId) =>
              chart?.timeSeriesCollection?.find(
                (ts) => externalId === ts.tsExternalId
              )?.name || externalId,
            granularity,
            isRaw: isRawDownload,
          });

          /**
           * Perform download
           */
          downloadCSV(csv, downloadChunks[0].filename);
        } else {
          /**
           * Handle .zip bundle download for raw data
           */
          const zipBundle = new JSZip();

          // eslint-disable-next-line no-restricted-syntax
          for (const chunk of downloadChunks) {
            /**
             * Convert to CSV
             */
            const csv = datapointsToCSV({
              data: chunk.output,
              aggregate,
              delimiter: selectedDelimiter,
              format: isHumanReadableDates
                ? humanReadableDateFormat
                : undefined,
              formatLabel: (externalId) =>
                chart?.timeSeriesCollection?.find(
                  (ts) => externalId === ts.tsExternalId
                )?.name || externalId,
              granularity,
              isRaw: isRawDownload,
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
    chart?.dateFrom,
    chart?.dateTo,
    chart?.name,
    chart?.sourceCollection,
    chart?.timeSeriesCollection,
    selectedDelimiter,
    selectedGranularity,
    isHumanReadableDates,
    isRawDownload,
  ]);

  return (
    <ModalWrapper
      appElement={document.getElementsByTagName('body')}
      title="Export to CSV"
      visible={isModalVisible}
      footer={null}
      onCancel={handleCloseModal}
      width={750}
    >
      <p>
        Only the time series currently visible in your chart will be a part of
        the downloaded data. If applicable - adjust which time series are
        visible by using the eye icon for each time series.
      </p>

      <p>NOTE: Calculation results are not included</p>

      <FieldContainer>
        <Label>
          <Tooltip content="Time span of data to export">
            <>Time span</>
          </Tooltip>
        </Label>
        <DateRangeSelector />
      </FieldContainer>

      <FieldContainer>
        <Label>
          <Tooltip content="Granularity of the data to export (defaults to 1 day (1d)')">
            <>Granularity</>
          </Tooltip>
        </Label>
        <FullWidthInput
          disabled={isRawDownload}
          onChange={(event) => setSelectedGranularity(event.target.value)}
          value={selectedGranularity}
          placeholder="1d (default)"
          type="text"
        />
        <ExampleText>Examples: 30s, 45m, 2h, 3d</ExampleText>
      </FieldContainer>

      <FieldContainer>
        <Checkbox
          name="rawDatapoints"
          value={isRawDownload}
          onChange={(checked: boolean) => setIsRawDownload(checked)}
        />
        <Label>
          <Tooltip
            maxWidth={350}
            content="Download raw data points from the source - without aggregation, limited to 100,000 points per time series"
          >
            <>Download raw data (separate file per time series)</>
          </Tooltip>
        </Label>
      </FieldContainer>

      <FieldContainer>
        <Label>
          <Tooltip content="Choose which CSV delimiter format you prefer">
            <>Delimiter</>
          </Tooltip>
        </Label>
        <SegmentedControl
          onButtonClicked={(id: string) => {
            setSelectedDelimiterId(id);
          }}
          currentKey={selectedDelimiterId}
          fullWidth
        >
          {delimiterOptions.map((delimiter) => (
            <SegmentedControl.Button key={delimiter.id}>
              {delimiter.label}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl>
      </FieldContainer>

      <FieldContainer>
        <Checkbox
          name="humanReadableDates"
          value={isHumanReadableDates}
          onChange={(checked: boolean) => setIsHumanReadableDates(checked)}
        />
        <Label>
          <Tooltip
            maxWidth={350}
            content="Set the date format to 'yyyy-mm-dd HH:mm:ss' - otherwise it will be a timestamp"
          >
            <>Human readable dates</>
          </Tooltip>
        </Label>
      </FieldContainer>

      <BottomContainer>
        <StatusContainer>
          {error && (
            <Tooltip maxWidth={350} content={error.message}>
              <StatusText>
                <StatusIcon style={{ color: 'var(--cogs-red)' }} type="Error" />{' '}
                Export failed
              </StatusText>
            </Tooltip>
          )}
          {!error && isExporting && (
            <StatusText>
              <StatusIcon type="Loader" /> Exporting - please wait
            </StatusText>
          )}
          {!error && isDoneExporting && (
            <StatusText>
              <StatusIcon
                style={{ color: 'var(--cogs-green)' }}
                type="Checkmark"
              />{' '}
              Export successful
            </StatusText>
          )}
        </StatusContainer>
        <ButtonGroup>
          <Button
            onClick={handleCloseModal}
            style={{ marginRight: 5 }}
            type="secondary"
          >
            Cancel
          </Button>
          <Button disabled={isExporting} onClick={handleExport} type="primary">
            Export
          </Button>
        </ButtonGroup>
      </BottomContainer>
    </ModalWrapper>
  );
};

export default CSVModal;

const ModalWrapper = styled(Modal)`
  max-width: 450px;
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;

const ExampleText = styled.p`
  font-size: 10px;
  color: #555;
`;

const FullWidthInput = styled(Input)`
  width: 100%;
`;

const Label = styled.label`
  font-weight: 500;
`;

const FieldContainer = styled.div`
  margin-top: 20px;
`;

const ButtonGroup = styled.div``;

const BottomContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center; ;
`;

const StatusText = styled.div`
  display: flex;
  align-items: center; ;
`;

const StatusIcon = styled(Icon)`
  margin-right: 5px;
`;
