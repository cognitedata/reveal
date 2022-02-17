/* eslint camelcase: 0 */

import { StatisticsStatusStatusEnum } from '@cognite/calculation-backend';
import {
  Button,
  Icon,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { Col, List, Row } from 'antd';
import DetailsBlock from 'components/common/DetailsBlock';
import {
  getDisplayUnit,
  Histogram,
  MetadataList,
  useStatistics,
} from 'components/DetailsSidebar';
import StatisticsCallStatus from 'components/StatisticsCallStatus';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import { useState } from 'react';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { formatValueForDisplay } from 'utils/numbers';
import { getUnitConverter } from 'utils/units';
import {
  Container,
  ContentOverflowWrapper,
  HistogramWrapper,
  Sidebar,
  SourceItemName,
  SourceItemWrapper,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from './elements';

const renderStatusIcon = (status?: StatisticsStatusStatusEnum) => {
  switch (status) {
    case StatisticsStatusStatusEnum.Pending:
    case StatisticsStatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case StatisticsStatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case StatisticsStatusStatusEnum.Failed:
    case StatisticsStatusStatusEnum.Error:
      return <Icon type="ExclamationMark" title="Failed" />;
    default:
      return null;
  }
};

type Props = {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  onClose: () => void;
  visible?: boolean;
};

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
}: Props) {
  const [selectedMenu, setSelectedMenu] = useState<string>('statistics');

  const handleMenuClick = (value: string) => {
    setSelectedMenu(value);
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <TopContainerTitle>Details</TopContainerTitle>
        <TopContainerAside>
          <SegmentedControl
            currentKey={selectedMenu}
            onButtonClicked={(keyCode: string) => handleMenuClick(keyCode)}
          >
            {menuOptions.map(({ value, label }) => (
              <SegmentedControl.Button key={value}>
                {label}
              </SegmentedControl.Button>
            ))}
          </SegmentedControl>
          <Tooltip content="Hide">
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
          <SourceHeader sourceItem={sourceItem} />
          {selectedMenu === 'metadata' && <Metadata sourceItem={sourceItem} />}
          {selectedMenu === 'statistics' && visible && (
            <Statistics sourceItem={sourceItem} />
          )}
        </Container>
      </ContentOverflowWrapper>
    </Sidebar>
  );
}

const Metadata = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  return (
    <>
      {sourceItem?.type === 'timeseries' ? (
        <MetadataList timeseriesId={(sourceItem as ChartTimeSeries)?.tsId} />
      ) : (
        <p>(currently unavailable for calculations)</p>
      )}
    </>
  );
};

const Statistics = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];
  const { results: statistics } = useStatistics(sourceItem);
  const unit = sourceItem?.unit;
  const preferredUnit = sourceItem?.preferredUnit;
  const displayUnit = getDisplayUnit(preferredUnit);
  const convertUnit = getUnitConverter(unit, preferredUnit);

  return (
    <>
      <div>
        <StatisticsCallStatus
          id={statisticsCall?.callId}
          renderLoading={() =>
            renderStatusIcon(StatisticsStatusStatusEnum.Running)
          }
          renderStatus={({ status }) => renderStatusIcon(status)}
        />
      </div>
      <DetailsBlock title="Statistics">
        <List
          dataSource={[
            { label: 'Mean', value: statistics?.mean },
            { label: 'Median', value: statistics?.median },
            {
              label: 'Standard Deviation',
              value: statistics?.std,
            },
            { label: 'Max', value: statistics?.max },
            { label: 'Min', value: statistics?.min },
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
      <DetailsBlock title="Percentiles">
        <List
          dataSource={[
            { label: '25th Percentile', value: statistics?.q25 },
            { label: '50th Percentile', value: statistics?.q50 },
            { label: '75th Percentile', value: statistics?.q75 },
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
      <DetailsBlock title="Shape">
        <List
          dataSource={[
            { label: 'Skewness', value: statistics?.skewness },
            { label: 'Kurtosis', value: statistics?.kurtosis },
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
      <DetailsBlock title="Histogram">
        <HistogramWrapper>
          <Histogram
            data={statistics?.histogram}
            unit={unit}
            preferredUnit={preferredUnit}
          />
        </HistogramWrapper>
      </DetailsBlock>
    </>
  );
};

const SourceHeader = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  const isTimeSeries = sourceItem?.type === 'timeseries';
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <Title level={6}>{isTimeSeries ? 'Time Series' : 'Calculation'}</Title>
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
