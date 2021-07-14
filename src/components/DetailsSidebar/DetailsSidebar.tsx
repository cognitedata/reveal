import { Button, Tooltip, SegmentedControl } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
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
import { MetadataItem } from './MetadataItem';

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
          <MetadataItem
            label="Min"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.min, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="Max"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.max, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="Mean"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.mean, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="Median"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.median, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="Standard Deviation"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.std, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="25th Percentile"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.q25, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="50th Percentile"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.q50, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="75th Percentile"
            value={
              statisticsForSource
                ? convertValue(statisticsForSource.q75, unit, preferredUnit)
                : '-'
            }
          />
          <MetadataItem
            label="Skewness"
            value={statisticsForSource ? statisticsForSource.skewness : '-'}
          />
          <MetadataItem
            label="Kurtosis"
            value={statisticsForSource ? statisticsForSource.kurtosis : '-'}
          />
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
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <h3>Source:</h3>
      <p style={{ display: 'flex' }}>
        <span style={{ paddingRight: 10 }}>
          <ColorCircle color={sourceItem?.color} />
        </span>
        {sourceItem?.name}
      </p>
    </div>
  );
};
