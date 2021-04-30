import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useSDK } from '@cognite/sdk-provider';
import { useIsFetching, useQueryClient, useQuery } from 'react-query';
import {
  Chart,
  ChartTimeSeries,
  FunctionCallStatus,
} from 'reducers/charts/types';
import {
  AllIconTypes,
  Button,
  Dropdown,
  Icon,
  Menu,
  Tooltip,
  Popconfirm,
  Flex,
  toast,
} from '@cognite/cogs.js';
import { units } from 'utils/units';
import { calculateGranularity } from 'utils/timeseries';
import { removeTimeseries, updateTimeseries } from 'utils/charts';
import { useLinkedAsset } from 'hooks/api';
import EditableText from 'components/EditableText';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import { functionResponseKey, useCallFunction } from 'utils/cogniteFunctions';
import FunctionCall from 'components/FunctionCall';
import { CogniteClient } from '@cognite/sdk';
import {
  SourceItem,
  SourceCircle,
  SourceName,
  SourceRow,
  UnitMenuAside,
  UnitMenuHeader,
} from './elements';
// import TimeSeriesMenu from './TimeSeriesMenu';
import { StatisticsResult } from '../../components/ContextMenu';

const key = ['functions', 'individual_calc'];

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

const getCallStatus = (
  sdk: CogniteClient,
  fnId: number,
  callId: number
) => async () => {
  const response = await sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${fnId}/calls/${callId}`
    )
    .then((r) => r?.data);

  if (response?.status) {
    return response.status as FunctionCallStatus;
  }
  return Promise.reject(new Error('could not find call status'));
};

type LoadingProps = {
  tsId: number;
  dateFrom: string;
  dateTo: string;
};

const LoadingFeedback = ({ tsId, dateFrom, dateTo }: LoadingProps) => {
  const queryCache = useQueryClient();
  const cacheKey = [
    'timeseries',
    {
      items: [{ id: tsId }],
      start: new Date(dateFrom),
      end: new Date(dateTo),
      limit: 1000,
      aggregates: ['average'],
      granularity: calculateGranularity(
        [new Date(dateFrom).getTime(), new Date(dateTo).getTime()],
        1000
      ),
    },
  ];
  const queryState = queryCache.getQueryState(cacheKey);
  const isFetching = useIsFetching(cacheKey);

  const getStatus = (): AllIconTypes | undefined => {
    if (isFetching) {
      return 'Loading';
    }
    switch (queryState?.status) {
      case 'error':
        return 'Close';
      case 'success':
        return 'Check';
      default:
        return undefined;
    }
  };
  const status = getStatus();
  const updated = queryState?.errorUpdatedAt || queryState?.dataUpdatedAt;

  if (!status) {
    return null;
  }

  if (updated) {
    return (
      <Tooltip
        placement="right"
        content={`Updated ${dayjs(updated).format('YYYY-MM-DD hh:mm Z')}`}
      >
        <Icon style={{ marginRight: 10 }} type={status} />
      </Tooltip>
    );
  }
  return <Icon style={{ marginRight: 10 }} type={status} />;
};

type Props = {
  mutate: (c: Chart) => void;
  chart: Chart;
  timeseries: ChartTimeSeries;
  disabled?: boolean;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  isWorkspaceMode?: boolean;
  isFileViewerMode?: boolean;
};
export default function TimeSeriesRow({
  mutate,
  chart,
  timeseries,
  onRowClick = () => {},
  onInfoClick = () => {},
  disabled = false,
  isSelected = false,
  isWorkspaceMode = false,
  isFileViewerMode = false,
}: Props) {
  const sdk = useSDK();
  const {
    id,
    description,
    name,
    unit,
    preferredUnit,
    originalUnit,
    enabled,
    color,
    tsId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Increasing this will cause a fresh render where the dropdown is closed
  const update = (_tsId: string, diff: Partial<ChartTimeSeries>) =>
    mutate({
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.map((t) =>
        t.id === _tsId
          ? {
              ...t,
              ...diff,
            }
          : t
      ),
    });

  const inputUnitOption = units.find(
    (unitOption) => unitOption.value === unit?.toLowerCase()
  );

  const preferredUnitOption = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );

  const unitConversionOptions = inputUnitOption?.conversions?.map(
    (conversion) => units.find((unitOption) => unitOption.value === conversion)
  );

  const unitOverrideMenuItems = units.map((unitOption) => (
    <Menu.Item
      key={unitOption.value}
      onClick={() =>
        update(id, {
          unit: unitOption.value,
        })
      }
      style={
        unit?.toLowerCase() === unitOption.value
          ? {
              color: 'var(--cogs-midblue-3)',
              backgroundColor: 'var(--cogs-midblue-6)',
              borderRadius: 3,
            }
          : {}
      }
    >
      {unitOption.label}
      {originalUnit?.toLowerCase() === unitOption.value && ' (original)'}
    </Menu.Item>
  ));

  const unitConversionMenuItems = unitConversionOptions?.map((unitOption) => (
    <Menu.Item
      key={unitOption?.value}
      onClick={() =>
        update(id, {
          preferredUnit: unitOption?.value,
        })
      }
      style={
        preferredUnit?.toLowerCase() === unitOption?.value
          ? {
              color: 'var(--cogs-midblue-3)',
              backgroundColor: 'var(--cogs-midblue-6)',
              borderRadius: 3,
            }
          : {}
      }
    >
      {unitOption?.label}
    </Menu.Item>
  ));

  const remove = () => mutate(removeTimeseries(chart, id));

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate(updateTimeseries(chart, id, diff));

  const statisticsCall = (timeseries?.statisticsCalls || [])[0];

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

  const { data: callStatus, error: callStatusError } = useQuery<
    FunctionCallStatus
  >(
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

  const { data: linkedAsset } = useLinkedAsset(tsId, true);

  const { mutate: callFunction } = useCallFunction('individual_calc-master');

  const updateStatistics = useCallback(
    (diff: Partial<ChartTimeSeries>) => {
      if (!timeseries) {
        return;
      }
      mutate({
        ...chart,
        timeSeriesCollection: chart.timeSeriesCollection?.map((ts) =>
          ts.id === timeseries.id
            ? {
                ...ts,
                ...diff,
              }
            : ts
        ),
      });
    },
    [chart, mutate, timeseries]
  );

  useEffect(() => {
    if (statisticsForSource) {
      return;
    }

    if (statisticsCall && !callStatusError) {
      return;
    }

    callFunction(
      {
        data: {
          calculation_input: {
            timeseries: [
              {
                tag: (timeseries as ChartTimeSeries).tsExternalId,
              },
            ],
            start_time: new Date(chart.dateFrom).getTime(),
            end_time: new Date(chart.dateTo).getTime(),
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
        onError() {
          toast.warn('Could not execute statistics calculation');
        },
      }
    );
  }, [
    callFunction,
    chart.dateFrom,
    chart.dateTo,
    timeseries,
    updateStatistics,
    statisticsForSource,
    statisticsCall,
    callStatus,
    callStatusError,
  ]);

  return (
    <SourceRow
      key={id}
      onClick={() => !disabled && onRowClick(id)}
      isActive={isSelected}
    >
      <td>
        <SourceItem isDisabled={disabled} key={id}>
          <SourceCircle
            onClick={(event) => {
              event.stopPropagation();
              update(id, {
                enabled: !enabled,
              });
            }}
            color={color}
            fade={!enabled}
          />
          <LoadingFeedback
            tsId={tsId}
            dateFrom={chart.dateFrom}
            dateTo={chart.dateTo}
          />
          <SourceName title={name}>
            {!isFileViewerMode && (
              <EditableText
                value={name || 'noname'}
                onChange={(value) => {
                  update(id, { name: value });
                  setIsEditingName(false);
                }}
                onCancel={() => setIsEditingName(false)}
                editing={isEditingName}
                hideButtons
              />
            )}
            {isFileViewerMode && name}
          </SourceName>
        </SourceItem>
      </td>
      {(isWorkspaceMode || isFileViewerMode) && (
        <>
          <td>
            <SourceItem>
              <SourceName>{description}</SourceName>
            </SourceItem>
          </td>
          <td>{linkedAsset?.name}</td>
        </>
      )}
      {isWorkspaceMode && (
        <>
          <td>{statisticsForSource?.min}</td>
          <td>
            {statisticsForSource
              ? statisticsForSource?.max
              : statisticsCall && (
                  <FunctionCall
                    id={statisticsCall.functionId}
                    callId={statisticsCall.callId}
                    renderLoading={() => renderStatusIcon('Running')}
                    renderCall={({ status }) => renderStatusIcon(status)}
                  />
                )}
          </td>
          <td>{statisticsForSource?.median}</td>
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <Dropdown
              content={
                <Menu>
                  <Flex direction="row">
                    <div>
                      <Menu.Header>
                        <UnitMenuHeader>Input</UnitMenuHeader>
                      </Menu.Header>
                      {unitOverrideMenuItems}
                    </div>
                    <UnitMenuAside>
                      <Menu.Header>
                        <UnitMenuHeader>Output</UnitMenuHeader>
                      </Menu.Header>
                      {unitConversionMenuItems}
                    </UnitMenuAside>
                  </Flex>
                </Menu>
              }
            >
              <Button
                icon="Down"
                type="tertiary"
                iconPlacement="right"
                style={{ height: 28 }}
              >
                {preferredUnitOption?.label}
                {inputUnitOption?.value !== originalUnit?.toLowerCase() && ' *'}
              </Button>
            </Dropdown>
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td style={{ textAlign: 'center', paddingLeft: 0 }}>
          <PnidButton
            timeseriesId={tsId}
            showTooltip={false}
            hideWhenEmpty={false}
          />
        </td>
      )}
      {isWorkspaceMode && (
        <td style={{ textAlign: 'center', paddingLeft: 0 }}>
          <Dropdown content={<AppearanceDropdown update={updateAppearance} />}>
            <Button
              type="tertiary"
              icon="Timeseries"
              style={{ height: 28 }}
              aria-label="timeseries"
            />
          </Dropdown>
        </td>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td style={{ textAlign: 'center', paddingLeft: 0 }}>
          <Popconfirm
            onConfirm={() => remove()}
            content={
              <div style={{ textAlign: 'left' }}>
                Are you sure that you want to
                <br /> remove this Time Series?
              </div>
            }
          >
            <Button
              type="tertiary"
              icon="Delete"
              style={{ height: 28 }}
              aria-label="delete"
            />
          </Popconfirm>
        </td>
      )}
      {isWorkspaceMode && (
        <>
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            <Button
              type="tertiary"
              icon="Info"
              onClick={(event) => {
                if (isSelected) {
                  event.stopPropagation();
                }
                onInfoClick(id);
              }}
              style={{ height: 28 }}
              aria-label="info"
            />
          </td>
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            {!isFileViewerMode && (
              // <Dropdown content={<TimeSeriesMenu chartId={chart.id} id={id} />}>
              <Button
                type="tertiary"
                icon="MoreOverflowEllipsisHorizontal"
                style={{ height: 28 }}
                disabled
                aria-label="more"
              />
              // </Dropdown>
            )}
          </td>
        </>
      )}
    </SourceRow>
  );
}
