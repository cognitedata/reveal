import { Button, Tooltip, SegmentedControl } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { Row, Col, List, Typography } from 'antd';
import DetailsBlock from 'components/common/DetailsBlock';
import { MetadataList } from 'components/DetailsSidebar';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import { getCallResponse } from 'utils/backendApi';
import { functionResponseKey } from 'utils/backendService';
import { convertValue } from 'utils/units';
import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  Container,
  ColorCircle,
} from './elements';

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
            onButtonClicked={(key) => handleMenuClick(key)}
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
  const sdk = useSDK();
  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];

  const { data } = useQuery({
    queryKey: functionResponseKey(
      statisticsCall?.functionId,
      statisticsCall?.callId
    ),
    queryFn: (): Promise<string | undefined> =>
      getCallResponse(sdk, statisticsCall?.functionId, statisticsCall.callId),
    retry: 1,
    retryDelay: 1000,
    enabled: !!statisticsCall,
  });

  const { results } = (data as any) || {};
  const { statistics = [] } = (results as StatisticsResult) || {};
  const statisticsForSource = statistics[0];
  const unit = sourceItem?.unit;
  const preferredUnit = sourceItem?.preferredUnit;

  return (
    <Container>
      <SourceHeader sourceItem={sourceItem} />
      {sourceItem?.type === 'timeseries' ? (
        <>
          <DetailsBlock title="Statistics">
            <List
              dataSource={[
                { label: 'Mean', value: statisticsForSource?.mean },
                {
                  label: 'Standard Deviation',
                  value: statisticsForSource?.std,
                },
                { label: 'Max', value: statisticsForSource?.max },
                { label: 'Min', value: statisticsForSource?.min },
                { label: 'Median', value: statisticsForSource?.median },
                // Missing values from backend according to the sketch
                // { label: 'Avg', value: statisticsForSource?.average },
                // { label: 'Last', value: statisticsForSource?.last },
              ]}
              size="small"
              renderItem={({ label, value }) => (
                <Row className="ant-list-item">
                  <Col span={14}>{label}</Col>
                  <Col span={10} style={{ textAlign: 'right' }}>
                    {value ? convertValue(value, unit, preferredUnit) : '-'}
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
                    {value ? convertValue(value, unit, preferredUnit) : '-'}
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
                    {value || '-'}
                  </Col>
                </Row>
              )}
            />
          </DetailsBlock>
        </>
      ) : (
        <Typography.Text>
          Statistics are currently unavailable for calculations
        </Typography.Text>
      )}
    </Container>
  );
};

const SourceHeader = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <h4>Time Series</h4>
      <p style={{ display: 'flex' }}>
        <span style={{ paddingRight: 10 }}>
          <ColorCircle color={sourceItem?.color} />
        </span>
        {sourceItem?.name}
      </p>
    </div>
  );
};
