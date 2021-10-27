import { useEffect, useState } from 'react';
import { Chart, ChartTimeSeries } from 'models/chart/types';
import { Button, Dropdown, Tooltip, Popconfirm } from '@cognite/cogs.js';
import { removeTimeseries, updateTimeseries } from 'models/chart/updates';
import { useLinkedAsset } from 'hooks/cdf-assets';
import EditableText from 'components/EditableText';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import { UnitDropdown } from 'components/UnitDropdown';
import { trackUsage } from 'services/metrics';
import { formatValueForDisplay } from 'utils/numbers';
import { getUnitConverter } from 'utils/units';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useRecoilState, useRecoilValue } from 'recoil';
import { timeseriesSummaryById } from 'models/timeseries/selectors';
import flow from 'lodash/flow';
import { chartAtom } from 'models/chart/atom';
import { isEqual } from 'lodash';
import { useDebounce } from 'use-debounce';
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import { calculateGranularity } from 'utils/timeseries';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DatapointsMultiQuery,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { timeseriesAtom } from 'models/timeseries/atom';
import {
  SourceItem,
  SourceCircle,
  SourceName,
  SourceRow,
  SourceDescription,
  SourceTag,
} from './elements';

type Props = {
  mutate: (update: (c: Chart | undefined) => Chart) => void;
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
  timeseries,
  onRowClick = () => {},
  onInfoClick = () => {},
  disabled = false,
  isSelected = false,
  isWorkspaceMode = false,
  isFileViewerMode = false,
  draggable = false,
  provided = undefined,
}: Props) {
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
  const [chart] = useRecoilState(chartAtom);
  const [, setLocalTimeseries] = useRecoilState(timeseriesAtom);
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;
  const sdk = useSDK();

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const update = (_tsId: string, diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => ({
      ...oldChart!,
      timeSeriesCollection: oldChart!.timeSeriesCollection?.map((t) =>
        t.id === _tsId
          ? {
              ...t,
              ...diff,
            }
          : t
      ),
    }));

  const remove = () => mutate((oldChart) => removeTimeseries(oldChart!, id));

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => updateTimeseries(oldChart!, id, diff));

  const updateUnit = async (unitOption: any) => {
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;
    const nextInputUnit = unitOption?.value;

    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];

    const convert = flow(
      getUnitConverter(currentOutputUnit, currentInputUnit),
      getUnitConverter(nextInputUnit, currentOutputUnit)
    );

    const range =
      typeof min === 'number' && typeof max === 'number'
        ? [convert(min), convert(max)]
        : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      unit: unitOption.value,
      range,
    });
  };

  const updatePrefferedUnit = async (unitOption: any) => {
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;
    const nextOutputUnit = unitOption?.value;

    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];

    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const convert = flow(
      getUnitConverter(currentOutputUnit, currentInputUnit),
      getUnitConverter(currentInputUnit, nextOutputUnit)
    );

    const range = hasValidRange ? [convert(min!), convert(max!)] : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      preferredUnit: unitOption?.value,
      range,
    });
  };

  const resetUnit = async () => {
    const currentInputUnit = timeseries.unit;
    const currentOutputUnit = timeseries.preferredUnit;
    const min = timeseries.range?.[0];
    const max = timeseries.range?.[1];
    const convertUnit = getUnitConverter(currentOutputUnit, currentInputUnit);
    const range =
      typeof min === 'number' && typeof max === 'number'
        ? [convertUnit(min), convertUnit(max)]
        : [];

    /**
     * Update units and corresponding converted range
     */
    update(id, {
      unit: originalUnit,
      preferredUnit: originalUnit,
      range,
    });
  };

  const query: DatapointsMultiQuery = {
    items: [{ externalId: tsExternalId || '' }],
    start: dayjs(debouncedRange.dateFrom!).toDate(),
    end: dayjs(debouncedRange.dateTo!).toDate(),
    granularity: calculateGranularity(
      [
        dayjs(debouncedRange.dateFrom!).valueOf(),
        dayjs(debouncedRange.dateTo!).valueOf(),
      ],
      CHART_POINTS_PER_SERIES
    ),
    aggregates: ['average', 'min', 'max', 'count', 'sum'],
    limit: CHART_POINTS_PER_SERIES,
  };

  const {
    data: timeseriesData,
    isFetching,
    isSuccess,
  } = useQuery(
    ['chart-data', 'timeseries', timeseries.tsExternalId, query],
    () => {
      return sdk.datapoints
        .retrieve(query)
        .then((r: DatapointAggregates[] | Datapoints[]) => {
          const RAW_DATA_POINTS_THRESHOLD = CHART_POINTS_PER_SERIES / 2;

          const aggregatedCount = (
            r[0]?.datapoints as DatapointAggregate[]
          ).reduce((point: number, c: DatapointAggregate) => {
            return point + (c.count || 0);
          }, 0);

          const isRaw = aggregatedCount < RAW_DATA_POINTS_THRESHOLD;

          return isRaw
            ? sdk.datapoints.retrieve({
                ...query,
                granularity: undefined,
                aggregates: undefined,
                includeOutsidePoints: true,
              } as DatapointsMultiQuery)
            : r;
        })
        .then((r) => r[0]);
    },
    {
      enabled: !!timeseries.tsExternalId && timeseries.enabled,
    }
  );

  useEffect(() => {
    setLocalTimeseries((timeseriesCollection) => {
      const existingEntry = timeseriesCollection.find(
        (entry) => entry.externalId === timeseries.tsExternalId
      );

      const output = timeseriesCollection
        .filter((entry) => entry.externalId !== timeseries.tsExternalId)
        .concat({
          externalId: timeseries.tsExternalId || '',
          loading: isFetching,
          series: isSuccess ? timeseriesData : existingEntry?.series,
        });

      return output;
    });
  }, [
    isSuccess,
    isFetching,
    timeseriesData,
    setLocalTimeseries,
    timeseries.id,
    timeseries.tsExternalId,
  ]);

  const { data: linkedAsset } = useLinkedAsset(tsExternalId, true);
  const summary = useRecoilValue(timeseriesSummaryById(tsExternalId));
  const convertUnit = getUnitConverter(unit, preferredUnit);

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
          <td>{formatValueForDisplay(convertUnit(summary?.min))}</td>
          <td>{formatValueForDisplay(convertUnit(summary?.max))}</td>
          <td>{formatValueForDisplay(convertUnit(summary?.mean))}</td>
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <UnitDropdown
              unit={unit}
              originalUnit={originalUnit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
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
            onConfirm={remove}
            okText="Remove"
            content={
              <div style={{ textAlign: 'left' }}>Remove this time series?</div>
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
