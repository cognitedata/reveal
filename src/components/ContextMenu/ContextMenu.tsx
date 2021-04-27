import { Button, Dropdown, Icon, Menu, toast, Tooltip } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import FunctionCall from 'components/FunctionCall';
import { useUpdateChart } from 'hooks/firebase';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import styled from 'styled-components/macro';
import { functionResponseKey, useCallFunction } from 'utils/cogniteFunctions';

type ContextMenuProps = {
  chart: Chart;
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
    value: 'metadata',
    label: 'Metadata',
  },
  {
    value: 'statistics',
    label: 'Statistics',
  },
];

const renderStatusIcon = (status?: FunctionCallStatus) => {
  switch (status) {
    case 'Running':
      return <Icon type="Loading" />;
    case 'Completed':
      return <Icon type="Check" />;
    case 'Failed':
    case 'Timeout':
      return <Icon type="Close" />;
    default:
      return null;
  }
};

export const ContextMenu = ({
  chart,
  visible,
  sourceItem,
  onClose,
}: ContextMenuProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string>('statistics');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleMenuClick = (value: string) => {
    setSelectedMenu(value);
    setShowDropdown(false);
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <div>
          <Tooltip content="Hide">
            <Button icon="Close" variant="ghost" onClick={onClose} />
          </Tooltip>
        </div>

        <div>
          <Dropdown
            visible={showDropdown}
            onClickOutside={() => setShowDropdown(false)}
            content={
              <Menu>
                {menuOptions.map(({ value, label }) => (
                  <Menu.Item key={value} onClick={() => handleMenuClick(value)}>
                    {label}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              icon="Down"
              iconPlacement="right"
            >
              {menuOptions.find(({ value }) => value === selectedMenu)?.label}
            </Button>
          </Dropdown>
        </div>
      </TopContainer>

      {selectedMenu === 'metadata' && <Metadata sourceItem={sourceItem} />}
      {selectedMenu === 'statistics' && (
        <Statistics chart={chart} sourceItem={sourceItem} />
      )}
    </Sidebar>
  );
};

const Metadata = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  return (
    <Container>
      <h3>Selected:</h3>
      <p style={{ display: 'flex' }}>
        <span style={{ paddingRight: 10 }}>
          <ColorCircle color={sourceItem?.color} />
        </span>
        {sourceItem?.name}
      </p>
    </Container>
  );
};

const Statistics = ({
  chart,
  sourceItem,
}: {
  chart: Chart;
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  const sdk = useSDK();
  const { mutate: callFunction } = useCallFunction('individual_calc-master');
  const { mutate } = useUpdateChart();

  const update = (diff: Partial<ChartWorkflow | ChartTimeSeries>) => {
    if (!sourceItem) {
      return;
    }

    mutate({
      ...chart,
      ...(sourceItem.type === 'timeseries'
        ? {
            timeSeriesCollection: chart.timeSeriesCollection?.map((ts) =>
              ts.id === sourceItem.id
                ? {
                    ...ts,
                    ...diff,
                  }
                : ts
            ),
          }
        : {}),
      ...(sourceItem.type === 'timeseries'
        ? {
            workflowCollection: chart.workflowCollection?.map((wf) =>
              wf.id === sourceItem.id
                ? {
                    ...wf,
                    ...diff,
                  }
                : wf
            ),
          }
        : {}),
    });
  };

  const handleCalculateStatistics = () => {
    callFunction(
      {
        data: {
          calculation_input: {
            timeseries: [
              {
                tag:
                  sourceItem?.type === 'timeseries'
                    ? (sourceItem as ChartTimeSeries).tsExternalId
                    : 'does-not-exist',
              },
            ],
            start_time: new Date(chart.dateFrom).getTime(),
            end_time: new Date(chart.dateTo).getTime(),
          },
        },
      },
      {
        onSuccess({ functionId, callId }) {
          update({
            statisticsCalls: [
              {
                callDate: Date.now(),
                functionId,
                callId,
              },
            ],
          });
        },
        onError() {
          toast.warn('Could not execute statistics calculation');
        },
      }
    );
  };

  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];

  const { data } = useQuery({
    queryKey: functionResponseKey(
      statisticsCall?.functionId,
      statisticsCall?.callId
    ),
    queryFn: (): Promise<string | undefined> =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${statisticsCall.functionId}/calls/${statisticsCall.callId}/response`
        )
        .then((r) => r.data.response),
    retry: 1,
    retryDelay: 1000,
    enabled: !!statisticsCall,
  });

  const { results } = (data as any) || {};
  const { statistics = [] } = (results as StatisticsResult) || {};
  const statisticsForSource = statistics[0];

  return (
    <Container>
      <h3>Selected:</h3>
      <p style={{ display: 'flex' }}>
        <span style={{ paddingRight: 10 }}>
          <ColorCircle color={sourceItem?.color} />
        </span>
        {sourceItem?.name}
      </p>
      {sourceItem?.type === 'timeseries' ? (
        <>
          <h3>Min:</h3>
          <p>{statisticsForSource ? statisticsForSource.min : '-'}</p>
          <h3>Max:</h3>
          <p>{statisticsForSource ? statisticsForSource.max : '-'}</p>
          <h3>Mean:</h3>
          <p>{statisticsForSource ? statisticsForSource.mean : '-'}</p>
          <h3>Median:</h3>
          <p>{statisticsForSource ? statisticsForSource.median : '-'}</p>
          <h3>Standard Deviation:</h3>
          <p>{statisticsForSource ? statisticsForSource.std : '-'}</p>
          <h3>25th Percentile:</h3>
          <p>{statisticsForSource ? statisticsForSource.q25 : '-'}</p>
          <h3>50th Percentile:</h3>
          <p>{statisticsForSource ? statisticsForSource.q50 : '-'}</p>
          <h3>75th Percentile:</h3>
          <p>{statisticsForSource ? statisticsForSource.q75 : '-'}</p>
          <h3>Skewness:</h3>
          <p>{statisticsForSource ? statisticsForSource.q25 : '-'}</p>
          <h3>Kurtosis:</h3>
          <p>{statisticsForSource ? statisticsForSource.kurtosis : '-'}</p>
          {statisticsCall && (
            <FunctionCall
              id={statisticsCall.functionId}
              callId={statisticsCall.callId}
              renderLoading={() => renderStatusIcon('Running')}
              renderCall={({ status }) => renderStatusIcon(status)}
            />
          )}
          <Button
            style={{ marginLeft: 10 }}
            onClick={() => handleCalculateStatistics()}
          >
            Refresh
          </Button>
        </>
      ) : (
        <p>(currently unavailable for calculations)</p>
      )}
    </Container>
  );
};

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColorCircle = styled.span`
  display: inline-block;
  background-color: ${(props) => props.color};
  width: 20px;
  height: 20px;
`;

const Sidebar = styled.div<{ visible?: boolean }>`
  border-left: 1px solid var(--cogs-greyscale-grey4);
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  width: ${(props) => (props.visible ? '400px' : 0)};
  transition: 0s linear 200ms, width 200ms ease;
`;

const Container = styled.div`
  padding: 20px;
`;
