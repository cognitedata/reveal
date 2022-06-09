/* eslint camelcase: 0 */

import {
  StatisticsResultResults,
  StatusStatusEnum,
} from '@cognite/calculation-backend';
import {
  Button,
  Icon,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { Col, List, Row } from 'antd';
import DetailsBlock from 'components/DetailsBlock/DetailsBlock';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import { useState } from 'react';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { formatValueForDisplay } from 'utils/numbers';
import { getUnitConverter } from 'utils/units';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import {
  Sidebar,
  ContentOverflowWrapper,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import {
  Container,
  HistogramWrapper,
  SourceItemName,
  SourceItemWrapper,
} from './elements';
import { MetadataList } from './MetadataList';
import { getDisplayUnit } from './utils';
import { Histogram } from './Histogram';

const renderStatusIcon = (status?: StatusStatusEnum) => {
  switch (status) {
    case StatusStatusEnum.Pending:
    case StatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case StatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case StatusStatusEnum.Failed:
    case StatusStatusEnum.Error:
      return <Icon type="ExclamationMark" title="Failed" />;
    default:
      return null;
  }
};

type Props = {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  onClose: () => void;
  visible?: boolean;
  statisticsResult?: StatisticsResultResults | null;
  statisticsStatus?: StatusStatusEnum;
};

const defaultTranslation = makeDefaultTranslations(
  'Details',
  'Hide',
  'currently unavailable for calculations',
  'Statistics',
  'Metadata',
  'Time series',
  'Calculation'
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
          />
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
        </Container>
      </ContentOverflowWrapper>
    </Sidebar>
  );
}

const Metadata = ({
  sourceItem,
  noMetaText = 'currently unavailable for calculations',
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  noMetaText?: string;
}) => {
  return (
    <>
      {sourceItem?.type === 'timeseries' ? (
        <MetadataList timeseriesId={(sourceItem as ChartTimeSeries)?.tsId} />
      ) : (
        <p>({noMetaText})</p>
      )}
    </>
  );
};

const Statistics = ({
  sourceItem,
  translations = statsDefaultTranslations,
  statistics,
  status,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
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
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  timeSeriesTitle?: string;
  calculationTitle?: string;
}) => {
  const isTimeSeries = sourceItem?.type === 'timeseries';
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <Title level={6}>
        {isTimeSeries ? timeSeriesTitle : calculationTitle}
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
