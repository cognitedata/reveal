import React, { useState } from 'react';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { units } from 'utils/units';
import EditableText from 'components/EditableText';
import {
  SourceItem,
  SourceCircle,
  SourceMenu,
  SourceName,
  SourceRow,
} from './elements';
import TimeSeriesMenu from './TimeSeriesMenu';

type Props = {
  mutate: (c: Chart) => void;
  chart: Chart;
  timeseries: ChartTimeSeries;
  disabled?: boolean;
  active?: boolean;
  isWorkspaceMode?: boolean;
  isDataQualityMode?: boolean;
  isFileViewerMode?: boolean;
  setDataQualityReport: (input: {
    timeSeriesId: string;
    reportType: string;
  }) => void;
};
export default function TimeSeriesRow({
  mutate,
  chart,
  timeseries,
  active = false,
  disabled = false,
  isDataQualityMode = false,
  isWorkspaceMode = false,
  isFileViewerMode = false,
  setDataQualityReport,
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
    <SourceRow key={id} isActive={false}>
      <td>
        <SourceItem isActive={active} isDisabled={disabled} key={id}>
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
          </td>
          <td>
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
        </>
      )}
      {isDataQualityMode && (
        <>
          <td>
            <Dropdown
              content={
                <Menu>
                  <Menu.Header>
                    <span style={{ wordBreak: 'break-word' }}>
                      Select data quality report
                    </span>
                  </Menu.Header>
                  <Menu.Item
                    onClick={() =>
                      setDataQualityReport({
                        timeSeriesId: id,
                        reportType: 'gaps',
                      })
                    }
                  >
                    Gap Analysis
                  </Menu.Item>
                </Menu>
              }
            >
              <SourceItem style={{ justifyContent: 'space-between' }}>
                <SourceName>Reports</SourceName>
                <Icon style={{ marginRight: 10 }} type="CaretDown" />
              </SourceItem>
            </Dropdown>
          </td>
          <td>
            <SourceItem>
              <Icon type="TriangleWarning" />
            </SourceItem>
          </td>
        </>
      )}
    </SourceRow>
  );
}
