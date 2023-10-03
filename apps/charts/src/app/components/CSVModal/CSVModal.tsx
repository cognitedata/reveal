import { ComponentProps, useContext, useState } from 'react';

import { Checkbox, SegmentedControl, Tooltip, Modal } from '@cognite/cogs.js';

import { Delimiters } from '../../utils/csv';
import { makeDefaultTranslations } from '../../utils/translations';
import DateTimeRangeSelector from '../DateTime/DateTimeRangeSelector';

import { CSVModalContext } from './CSVModalContext';
import {
  ExampleText,
  FullWidthInput,
  Label,
  FieldContainer,
  BottomContainer,
  StatusContainer,
  StatusText,
  StatusIcon,
  ErrorIcon,
  WarningIcon,
  SuccessIcon,
} from './elements';

export const defaultTranslations = makeDefaultTranslations(
  'Export to CSV',
  'Only sources currently visible in your chart will be a part of the downloaded data. If applicable - adjust which sources are visible by using the eye icon for each time series.',
  'Time span of data to export',
  'Time span',
  'Granularity of the data to export (defaults to 1 day (1d))',
  'Granularity',
  '1d (default)',
  'Examples - 30s, 45m, 2h, 3d',
  'Download raw data points from the source - without aggregation, limited to 100,000 points per time series',
  'Download raw data (separate file per time series)',
  'Choose which CSV delimiter format you prefer',
  'Delimiter',
  "Set the date format to 'yyyy-mm-dd HH-mm-ss' - otherwise it will be a timestamp",
  'Human readable dates',
  'Export failed',
  'Exporting - please wait',
  'Export successful',
  'Cancel',
  'Export',
  'Nothing to export',
  'At least one time series must be enabled in the chart to be able to export',
  'Sorry, we currently do not support exporting calculations to CSV. For now, you can only download time series as CSV.'
);

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  dateFrom: Date;
  dateTo: Date;
  onDateChange: ComponentProps<typeof DateTimeRangeSelector>['onChange'];
  translations?: typeof defaultTranslations;
  locale: ComponentProps<typeof DateTimeRangeSelector>['locale'];
};

const delimiterOptions: { id: string; value: Delimiters; label: string }[] = [
  { id: '1', value: Delimiters.Semicolon, label: ';' },
  { id: '2', value: Delimiters.Comma, label: ',' },
  { id: '3', value: Delimiters.Tab, label: 'tab' },
];

export const CSVModal = ({
  isOpen = false,
  onClose = () => {},
  dateFrom,
  dateTo,
  onDateChange,
  translations,
  locale,
}: Props) => {
  const { useChartAtom, useExportToCSV, useSDK } = useContext(CSVModalContext);
  const t = { ...defaultTranslations, ...translations };
  const [chart] = useChartAtom();
  const [selectedDelimiterId, setSelectedDelimiterId] = useState(
    delimiterOptions[0].id
  );
  const [selectedGranularity, setSelectedGranularity] = useState('1d');
  const [isHumanReadableDates, setIsHumanReadableDates] = useState(true);
  const sdk = useSDK();

  const selectedDelimiter = delimiterOptions.find(
    ({ id }) => id === selectedDelimiterId
  )?.value;

  const hasNoSourcesVisible = [
    ...(chart?.timeSeriesCollection || []),
    ...(chart?.workflowCollection || []),
  ].every((source) => !source.enabled);

  const [isRawDownload, setIsRawDownload] = useState(false);

  const { onExport, error, isExporting, isDoneExporting } = useExportToCSV({
    name: chart?.name || 'Unnamed export',
    timeseriesCollection: chart?.timeSeriesCollection,
    workflowCollection: chart?.workflowCollection,
    granularity: selectedGranularity || '1d',
    delimiter: selectedDelimiter,
    dateFrom: chart?.dateFrom || new Date().toJSON(),
    dateTo: chart?.dateTo || new Date().toJSON(),
    enableHumanReadableDates: isHumanReadableDates,
    enableRawExport: isRawDownload,
    sdk,
  });

  return (
    <Modal
      title={t['Export to CSV']}
      visible={isOpen}
      onCancel={onClose}
      cancelText={t.Cancel}
      okText={t.Export}
      okDisabled={isExporting || hasNoSourcesVisible}
      onOk={onExport}
      size="medium"
    >
      <p>
        {
          t[
            'Only sources currently visible in your chart will be a part of the downloaded data. If applicable - adjust which sources are visible by using the eye icon for each time series.'
          ]
        }
      </p>

      <FieldContainer>
        <Label>
          <Tooltip content={t['Time span of data to export']}>
            <>{t['Time span']}</>
          </Tooltip>
        </Label>
        <DateTimeRangeSelector
          range={{
            startDate: dateFrom,
            endDate: dateTo,
          }}
          onChange={onDateChange}
          locale={locale}
        />
      </FieldContainer>

      <FieldContainer>
        <Label>
          <Tooltip
            content={
              t['Granularity of the data to export (defaults to 1 day (1d))']
            }
          >
            <>{t.Granularity}</>
          </Tooltip>
        </Label>
        <FullWidthInput
          disabled={isRawDownload}
          onChange={(event) => setSelectedGranularity(event.target.value)}
          value={selectedGranularity}
          placeholder={t['1d (default)']}
          type="text"
        />
        <ExampleText>{t['Examples - 30s, 45m, 2h, 3d']}</ExampleText>
      </FieldContainer>

      <FieldContainer>
        <Tooltip
          maxWidth={350}
          content={
            t[
              'Download raw data points from the source - without aggregation, limited to 100,000 points per time series'
            ]
          }
        >
          <Checkbox
            name="rawDatapoints"
            checked={Boolean(isRawDownload)}
            onChange={(event) => setIsRawDownload(event.target.checked)}
            label={t['Download raw data (separate file per time series)']}
          />
        </Tooltip>
      </FieldContainer>

      <FieldContainer>
        <Label>
          <Tooltip content={t['Choose which CSV delimiter format you prefer']}>
            <>{t.Delimiter}</>
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
        <Tooltip
          maxWidth={350}
          content={
            t[
              "Set the date format to 'yyyy-mm-dd HH-mm-ss' - otherwise it will be a timestamp"
            ]
          }
        >
          <Checkbox
            name="humanReadableDates"
            checked={Boolean(isHumanReadableDates)}
            onChange={(event) => setIsHumanReadableDates(event.target.checked)}
            label={t['Human readable dates']}
          />
        </Tooltip>
      </FieldContainer>

      <BottomContainer>
        <StatusContainer>
          {error && (
            <Tooltip maxWidth={350} content={error.message}>
              <StatusText title={error.message}>
                <ErrorIcon type="Error" /> {t['Export failed']}
              </StatusText>
            </Tooltip>
          )}
          {!error && hasNoSourcesVisible && (
            <Tooltip
              maxWidth={350}
              content={
                t[
                  'At least one time series must be enabled in the chart to be able to export'
                ]
              }
            >
              <StatusText>
                <WarningIcon type="WarningFilled" /> {t['Nothing to export']}
              </StatusText>
            </Tooltip>
          )}
          {!error && isExporting && (
            <StatusText>
              <StatusIcon type="Loader" /> {t['Exporting - please wait']}
            </StatusText>
          )}
          {!error && isDoneExporting && (
            <StatusText>
              <SuccessIcon type="Checkmark" /> {t['Export successful']}
            </StatusText>
          )}
        </StatusContainer>
      </BottomContainer>
    </Modal>
  );
};

CSVModal.translationKeys = Object.keys(defaultTranslations);

export default CSVModal;
