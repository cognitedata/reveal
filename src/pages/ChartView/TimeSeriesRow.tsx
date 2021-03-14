import React from 'react';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { units } from 'utils/units';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { convertTsToWorkFlow } from 'utils/timeseries';
import {
  SourceItem,
  SourceCircle,
  SourceMenu,
  SourceName,
  SourceRow,
} from './elements';

type Props = {
  mutate: (c: Chart) => void;
  chart: Chart;
  timeseries: ChartTimeSeries;
  disabled?: boolean;
  active?: boolean;
  isWorkspaceMode?: boolean;
  isDataQualityMode?: boolean;
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
  } = timeseries;

  const update = (tsId: string, diff: Partial<ChartTimeSeries>) =>
    mutate({
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.map((t) =>
        t.id === tsId
          ? {
              ...t,
              ...diff,
            }
          : t
      ),
    });

  const remove = (tsId: string) =>
    mutate({
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.filter(
        (t) => t.id !== tsId
      ),
    });

  const handleConvertToWorkflow = (tsId: string) => {
    const ts = chart.timeSeriesCollection?.find((t) => t.id === tsId);
    if (ts) {
      const wf = convertTsToWorkFlow(ts);
      mutate({
        ...chart,
        timeSeriesCollection: chart.timeSeriesCollection?.filter(
          (t) => t.id !== id
        ),
        workflowCollection: [...(chart.workflowCollection || []), wf],
      });
    }
  };

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
          <SourceName title={name}>{name || 'noname'}</SourceName>
          <SourceMenu onClick={(e) => e.stopPropagation()}>
            <Dropdown
              content={
                <Menu>
                  <Menu.Header>
                    <span style={{ wordBreak: 'break-word' }}>{id}</span>
                  </Menu.Header>
                  <Menu.Submenu
                    content={
                      <Menu>
                        <Menu.Submenu
                          content={
                            <AppearanceDropdown
                              onColorSelected={(newColor) =>
                                update(id, {
                                  color: newColor,
                                })
                              }
                              onWeightSelected={(newWeight) =>
                                update(id, {
                                  lineWeight: newWeight,
                                })
                              }
                              onStyleSelected={(newStyle) =>
                                update(id, {
                                  lineStyle: newStyle,
                                })
                              }
                            />
                          }
                        >
                          <span>Appearance</span>
                        </Menu.Submenu>
                        <Menu.Submenu
                          content={
                            <Menu>
                              <Menu.Item>Gaps</Menu.Item>
                              <Menu.Item>Freshness</Menu.Item>
                              <Menu.Item>Drift Detector</Menu.Item>
                            </Menu>
                          }
                        >
                          <span>Data Quality</span>
                        </Menu.Submenu>
                        <Menu.Item>Min / Max</Menu.Item>
                        <Menu.Item>Limit</Menu.Item>
                      </Menu>
                    }
                  >
                    <span>Tools</span>
                  </Menu.Submenu>
                  <Menu.Item
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      const newName = prompt('Rename timeseries');
                      if (newName) {
                        update(id, {
                          name: newName,
                        });
                      }
                    }}
                    appendIcon="Edit"
                  >
                    <span>Rename</span>
                  </Menu.Item>
                  <Menu.Item onClick={() => remove(id)} appendIcon="Delete">
                    <span>Remove</span>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => handleConvertToWorkflow(id)}
                    appendIcon="Timeseries"
                  >
                    <span>Convert to calculation</span>
                  </Menu.Item>
                </Menu>
              }
            >
              <Icon type="VerticalEllipsis" />
            </Dropdown>
          </SourceMenu>
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
          <td>
            <SourceItem>
              <SourceName>{id}</SourceName>
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
