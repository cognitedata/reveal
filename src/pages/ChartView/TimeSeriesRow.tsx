import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useIsFetching, useQueryClient, useQuery } from 'react-query';
import {
  Chart,
  ChartTimeSeries,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { useDebounce } from 'use-debounce';
import {
  AllIconTypes,
  Button,
  Dropdown,
  Icon,
  Tooltip,
  Popconfirm,
} from '@cognite/cogs.js';
import { calculateGranularity } from 'utils/timeseries';
import { removeTimeseries, updateTimeseries } from 'utils/charts';
import { useLinkedAsset } from 'hooks/api';
import { usePrevious } from 'hooks/usePrevious';
import EditableText from 'components/EditableText';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import { functionResponseKey, useCallFunction } from 'utils/backendService';
import FunctionCall from 'components/FunctionCall';
import { StatisticsResult } from 'components/DetailsSidebar';
import { UnitDropdown } from 'components/UnitDropdown';
import * as backendApi from 'utils/backendApi';
import { trackUsage } from 'utils/metrics';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { calculateDefaultYAxis } from 'utils/axis';
import { convertValue } from 'utils/units';
import { DraggableProvided } from 'react-beautiful-dnd';
import { isEqual } from 'lodash';
import {
  SourceItem,
  SourceCircle,
  SourceName,
  SourceRow,
  SourceDescription,
  SourceTag,
} from './elements';
// import TimeSeriesMenu from './TimeSeriesMenu';

const key = ['functions', 'individual_calc'];

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

const getCallStatus =
  (sdk: CogniteClient, fnId: number, callId: number) => async () => {
    const response = await backendApi.getCallStatus(sdk, fnId, callId);

    if (response?.status) {
      return response.status as FunctionCallStatus;
    }
    return Promise.reject(new Error('could not find call status'));
  };

type LoadingProps = {
  tsExternalId?: string;
  dateFrom: string;
  dateTo: string;
};

const LoadingFeedback = ({ tsExternalId, dateFrom, dateTo }: LoadingProps) => {
  const queryCache = useQueryClient();
  const cacheKey = [
    'timeseries',
    {
      items: [{ externalId: tsExternalId }],
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
  dateFrom: string;
  provided?: DraggableProvided | undefined;
  dateTo: string;
  draggable?: boolean;
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
  dateFrom,
  dateTo,
  draggable = false,
  provided = undefined,
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
    tsExternalId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  /**
   * Using strings to avoid custom equality check
   */
  const datesAsString = JSON.stringify({ dateFrom, dateTo });
  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

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

  const remove = () => mutate(removeTimeseries(chart, id));

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate(updateTimeseries(chart, id, diff));

  const updateUnit = async (unitOption: any) => {
    const range = await calculateDefaultYAxis({
      chart,
      sdk,
      timeSeriesExternalId: timeseries.tsExternalId || '',
      inputUnit: unitOption?.value,
      outputUnit: preferredUnit,
    });
    update(id, {
      unit: unitOption.value,
      range,
    });
  };

  const updatePrefferedUnit = async (unitOption: any) => {
    const range = await calculateDefaultYAxis({
      chart,
      sdk,
      timeSeriesExternalId: timeseries.tsExternalId || '',
      inputUnit: unit,
      outputUnit: unitOption?.value,
    });
    update(id, {
      preferredUnit: unitOption?.value,
      range,
    });
  };

  const statisticsCall = (timeseries?.statisticsCalls || [])[0];

  const { data } = useQuery({
    queryKey: functionResponseKey(
      statisticsCall?.functionId,
      statisticsCall?.callId
    ),
    queryFn: (): Promise<string | undefined> =>
      backendApi.getCallResponse(
        sdk,
        statisticsCall?.functionId,
        statisticsCall?.callId
      ),
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

  const { data: linkedAsset } = useLinkedAsset(tsExternalId, true);
  const { mutate: callFunction } = useCallFunction('individual_calc-master');
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

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

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (!datesChanged) {
      if (statisticsForSource) {
        return;
      }
      if (statisticsCall && !callStatusError) {
        return;
      }
    }

    memoizedCallFunction(
      {
        data: {
          calculation_input: {
            timeseries: [
              {
                tag: (timeseries as ChartTimeSeries).tsExternalId,
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
    timeseries,
    updateStatistics,
    statisticsForSource,
    statisticsCall,
    callStatus,
    callStatusError,
    datesChanged,
  ]);

  return (
    <SourceRow
      key={id}
      onClick={() => !disabled && onRowClick(id)}
      className={isSelected ? 'active' : undefined}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
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
            tsExternalId={tsExternalId}
            dateFrom={chart.dateFrom}
            dateTo={chart.dateTo}
          />
          <SourceName title={name}>
            {!isFileViewerMode && (
              <EditableText
                value={name || 'noname'}
                onChange={(value) => {
                  update(id, { name: value });
                  trackUsage('ChartView.RenameTimeSeries');
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
              <SourceDescription>
                <Tooltip content={description}>
                  <>{description}</>
                </Tooltip>
              </SourceDescription>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceTag>{linkedAsset?.name}</SourceTag>
            </SourceItem>
          </td>
        </>
      )}
      {isWorkspaceMode && (
        <>
          <td>
            {statisticsForSource
              ? convertValue(statisticsForSource?.min, unit, preferredUnit)
              : ''}
          </td>
          <td>
            {statisticsForSource
              ? convertValue(statisticsForSource?.max, unit, preferredUnit)
              : statisticsCall && (
                  <FunctionCall
                    id={statisticsCall.functionId}
                    callId={statisticsCall.callId}
                    renderLoading={() => renderStatusIcon('Running')}
                    renderCall={({ status }) => renderStatusIcon(status)}
                  />
                )}
          </td>
          <td>
            {statisticsForSource
              ? convertValue(statisticsForSource?.median, unit, preferredUnit)
              : ''}
          </td>
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <UnitDropdown
              unit={unit}
              originalUnit={originalUnit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
            />
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <PnidButton
            timeseriesExternalId={tsExternalId}
            showTooltip={false}
            hideWhenEmpty={false}
          />
        </td>
      )}
      {isWorkspaceMode && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <Dropdown content={<AppearanceDropdown update={updateAppearance} />}>
            <Button
              type="ghost"
              icon="ResourceTimeseries"
              style={{ height: 28 }}
              aria-label="timeseries"
            />
          </Dropdown>
        </td>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <Popconfirm
            onConfirm={() => remove()}
            content={
              <div style={{ textAlign: 'left' }}>
                Are you sure that you want to
                <br /> remove this time series?
              </div>
            }
          >
            <Button
              type="ghost"
              icon="Trash"
              style={{ height: 28 }}
              aria-label="delete"
            />
          </Popconfirm>
        </td>
      )}
      {isWorkspaceMode && (
        <>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Button
              type="ghost"
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
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            {!isFileViewerMode && (
              // <Dropdown content={<TimeSeriesMenu chartId={chart.id} id={id} />}>
              <Button
                type="ghost"
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
