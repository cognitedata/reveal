import {
  Icon,
  Button,
  Tooltip,
  SegmentedControl,
  Body,
  Title,
} from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { Row, Col, List } from 'antd';
import { chartState } from 'atoms/chart';
import DetailsBlock from 'components/common/DetailsBlock';
import { MetadataList } from 'components/DetailsSidebar';
import FunctionCall from 'components/FunctionCall';
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';
import { useRecoilState } from 'recoil';
import {
  ChartTimeSeries,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { getCallResponse } from 'utils/backendApi';
import { functionResponseKey, useCallFunction } from 'utils/backendService';
import { convertValue } from 'utils/units';
import { usePrevious } from 'hooks/usePrevious';
import { CogniteClient } from '@cognite/sdk';
import * as backendApi from 'utils/backendApi';
import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  Container,
  ColorCircle,
} from './elements';

const key = ['functions', 'individual_calc'];

const getCallStatus =
  (sdk: CogniteClient, fnId: number, callId: number) => async () => {
    const response = await backendApi.getCallStatus(sdk, fnId, callId);

    if (response?.status) {
      return response.status as FunctionCallStatus;
    }
    return Promise.reject(new Error('could not find call status'));
  };

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
  const sdk = useSDK();
  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];
  const [chart, setChart] = useRecoilState(chartState);
  const { dateFrom, dateTo } = chart!;

  const sourceId = sourceItem?.id;
  const previousSourceId = usePrevious<string | undefined>(sourceId);
  const sourceChanged = sourceId !== previousSourceId;

  /**
   * Using strings to avoid custom equality check
   */
  const datesAsString = JSON.stringify({ dateFrom, dateTo });

  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

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

  const { data: callStatus, error: callStatusError } =
    useQuery<FunctionCallStatus>(
      [...key, statisticsCall?.callId, 'call_status'],
      getCallStatus(
        sdk,
        statisticsCall?.functionId as number,
        statisticsCall?.callId as number
      ),
      {
        enabled: !!statisticsCall?.callId,
      }
    );

  const { results } = (data as any) || {};
  const { statistics = [] } = (results as StatisticsResult) || {};
  const statisticsForSource = statistics[0];
  const unit = sourceItem?.unit;
  const preferredUnit = sourceItem?.preferredUnit;

  const { mutate: callFunction } = useCallFunction('individual_calc-master');
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

  const updateStatistics = useCallback(
    (diff: Partial<ChartTimeSeries>) => {
      if (!sourceItem) {
        return;
      }
      setChart((oldChart) => ({
        ...oldChart!,
        timeSeriesCollection: oldChart?.timeSeriesCollection?.map((ts) =>
          ts.id === sourceItem.id
            ? {
                ...ts,
                ...diff,
              }
            : ts
        ),
      }));
    },
    [setChart, sourceItem]
  );

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (sourceItem?.type !== 'timeseries') {
      return;
    }

    if (!sourceChanged) {
      if (!datesChanged) {
        if (statisticsForSource) {
          return;
        }
        if (statisticsCall && !callStatusError) {
          return;
        }
      }
    }

    memoizedCallFunction(
      {
        data: {
          calculation_input: {
            timeseries: [
              {
                tag: (sourceItem as ChartTimeSeries).tsExternalId,
              },
            ],
            start_time: new Date(dateFrom).getTime(),
            end_time: new Date(dateTo).getTime(),
          },
        },
      },
      {
        onSuccess({ functionId, callId }) {
          updateStatistics({
            statisticsCalls: [
              {
                callDate: Date.now(),
                functionId,
                callId,
              },
            ],
          });
        },
      }
    );
  }, [
    memoizedCallFunction,
    dateFrom,
    dateTo,
    sourceItem,
    updateStatistics,
    statisticsForSource,
    statisticsCall,
    callStatus,
    callStatusError,
    datesChanged,
    sourceChanged,
  ]);

  return (
    <Container>
      <SourceHeader sourceItem={sourceItem} />
      {sourceItem?.type === 'timeseries' ? (
        <>
          <div>
            <div>
              <FunctionCall
                id={statisticsCall.functionId}
                callId={statisticsCall.callId}
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
        <Body>Statistics are currently unavailable for calculations</Body>
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
      <Title level={6}>Time Series</Title>
      <p style={{ display: 'flex' }}>
        <span style={{ paddingRight: 10 }}>
          <ColorCircle color={sourceItem?.color} />
        </span>
        {sourceItem?.name}
      </p>
    </div>
  );
};
