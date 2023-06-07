import { Button, Checkbox, SegmentedControl, Tooltip } from '@cognite/cogs.js';
import DateTimeRangeSelector from 'components/DateTime/DateTimeRangeSelector';
import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Delimiters } from 'utils/csv';
import { makeDefaultTranslations } from 'utils/translations';
import { CSVModalContext } from './CSVModalContext';
import {
  ModalWrapper,
  ExampleText,
  FullWidthInput,
  Label,
  FieldContainer,
  ButtonGroup,
  BottomContainer,
  StatusContainer,
  StatusText,
  StatusIcon,
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
  const [isModalVisible, setIsModalVisible] = useState(isOpen);
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

  useEffect(() => {
    setIsModalVisible(isOpen);
  }, [isOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    onClose();
  }, [onClose]);

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
    <ModalWrapper
      appElement={document.getElementsByTagName('body')}
      title={t['Export to CSV']}
      visible={isModalVisible}
      footer={null}
      onCancel={handleCloseModal}
      width={750}
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
        <Checkbox
          name="rawDatapoints"
          value={isRawDownload}
          onChange={(checked: boolean) => setIsRawDownload(checked)}
        />
        <Label>
          <Tooltip
            maxWidth={350}
            content={
              t[
                'Download raw data points from the source - without aggregation, limited to 100,000 points per time series'
              ]
            }
          >
            <>{t['Download raw data (separate file per time series)']}</>
          </Tooltip>
        </Label>
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
        <Checkbox
          name="humanReadableDates"
          value={isHumanReadableDates}
          onChange={(checked: boolean) => setIsHumanReadableDates(checked)}
        />
        <Label>
          <Tooltip
            maxWidth={350}
            content={
              t[
                "Set the date format to 'yyyy-mm-dd HH-mm-ss' - otherwise it will be a timestamp"
              ]
            }
          >
            <>{t['Human readable dates']}</>
          </Tooltip>
        </Label>
      </FieldContainer>

      <BottomContainer>
        <StatusContainer>
          {error && (
            <Tooltip maxWidth={350} content={error.message}>
              <StatusText title={error.message}>
                <StatusIcon style={{ color: 'var(--cogs-red)' }} type="Error" />{' '}
                {t['Export failed']}
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
                <StatusIcon
                  style={{ color: 'var(--cogs-yellow)' }}
                  type="WarningFilled"
                />{' '}
                {t['Nothing to export']}
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
              <StatusIcon
                style={{ color: 'var(--cogs-green)' }}
                type="Checkmark"
              />{' '}
              {t['Export successful']}
            </StatusText>
          )}
        </StatusContainer>
        <ButtonGroup>
          <Button
            onClick={handleCloseModal}
            style={{ marginRight: 5 }}
            type="secondary"
          >
            {t.Cancel}
          </Button>
          <Button
            disabled={isExporting || hasNoSourcesVisible}
            onClick={onExport}
            type="primary"
          >
            {t.Export}
          </Button>
        </ButtonGroup>
      </BottomContainer>
    </ModalWrapper>
  );
};

CSVModal.translationKeys = Object.keys(defaultTranslations);

export default CSVModal;
