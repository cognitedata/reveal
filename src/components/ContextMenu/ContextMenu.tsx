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
import { calculateGranularity } from 'utils/timeseries';

type ContextMenuProps = {
  chart: Chart;
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  onClose: () => void;
  visible?: boolean;
};

type Statistics = {
  min: number;
  max: number;
  average: number;
  mean: number;
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
  const [selectedMenu, setSelectedMenu] = useState<string>('metadata');
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
      <h3>Name:</h3>
      <p>{sourceItem?.name}</p>
      <h3>Color:</h3>
      <p>
        <ColorCircle color={sourceItem?.color} />
      </p>
      <h3>Line style:</h3>
      <p>{sourceItem?.lineStyle}</p>
      <h3>Line weight:</h3>
      <p>{sourceItem?.lineWeight}</p>
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
  const { mutateAsync } = useUpdateChart();

  const update = (diff: Partial<ChartWorkflow | ChartTimeSeries>) => {
    if (!sourceItem) {
      return;
    }

    mutateAsync({
      chart: {
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
      },
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
            start_time: chart.dateFrom,
            end_time: chart.dateTo,
            granularity: calculateGranularity(
              [
                new Date(chart.dateFrom).getTime(),
                new Date(chart.dateTo).getTime(),
              ],
              1000
            ),
            aggregate: 'average',
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

  const statistics = (data as any) as Statistics;

  return (
    <Container>
      <h3>Type:</h3>
      <p>{sourceItem?.type}</p>
      <h3>Name:</h3>
      <p>{sourceItem?.name}</p>
      {statistics && (
        <>
          <h3>Average:</h3>
          <p>{statistics.average}</p>
          <h3>Min:</h3>
          <p>{statistics.min}</p>
          <h3>Max:</h3>
          <p>{statistics.max}</p>
          <h3>Mean:</h3>
          <p>{statistics.mean}</p>
        </>
      )}
      {statisticsCall && (
        <FunctionCall
          id={statisticsCall.functionId}
          callId={statisticsCall.callId}
          renderLoading={() => renderStatusIcon('Running')}
          renderCall={({ status }) => renderStatusIcon(status)}
        />
      )}
      <button type="button" onClick={() => handleCalculateStatistics()}>
        Refresh
      </button>
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
  width: ${(props) => (props.visible ? '400px' : 0)};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;

const Container = styled.div`
  padding: 20px;
`;
