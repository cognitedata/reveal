import {
  Icon,
  Button,
  Tooltip,
  SegmentedControl,
  Title,
} from '@cognite/cogs.js';
import { Row, Col, List } from 'antd';
import DetailsBlock from 'components/common/DetailsBlock';
import { MetadataList, useStatistics } from 'components/DetailsSidebar';
import FunctionCall from 'components/FunctionCall';
import { useState } from 'react';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import {
  FunctionCallStatus,
  ChartTimeSeries,
  ChartWorkflow,
} from 'reducers/charts/types';
import { convertValue, units } from 'utils/units';
import { roundToSignificantDigits } from 'utils/axis';
import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  Container,
  SourceItemName,
  SourceItemWrapper,
} from './elements';

const renderStatusIcon = (status?: FunctionCallStatus) => {
  switch (status) {
    case 'Running':
      return <Icon type="Loading" />;
    case 'Completed':
      return <Icon type="Checkmark" />;
    case 'Failed':
    case 'Timeout':
      return <Icon type="Close" />;
    default:
      return null;
  }
};

type Props = {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  onClose: () => void;
  visible?: boolean;
};

export type StatisticsResult = {
  statistics: StatisticsData[];
};

type StatisticsData = {
  min: number;
  max: number;
  average: number;
  mean: number;
  kurtosis: number;
  median: number;
  q25: number;
  q50: number;
  q75: number;
  raw: boolean;
  skewness: number;
  std: number;
  tag: string;
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
            onButtonClicked={(keyCode) => handleMenuClick(keyCode)}
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
        {selectedMenu === 'metadata' && <Metadata sourceItem={sourceItem} />}
        {selectedMenu === 'statistics' && (
          <Statistics sourceItem={sourceItem} />
        )}
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
    <Container>
      <SourceHeader sourceItem={sourceItem} />
      {sourceItem?.type === 'timeseries' ? (
        <MetadataList timeseriesId={(sourceItem as ChartTimeSeries)?.tsId} />
      ) : (
        <p>(currently unavailable for calculations)</p>
      )}
    </Container>
  );
};

const Statistics = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];
  const statisticsForSource = useStatistics(sourceItem);
  const unit = sourceItem?.unit;
  const preferredUnit = sourceItem?.preferredUnit;
  const displayUnit =
    (
      units.find(
        (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
      ) || {}
    ).label || preferredUnit;

  return (
    <Container>
      <SourceHeader sourceItem={sourceItem} />
      {sourceItem?.type === 'timeseries' ? (
        <>
          <div>
            <div>
              <FunctionCall
                id={statisticsCall?.functionId}
                callId={statisticsCall?.callId}
                renderLoading={() => renderStatusIcon('Running')}
                renderCall={({ status }) => renderStatusIcon(status)}
              />
            </div>
          </div>
          <DetailsBlock title="Statistics">
            <List
              dataSource={[
                { label: 'Mean', value: statisticsForSource?.mean },
                { label: 'Median', value: statisticsForSource?.median },
                {
                  label: 'Standard Deviation',
                  value: statisticsForSource?.std,
                },
                { label: 'Max', value: statisticsForSource?.max },
                { label: 'Min', value: statisticsForSource?.min },
                // Missing values from backend according to the sketch
                // { label: 'Avg', value: statisticsForSource?.average },
                // { label: 'Last', value: statisticsForSource?.last },
              ]}
              size="small"
              renderItem={({ label, value }) => (
                <Row className="ant-list-item">
                  <Col span={14}>{label}</Col>
                  <Col span={10} style={{ textAlign: 'right' }}>
                    {typeof value === 'number'
                      ? `${roundToSignificantDigits(
                          convertValue(value, unit, preferredUnit),
                          3
                        )} ${displayUnit}`
                      : '-'}
                  </Col>
                </Row>
              )}
            />
          </DetailsBlock>
          <DetailsBlock title="Percentiles">
            <List
              dataSource={[
                { label: '25th Percentile', value: statisticsForSource?.q25 },
                { label: '50th Percentile', value: statisticsForSource?.q50 },
                { label: '75th Percentile', value: statisticsForSource?.q75 },
              ]}
              size="small"
              renderItem={({ label, value }) => (
                <Row className="ant-list-item">
                  <Col span={14}>{label}</Col>
                  <Col span={10} style={{ textAlign: 'right' }}>
                    {typeof value === 'number'
                      ? `${roundToSignificantDigits(
                          convertValue(value, unit, preferredUnit),
                          3
                        )} ${displayUnit}`
                      : '-'}
                  </Col>
                </Row>
              )}
            />
          </DetailsBlock>
          <DetailsBlock title="Shape">
            <List
              dataSource={[
                { label: 'Skewness', value: statisticsForSource?.skewness },
                { label: 'Kurtosis', value: statisticsForSource?.kurtosis },
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
        </>
      ) : (
        <p>(currently unavailable for calculations)</p>
      )}
    </Container>
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
