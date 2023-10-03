/* eslint camelcase: 0 */

import { useState } from 'react';

import { Col, List, Row } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import {
  StatisticsResult,
  StatisticsResultResults,
  StatusStatusEnum,
} from '@cognite/calculation-backend';
import { ChartSource } from '@cognite/charts-lib';
import {
  Button,
  Icon,
  Infobox,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { useScheduledCalculationDataValue } from '../../models/scheduled-calculation-results/atom';
import { SourceCircle, SourceSquare } from '../../pages/ChartViewPage/elements';
import { formatValueForDisplay } from '../../utils/numbers';
import { makeDefaultTranslations } from '../../utils/translations';
import { getUnitConverter } from '../../utils/units';
import {
  Sidebar,
  ContentOverflowWrapper,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from '../Common/SidebarElements';
import DetailsBlock from '../DetailsBlock/DetailsBlock';
import { Histogram } from '../Histogram/Histogram';

import {
  Container,
  HistogramWrapper,
  SourceItemName,
  SourceItemWrapper,
} from './elements';
import { MetadataList } from './MetadataList';
import { getDisplayUnit } from './utils';

const renderStatusIcon = (status?: StatusStatusEnum) => {
  switch (status) {
    case StatusStatusEnum.Pending:
    case StatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case StatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case StatusStatusEnum.Failed:
    case StatusStatusEnum.Error:
      return (
        <Tooltip content="Failed">
          <Icon type="ExclamationMark" />
        </Tooltip>
      );
    default:
      return null;
  }
};

type Props = {
  sourceItem: ChartSource | undefined;
  onClose: () => void;
  visible?: boolean;
  statisticsResult?: StatisticsResultResults | null;
  statisticsError?: StatisticsResult['error'] | null;
  statisticsWarnings?: StatisticsResult['warnings'] | null;
  statisticsStatus?: StatusStatusEnum;
};

const defaultTranslation = makeDefaultTranslations(
  'Details',
  'Hide',
  'currently unavailable for calculations',
  'Statistics',
  'Metadata',
  'Time series',
  'Calculation',
  'Warnings',
  'Error',
  'Scheduled Calculation'
);

const statsDefaultTranslations = makeDefaultTranslations(
  'Statistics',
  'Percentiles',
  'Shape',
  'Histogram',
  'No histogram data available',
  'Mean',
  'Median',
  'Standard Deviation',
  'Max',
  'Min',
  '25th Percentile',
  '50th Percentile',
  '75th Percentile',
  'Skewness',
  'Kurtosis'
);

const menuOptions = [
  {
    value: 'statistics',
    label: 'Statistics',
  },
  {
    value: 'metadata',
    label: 'Metadata',
  },
];

export default function DetailsSidebar({
  visible,
  sourceItem,
  onClose,
  statisticsResult,
  statisticsError,
  statisticsWarnings,
  statisticsStatus,
}: Props) {
  const [selectedMenu, setSelectedMenu] = useState<string>('statistics');

  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'DetailsSidebar').t,
  };

  const statsTranslations = {
    ...statsDefaultTranslations,
    ...useTranslations(Object.keys(statsDefaultTranslations), 'DetailsSidebar')
      .t,
  };

  const handleMenuClick = (value: string) => {
    setSelectedMenu(value);
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <TopContainerTitle>{t.Details}</TopContainerTitle>
        <TopContainerAside>
          <SegmentedControl
            currentKey={selectedMenu}
            onButtonClicked={(keyCode: string) => handleMenuClick(keyCode)}
          >
            {menuOptions.map(({ value }) => (
              <SegmentedControl.Button key={value}>
                {value === 'statistics' ? t.Statistics : t.Metadata}
              </SegmentedControl.Button>
            ))}
          </SegmentedControl>
          <Tooltip content={t.Hide}>
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="close"
            />
          </Tooltip>
        </TopContainerAside>
      </TopContainer>
      <ContentOverflowWrapper>
        <Container>
          <SourceHeader
            sourceItem={sourceItem}
            timeSeriesTitle={t['Time series']}
            calculationTitle={t.Calculation}
            scheduledCalcTitle={t['Scheduled Calculation']}
          />
          {statisticsError && (
            <Infobox
              type="danger"
              title={t.Error}
              style={{ marginBottom: '1rem' }}
            >
              {statisticsError}
            </Infobox>
          )}
          {statisticsWarnings &&
            statisticsWarnings.map((warning) => (
              <Infobox
                type="warning"
                title={t.Warnings}
                key={uuidv4()}
                style={{ marginBottom: '1rem' }}
              >
                {warning}
              </Infobox>
            ))}
          {!statisticsError && (
            <>
              {selectedMenu === 'metadata' && (
                <Metadata
                  sourceItem={sourceItem}
                  noMetaText={t['currently unavailable for calculations']}
                />
              )}
              {selectedMenu === 'statistics' && visible && (
                <Statistics
                  sourceItem={sourceItem}
                  translations={statsTranslations}
                  statistics={statisticsResult}
                  status={statisticsStatus}
                />
              )}
            </>
          )}
        </Container>
      </ContentOverflowWrapper>
    </Sidebar>
  );
}

const Metadata = ({
  sourceItem,
  noMetaText = 'currently unavailable for calculations',
}: {
  sourceItem: ChartSource | undefined;
  noMetaText?: string;
}) => {
  const scheduledCalculationsData = useScheduledCalculationDataValue();

  if (!sourceItem) {
    return null;
  }

  switch (sourceItem.type) {
    case 'workflow': {
      return <p>({noMetaText})</p>;
    }

    case 'scheduledCalculation': {
      const scheduledCalcTSId =
        scheduledCalculationsData[sourceItem.id]?.series?.id;
      if (scheduledCalcTSId) {
        return <MetadataList timeseriesId={scheduledCalcTSId} />;
      }
      break;
    }

    case 'timeseries': {
      if (sourceItem.tsId) {
        return <MetadataList timeseriesId={sourceItem.tsId} />;
      }
      break;
    }

    default:
      break;
  }

  return null;
};

const Statistics = ({
  sourceItem,
  translations = statsDefaultTranslations,
  statistics,
  status,
}: {
  sourceItem: ChartSource | undefined;
  translations?: typeof statsDefaultTranslations;
  statistics?: StatisticsResultResults | null;
  status?: StatusStatusEnum;
}) => {
  const unit = sourceItem?.unit;
  const preferredUnit = sourceItem?.preferredUnit;
  const customUnitLabel = sourceItem?.customUnitLabel;
  const displayUnit = getDisplayUnit(preferredUnit, customUnitLabel);
  const convertUnit = getUnitConverter(unit, preferredUnit);

  const t = {
    ...statsDefaultTranslations,
    ...translations,
  };

  return (
    <>
      <div>{renderStatusIcon(status)}</div>
      <DetailsBlock title={t.Statistics}>
        <List
          dataSource={[
            { label: t.Mean, value: statistics?.mean },
            { label: t.Median, value: statistics?.median },
            {
              label: t['Standard Deviation'],
              value: statistics?.std,
            },
            { label: t.Max, value: statistics?.max },
            { label: t.Min, value: statistics?.min },
          ]}
          size="small"
          renderItem={({ label, value }) => (
            <Row className="ant-list-item">
              <Col span={14}>{label}</Col>
              <Col span={10} style={{ textAlign: 'right' }}>
                {formatValueForDisplay(convertUnit(value))} {displayUnit}
              </Col>
            </Row>
          )}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Percentiles}>
        <List
          dataSource={[
            { label: t['25th Percentile'], value: statistics?.q25 },
            { label: t['50th Percentile'], value: statistics?.q50 },
            { label: t['75th Percentile'], value: statistics?.q75 },
          ]}
          size="small"
          renderItem={({ label, value }) => (
            <Row className="ant-list-item">
              <Col span={14}>{label}</Col>
              <Col span={10} style={{ textAlign: 'right' }}>
                {formatValueForDisplay(convertUnit(value))} {displayUnit}
              </Col>
            </Row>
          )}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Shape}>
        <List
          dataSource={[
            { label: t.Skewness, value: statistics?.skewness },
            { label: t.Kurtosis, value: statistics?.kurtosis },
          ]}
          size="small"
          renderItem={({ label, value }) => (
            <Row className="ant-list-item">
              <Col span={14}>{label}</Col>
              <Col span={10} style={{ textAlign: 'right' }}>
                {typeof value === 'number' ? value : '-'}
              </Col>
            </Row>
          )}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Histogram}>
        <HistogramWrapper>
          <Histogram
            data={statistics?.histogram}
            unit={unit}
            preferredUnit={preferredUnit}
            unitLabel={displayUnit}
            noDataText={t['No histogram data available']}
          />
        </HistogramWrapper>
      </DetailsBlock>
    </>
  );
};

const SourceHeader = ({
  sourceItem,
  timeSeriesTitle = 'Time series',
  calculationTitle = 'Calculation',
  scheduledCalcTitle = 'Scheduled Calculation',
}: {
  sourceItem: ChartSource | undefined;
  timeSeriesTitle?: string;
  calculationTitle?: string;
  scheduledCalcTitle?: string;
}) => {
  const isTimeSeries = sourceItem?.type === 'timeseries';
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <Title level={6}>
        {sourceItem?.type === 'timeseries' && timeSeriesTitle}
        {sourceItem?.type === 'workflow' && calculationTitle}
        {sourceItem?.type === 'scheduledCalculation' && scheduledCalcTitle}
      </Title>
      <SourceItemWrapper>
        {isTimeSeries ? (
          <SourceCircle color={sourceItem?.color} fade={false} />
        ) : (
          <SourceSquare color={sourceItem?.color} fade={false} />
        )}
        <SourceItemName>{sourceItem?.name}</SourceItemName>
      </SourceItemWrapper>
    </div>
  );
};
