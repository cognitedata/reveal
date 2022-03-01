import { useCallback, useEffect, useState } from 'react';
import { Chart, ChartTimeSeries } from 'models/chart/types';
import { Button, Dropdown, Tooltip, Popconfirm } from '@cognite/cogs.js';
import { removeTimeseries, updateTimeseries } from 'models/chart/updates';
import { useLinkedAsset } from 'hooks/cdf-assets';
import AppearanceDropdown from 'components/AppearanceDropdown/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import UnitDropdown from 'components/UnitDropdown/UnitDropdown';
import { trackUsage } from 'services/metrics';
import { formatValueForDisplay } from 'utils/numbers';
import { getUnitConverter } from 'utils/units';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useRecoilState, useRecoilValue } from 'recoil';
import { timeseriesSummaryById } from 'models/timeseries/selectors';
import flow from 'lodash/flow';
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
import { StyleButton } from 'components/StyleButton/StyleButton';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import {
  SourceItem,
  SourceName,
  SourceRow,
  SourceDescription,
  SourceTag,
  SourceStatus,
  StyledStatusIcon,
} from './elements';

type Props = {
  mutate: (update: (c: Chart | undefined) => Chart) => void;
  timeseries: ChartTimeSeries;
  disabled?: boolean;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  isWorkspaceMode?: boolean;
  isFileViewerMode?: boolean;
  provided?: DraggableProvided | undefined;
  draggable?: boolean;
  dateFrom?: string;
  dateTo?: string;
  translations: typeof defaultTranslations;
};

/**
 * Timeseries translations
 */
const defaultTranslations = makeDefaultTranslations(
  'Remove',
  'Cancel',
  'Remove this time series?'
);

function TimeSeriesRow({
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
  dateFrom,
  dateTo,
  translations,
}: Props) {
  const {
    id,
    description,
    name,
    unit,
    color = '',
    lineStyle = 'none',
    lineWeight = 1,
    preferredUnit,
    originalUnit,
    enabled,
    tsExternalId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [, setLocalTimeseries] = useRecoilState(timeseriesAtom);
  const sdk = useSDK();

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const update = useCallback(
    (_tsId: string, diff: Partial<ChartTimeSeries>) =>
      mutate((oldChart) => ({
        ...oldChart!,
        timeSeriesCollection: oldChart!.timeSeriesCollection?.map((ts) =>
          ts.id === _tsId
            ? {
                ...ts,
                ...diff,
              }
            : ts
        ),
      })),
    [mutate]
  );

  const remove = () => mutate((oldChart) => removeTimeseries(oldChart!, id));

  const handleUpdateAppearance = (diff: Partial<ChartTimeSeries>) =>
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
      enabled: !!timeseries.tsExternalId,
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

  /**
   * Unit Dropdown translations
   */
  const { t: unitDropdownTranslations } = useTranslations(
    UnitDropdown.translationKeys,
    'UnitDropdown'
  );
  /**
   * Apperance Dropdown translations
   */
  const { t: appearanceDropdownTranslations } = useTranslations(
    AppearanceDropdown.translationKeys,
    'AppearanceDropdown'
  );

  const { data: linkedAsset } = useLinkedAsset(tsExternalId, true);
  const summary = useRecoilValue(timeseriesSummaryById(tsExternalId));
  const convertUnit = getUnitConverter(unit, preferredUnit);

  const handleStatusIconClick = useCallback(
    (event) => {
      event.stopPropagation();
      update(id, {
        enabled: !enabled,
      });
    },
    [enabled, id, update]
  );

  const isVisible = enabled || isFileViewerMode;

  return (
    <SourceRow
      aria-hidden={!isVisible}
      aria-selected={isSelected}
      key={id}
      onClick={() => !disabled && onRowClick(id)}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <td
        style={{ textAlign: 'center', paddingLeft: 0 }}
        className="downloadChartHide"
      >
        <Dropdown
          disabled={!isVisible}
          content={
            <AppearanceDropdown
              selectedColor={color}
              selectedLineStyle={lineStyle}
              selectedLineWeight={lineWeight}
              onUpdate={handleUpdateAppearance}
              translations={appearanceDropdownTranslations}
            />
          }
        >
          <StyleButton
            disabled={!isVisible}
            styleType="Timeseries"
            styleColor={color}
            label="Timeseries"
          />
        </Dropdown>
      </td>
      <td>
        <SourceItem disabled={!isVisible} key={id}>
          {!isFileViewerMode && (
            <SourceStatus onClick={handleStatusIconClick}>
              <StyledStatusIcon
                type={isVisible ? 'EyeShow' : 'EyeHide'}
                title="Toggle visibility"
              />
            </SourceStatus>
          )}
          <SourceName title={name}>
            {!isFileViewerMode && (
              <TranslatedEditableText
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
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              <SourceTag>{linkedAsset?.name}</SourceTag>
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              <SourceDescription>
                <Tooltip content={description} maxWidth={350}>
                  <>{description}</>
                </Tooltip>
              </SourceDescription>
            </SourceItem>
          </td>
        </>
      )}
      {isWorkspaceMode && (
        <>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.min))}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.max))}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.mean))}
            </SourceItem>
          </td>
          <td className="col-unit">
            <UnitDropdown
              unit={unit}
              originalUnit={originalUnit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
              translations={unitDropdownTranslations}
            />
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide col-action"
        >
          <PnidButton
            timeseriesExternalId={tsExternalId}
            hideWhenEmpty={false}
          />
        </td>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide col-action"
        >
          <Popconfirm
            onConfirm={remove}
            okText={translations.Remove}
            cancelText={translations.Cancel}
            content={
              <div style={{ textAlign: 'left' }}>
                {translations['Remove this time series?']}
              </div>
            }
          >
            <Button
              type="ghost"
              icon="Delete"
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
            className="downloadChartHide col-action"
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
            className="downloadChartHide col-action"
          />
        </>
      )}
    </SourceRow>
  );
}

TimeSeriesRow.translationKeys = Object.keys(defaultTranslations);

export default TimeSeriesRow;
