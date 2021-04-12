import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useIsFetching, useQueryClient } from 'react-query';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import {
  AllIconTypes,
  Button,
  Dropdown,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { units } from 'utils/units';
import { calculateGranularity } from 'utils/timeseries';
import EditableText from 'components/EditableText';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import {
  SourceItem,
  SourceCircle,
  SourceMenu,
  SourceName,
  SourceRow,
} from './elements';
import TimeSeriesMenu from './TimeSeriesMenu';

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
    tsExternalId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Increasing this will cause a fresh render where the dropdown is closed
  const [idHack, setIdHack] = useState(0);
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
    >
      {unitOption.label}
      {unit?.toLowerCase() === unitOption.value && ' (selected)'}
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
    >
      {unitOption?.label}{' '}
      {preferredUnit?.toLowerCase() === unitOption?.value && ' (selected)'}
    </Menu.Item>
  ));

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
          {!isFileViewerMode && (
            <SourceMenu onClick={(e) => e.stopPropagation()} key={idHack}>
              <Dropdown
                content={
                  <TimeSeriesMenu
                    chartId={chart.id}
                    id={id}
                    closeMenu={() => setIdHack(idHack + 1)}
                    startRenaming={() => setIsEditingName(true)}
                  />
                }
              >
                <Icon type="VerticalEllipsis" />
              </Dropdown>
            </SourceMenu>
          )}
        </SourceItem>
      </td>
      {isWorkspaceMode && (
        <>
          <td>
            <div role="none" onClick={(event) => event.stopPropagation()}>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Header>
                      <span style={{ wordBreak: 'break-word' }}>
                        Select input unit (override)
                      </span>
                    </Menu.Header>
                    {unitOverrideMenuItems}
                  </Menu>
                }
              >
                <SourceItem>
                  <SourceName>
                    {inputUnitOption?.label}
                    {inputUnitOption?.value !== originalUnit?.toLowerCase() &&
                      ' *'}
                  </SourceName>
                </SourceItem>
              </Dropdown>
            </div>
          </td>
          <td>
            <div role="none" onClick={(event) => event.stopPropagation()}>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Header>
                      <span style={{ wordBreak: 'break-word' }}>
                        Select preferred unit
                      </span>
                    </Menu.Header>
                    {unitConversionMenuItems}
                  </Menu>
                }
              >
                <SourceItem>
                  <SourceName>{preferredUnitOption?.label}</SourceName>
                </SourceItem>
              </Dropdown>
            </div>
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <>
          <td>
            <SourceItem>
              <SourceName>
                {tsExternalId ? `${tsExternalId} (${tsId})` : tsId}
              </SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>{description}</SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>
                <PnidButton
                  timeseriesId={tsId}
                  showTooltip={false}
                  hideWhenEmpty={false}
                />
              </SourceName>
            </SourceItem>
          </td>
        </>
      )}
      {isWorkspaceMode && (
        <>
          <td>
            <SourceItem>
              <SourceName>
                <Button
                  variant="ghost"
                  icon="Info"
                  onClick={(event) => {
                    if (isSelected) {
                      event.stopPropagation();
                    }
                    onInfoClick(id);
                  }}
                />
              </SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName />
            </SourceItem>
          </td>
        </>
      )}
    </SourceRow>
  );
}
