/* eslint-disable no-alert, no-console */

import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import noop from 'lodash/noop';
import { units } from 'utils/units';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import DataQualityReport from 'components/DataQualityReport';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { CogniteFunction } from 'reducers/charts/Nodes/DSPToolboxFunction';
import sdk from 'services/CogniteSDK';
import { waitOnFunctionComplete } from 'utils/cogniteFunctions';
import { AxisUpdate } from 'components/PlotlyChart';
import Search from 'components/Search';
import { Toolbar } from 'components/Toolbar';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';
import { useChart, useUpdateChart, useUpdateWorkflow } from 'hooks/firebase';
import { getTenantFromURL } from 'utils/env';
import { nanoid } from '@reduxjs/toolkit';
import {
  ChartTimeSeries,
  ChartWorkflow,
  WorkflowRunStatus,
} from 'reducers/charts';
import { getEntryColor } from 'utils/colors';
import {
  Header,
  TopPaneWrapper,
  BottomPaneWrapper,
  ChartViewContainer,
  ContentWrapper,
  BottombarWrapper,
  BottombarItem,
  ToolbarIcon,
  ChartContainer,
  SourceItem,
  SourceCircle,
  SourceSquare,
  ChartWrapper,
  SourceMenu,
  SourceName,
  SourceTableWrapper,
  SourceTable,
  SourceRow,
  ChartTitle,
} from './elements';

type ChartViewProps = {
  chartId: string;
};

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: chart, isError, isFetched } = useChart(chartId);
  const { mutate: updateWorkflow } = useUpdateWorkflow();
  const { mutate: updateChart } = useUpdateChart();

  const [activeSourceItem, setActiveSourceItem] = useState<string>();
  const [updateAutomatically, setUpdateAutomatically] = useState<boolean>(true);

  const tenant = getTenantFromURL();

  const [showSearch, setShowSearch] = useState(false);

  const [workflowsRan, setWorkflowsRan] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<string>('workspace');
  const isWorkspaceMode = workspaceMode === 'workspace';
  const isEditorMode = workspaceMode === 'editor';
  const isDataQualityMode = workspaceMode === 'report';

  const [dataQualityReport, setDataQualityReport] = useState<{
    timeSeriesId?: string;
    reportType?: string;
  }>({});

  const runWorkflows = async () => {
    //   // console.log('Running all workflows');
    //   if (!chart || !chart?.workflowCollection) {
    //     return;
    //   }
    //   (chart.workflowCollection || []).forEach(async (flow, i) => {
    //     if (!flow) {
    //       return;
    //     }
    //     if (!tenant) {
    //       return;
    //     }
    //     const steps = getStepsFromWorkflow(flow);
    //     if (!steps.length) {
    //       return;
    //     }
    //     const computation = {
    //       steps,
    //       start_time: new Date(chart.dateFrom).getTime(),
    //       end_time: new Date(chart.dateTo).getTime(),
    //       granularity: calculateGranularity(
    //         [
    //           new Date(chart.dateFrom).getTime(),
    //           new Date(chart.dateTo).getTime(),
    //         ],
    //         1000
    //       ),
    //     };
    //     const functions = await sdk.get<{ items: CogniteFunction[] }>(
    //       `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
    //     );
    //     const simpleCalc = functions.data.items.find(
    //       (func) => func.name === 'simple_calc-master'
    //     );
    //     if (!simpleCalc) {
    //       return;
    //     }
    //     const foo = chart.workflowCollection?[i];
    //     foo
    //     updateWorkflow({
    //       chartId,
    //       workflowCollection: chart.workflowCollection.
    //     })
    //     dispatch(
    //       chartsSlice.actions.updateWorkflowLatestRun({
    //         chartId: chart.id,
    //         workflowId: flow.id,
    //         latestRun: {
    //           timestamp: Date.now(),
    //           status: 'RUNNING',
    //           nodeProgress: flow.nodes?.reduce((output, node) => {
    //             return {
    //               ...output,
    //               [node.id]: { status: 'RUNNING' },
    //             };
    //           }, {}),
    //         },
    //       })
    //     );
    //     const functionCall = await sdk.post<{ id: number }>(
    //       `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/call`,
    //       {
    //         data: {
    //           data: { computation_graph: computation },
    //         },
    //       }
    //     );
    //     const status = await waitOnFunctionComplete(
    //       tenant,
    //       simpleCalc.id,
    //       functionCall.data.id
    //     );
    //     const functionResult = await sdk.get<{ response: Record<string, any> }>(
    //       `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/calls/${functionCall.data.id}/response`
    //     );
    //     /* eslint-disable no-console */
    //     console.log({
    //       status,
    //       result: functionResult.data,
    //     });
    //     /* eslint-enable no-console */
    //     if (
    //       !functionResult.data.response ||
    //       functionResult.data?.response?.error
    //     ) {
    //       dispatch(
    //         chartsSlice.actions.updateWorkflowLatestRun({
    //           chartId: chart.id,
    //           workflowId: flow.id,
    //           latestRun: {
    //             timestamp: Date.now(),
    //             status: 'FAILED',
    //             nodeProgress: flow.nodes?.reduce((output, node) => {
    //               return {
    //                 ...output,
    //                 [node.id]: { status: 'FAILED' },
    //               };
    //             }, {}),
    //           },
    //         })
    //       );
    //       return;
    //     }
    //     const latestRun: LatestWorkflowRun = {
    //       status: 'SUCCESS',
    //       timestamp: Date.now(),
    //       errors: [],
    //       results: {
    //         datapoints: {
    //           unit: 'Unknown',
    //           datapoints: functionResult.data.response.value.map(
    //             (_: any, i: number) => ({
    //               timestamp: functionResult.data.response.timestamp[i],
    //               value: functionResult.data.response.value[i],
    //             })
    //           ),
    //         },
    //       },
    //       nodeProgress: flow.nodes?.reduce((output, node) => {
    //         return {
    //           ...output,
    //           [node.id]: { status: 'DONE' },
    //         };
    //       }, {}),
    //     };
    //     dispatch(
    //       chartsSlice.actions.updateWorkflowLatestRun({
    //         chartId: chart.id,
    //         workflowId: flow.id,
    //         latestRun,
    //       })
    //     );
    //   });
  };

  // useEffect(() => {
  //   if ((workflows || []).length > 0 && updateAutomatically) {
  //     runWorkflows();
  //   }
  // }, [chart?.dateFrom, chart?.dateTo, updateAutomatically]);

  // useEffect(() => {
  //   if (newlyCreatedChart) {
  //     dispatch(chartsSlice.actions.clearNewlyCreatedChart());
  //   }
  // }, [newlyCreatedChart]);

  const handleClickNewWorkflow = () => {
    if (chart) {
      updateChart({
        ...chart,
        workflowCollection: [
          ...(chart.workflowCollection || []),
          {
            id: nanoid(),
            name: 'New Calculation',
            color: getEntryColor(),
            lineWeight: 2,
            lineStyle: 'solid',
            enabled: true,
            nodes: [],
            connections: [],
          },
        ],
      });
    }
  };

  const handleClickSave = async () => {
    if (chart) {
      updateChart(chart);
    }
  };

  const handleToggleAutomaticUpdates = async () => {
    setUpdateAutomatically((val) => !val);
  };

  const handleRemoveTimeSeries = (timeSeriesId: string) => {
    if (!chart) {
      return;
    }
    updateChart({
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.filter(
        (t) => t.id !== timeSeriesId
      ),
    });
  };

  const handleToggleTimeSeries = (timeSeriesId: string) => {
    if (!chart) {
      return;
    }
    updateChart({
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.map((t) => {
        if (t.id === timeSeriesId) {
          t.enabled = !t.enabled;
        }
        return t;
      }),
    });
  };

  const handleToggleWorkflow = (workflowId: string) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.toggleWorkflow({
    //     id: chart?.id || '',
    //     workflowId,
    //   })
    // );
  };

  const handleRenameTimeSeries = (timeSeriesId: string) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.renameTimeSeries({
    //     id: chart?.id || '',
    //     timeSeriesId,
    //     // eslint-disable-next-line no-alert
    //     name: prompt('Provide new name for time series') || 'unnamed',
    //   })
    // );
  };

  const handleRenameWorkflow = (workflowId: string) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.renameWorkflow({
    //     id: chart?.id || '',
    //     workflowId,
    //     // eslint-disable-next-line no-alert
    //     name: prompt('Provide new name for workflow') || 'unnamed',
    //   })
    // );
  };

  const handleChangeTimeSeriesColor = (timeSeriesId: string, color: string) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeTimeseriesColor({
    //     id: chart?.id || '',
    //     timeSeriesId,
    //     color,
    //   })
    // );
  };

  const handleChangeTimeSeriesLineWeight = (
    timeSeriesId: string,
    lineWeight: number
  ) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeTimeseriesLineWeight({
    //     id: chart?.id || '',
    //     timeSeriesId,
    //     lineWeight,
    //   })
    // );
  };

  const handleChangeTimeSeriesLineStyle = (
    timeSeriesId: string,
    lineStyle: 'solid' | 'dashed' | 'dotted'
  ) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeTimeseriesLineStyle({
    //     id: chart?.id || '',
    //     timeSeriesId,
    //     lineStyle,
    //   })
    // );
  };

  const handleChangeWorkflowColor = (workflowId: string, color: string) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeWorkflowColor({
    //     id: chart?.id || '',
    //     workflowId,
    //     color,
    //   })
    // );
  };

  const handleChangeWorkflowLineWeight = (
    workflowId: string,
    lineWeight: number
  ) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeWorkflowLineWeight({
    //     id: chart?.id || '',
    //     workflowId,
    //     lineWeight,
    //   })
    // );
  };

  const handleChangeWorkflowLineStyle = (
    workflowId: string,
    lineStyle: 'solid' | 'dashed' | 'dotted'
  ) => {
    console.log('TODO');
    // dispatch(
    //   chartsSlice.actions.changeWorkflowLineStyle({
    //     id: chart?.id || '',
    //     workflowId,
    //     lineStyle,
    //   })
    // );
  };

  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  const onDeleteWorkflow = (workflow: ChartWorkflow) => {
    console.log('TODO');
    // if (chart) {
    //   dispatch(
    //     chartsSlice.actions.removeWorkflow({
    //       id: chart.id,
    //       workflowId: workflow.id,
    //     })
    //   );
    // }
  };

  const handleConvertToWorkflow = (id: string) => {
    console.log('TODO');
    // if (chart) {
    //   dispatch(createWorkflowFromTimeSeries(chart, id));
    // }
  };

  const handleRenameChart = () => {
    if (chart) {
      // eslint-disable-next-line no-alert
      const name = prompt('Rename chart', chart.name) || chart.name;
      updateChart({ ...chart, name });
    }
  };

  const handleSetInputUnit = (timeSeriesId: string, unit?: string) => {
    if (chart) {
      updateChart({
        ...chart,
        timeSeriesCollection: chart.timeSeriesCollection?.map((t) =>
          t.id === timeSeriesId ? { ...t, unit } : t
        ),
      });
    }
  };

  const handleSetOutputUnit = (timeSeriesId: string, unit?: string) => {
    if (chart) {
      updateChart({
        ...chart,
        timeSeriesCollection: chart.timeSeriesCollection?.map((t) =>
          t.id === timeSeriesId ? { ...t, preferredUnit: unit } : t
        ),
      });
    }
  };

  const handleOpenDataQualityReport = (timeSeriesId: string) => {
    setDataQualityReport({ timeSeriesId, reportType: 'gaps' });
  };

  const handleCloseDataQualityReport = () => {
    setDataQualityReport({});
  };

  const handleChangeSourceAxis = (axis: { x: number[]; y: AxisUpdate[] }) => {
    if (!chart) {
      return;
    }
    console.log('TODO');
    // if (axis.x.length) {
    //   dispatch(
    //     chartsSlice.actions.changeVisibleDateRange({
    //       id: chart?.id || '',
    //       range: axis.x,
    //     })
    //   );
    // }

    // if (axis.y.length) {
    //   dispatch(
    //     chartsSlice.actions.changeSourceYaxis({
    //       id: chart?.id || '',
    //       axisUpdates: axis.y,
    //     })
    //   );
    // }
  };

  const handleDuplicateChart = async () => {
    if (chart) {
      const newChart = {
        ...chart,
        name: `${chart.name} Copy`,
        id: nanoid(),
      };
      updateChart(newChart);
    }
  };

  const renderStatusIcon = (status?: WorkflowRunStatus) => {
    switch (status) {
      case 'RUNNING':
        return <Icon type="Loading" />;
      case 'SUCCESS':
        return <Icon type="Check" />;
      case 'FAILED':
        return <Icon type="Close" />;
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <div>
        <p>Could not load chart</p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div>This chart does not seem to exist. You might not have access</div>
    );
  }

  const sourceTableHeaderRow = (
    <tr>
      <th style={{ width: 350 }}>
        <SourceItem>
          <SourceName>Name</SourceName>
        </SourceItem>
      </th>
      {isWorkspaceMode && (
        <>
          <th style={{ width: 110 }}>
            <SourceItem>
              <SourceName>Unit (input)</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 110 }}>
            <SourceItem>
              <SourceName>Unit (output)</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 300 }}>
            <SourceItem>
              <SourceName>Source</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Description</SourceName>
            </SourceItem>
          </th>
        </>
      )}
      {isDataQualityMode && (
        <>
          <th style={{ width: 200 }}>
            <SourceItem>
              <SourceName>Data Quality Reports</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Warnings</SourceName>
            </SourceItem>
          </th>
        </>
      )}
    </tr>
  );

  const timeseriesRows = chart.timeSeriesCollection?.map(
    ({
      id,
      name,
      color,
      enabled,
      originalUnit,
      unit,
      preferredUnit,
      description,
    }: ChartTimeSeries) => {
      const handleClick = !isEditorMode ? () => setActiveSourceItem(id) : noop;

      const inputUnitOption = units.find(
        (unitOption) => unitOption.value === unit?.toLowerCase()
      );

      const preferredUnitOption = units.find(
        (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
      );

      const unitConversionOptions = inputUnitOption?.conversions?.map(
        (conversion) =>
          units.find((unitOption) => unitOption.value === conversion)
      );

      const unitOverrideMenuItems = units.map((unitOption) => (
        <Menu.Item
          key={unitOption.value}
          onClick={() => handleSetInputUnit(id, unitOption.value)}
        >
          {unitOption.label}
          {unit?.toLowerCase() === unitOption.value && ' (selected)'}
          {originalUnit?.toLowerCase() === unitOption.value && ' (original)'}
        </Menu.Item>
      ));

      const unitConversionMenuItems = unitConversionOptions?.map(
        (unitOption) => (
          <Menu.Item
            key={unitOption?.value}
            onClick={() => handleSetOutputUnit(id, unitOption?.value)}
          >
            {unitOption?.label}{' '}
            {preferredUnit?.toLowerCase() === unitOption?.value &&
              ' (selected)'}
          </Menu.Item>
        )
      );

      return (
        <SourceRow
          key={id}
          onClick={handleClick}
          isActive={activeSourceItem === id}
        >
          <td>
            <SourceItem
              isActive={activeSourceItem === id}
              isDisabled={workspaceMode === 'editor'}
              key={id}
            >
              <SourceCircle
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleTimeSeries(id);
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
                                    handleChangeTimeSeriesColor(id, newColor)
                                  }
                                  onWeightSelected={(newWeight) =>
                                    handleChangeTimeSeriesLineWeight(
                                      id,
                                      newWeight
                                    )
                                  }
                                  onStyleSelected={(newStyle) =>
                                    handleChangeTimeSeriesLineStyle(
                                      id,
                                      newStyle
                                    )
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
                        onClick={() => handleRenameTimeSeries(id)}
                        appendIcon="Edit"
                      >
                        <span>Rename</span>
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => handleRemoveTimeSeries(id)}
                        appendIcon="Delete"
                      >
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
                        onClick={() => handleOpenDataQualityReport(id)}
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
  );

  const workflowRows = chart?.workflowCollection?.map((flow) => {
    const flowEntry = chart?.workflowCollection?.find(
      ({ id }) => id === flow.id
    );

    return (
      <SourceRow
        key={flow.id}
        onClick={() => setActiveSourceItem(flow.id)}
        isActive={activeSourceItem === flow.id}
      >
        <td>
          <SourceItem key={flow.id}>
            <SourceSquare
              onClick={() => handleToggleWorkflow(flow.id)}
              color={flowEntry?.color}
              fade={!flowEntry?.enabled}
            />
            <div style={{ marginRight: 10 }}>
              {renderStatusIcon(flow.latestRun?.status)}
            </div>
            <SourceName>{flowEntry?.name || 'noname'}</SourceName>
            <SourceMenu onClick={(e) => e.stopPropagation()}>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Header>
                      <span style={{ wordBreak: 'break-word' }}>
                        {flowEntry?.name}
                      </span>
                    </Menu.Header>
                    <Menu.Submenu
                      content={
                        <AppearanceDropdown
                          onColorSelected={(newColor) =>
                            handleChangeWorkflowColor(flow.id, newColor)
                          }
                          onWeightSelected={(newWeight) =>
                            handleChangeWorkflowLineWeight(flow.id, newWeight)
                          }
                          onStyleSelected={(newStyle) =>
                            handleChangeWorkflowLineStyle(flow.id, newStyle)
                          }
                        />
                      }
                    >
                      <span>Appearance</span>
                    </Menu.Submenu>
                    <Menu.Item
                      onClick={() => handleRenameWorkflow(flow.id)}
                      appendIcon="Edit"
                    >
                      <span>Rename</span>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        onDeleteWorkflow(flow);
                        if (activeSourceItem === flow.id) {
                          setActiveSourceItem(undefined);
                        }
                      }}
                      appendIcon="Delete"
                    >
                      <span>Remove</span>
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
              <SourceItem>
                <SourceName>*</SourceName>
              </SourceItem>
            </td>
            <td>
              <SourceItem>
                <SourceName>*</SourceName>
              </SourceItem>
            </td>
            <td>
              <SourceItem>
                <SourceName>-</SourceName>
              </SourceItem>
            </td>
            <td>
              <SourceItem>
                <SourceName>-</SourceName>
              </SourceItem>
            </td>
          </>
        )}
        {isDataQualityMode && (
          <>
            <td>
              <SourceItem>
                <SourceName>-</SourceName>
              </SourceItem>
            </td>
            <td>
              <SourceItem>
                <SourceName>-</SourceName>
              </SourceItem>
            </td>
          </>
        )}
      </SourceRow>
    );
  });

  return (
    <ChartViewContainer id="chart-view">
      {!showSearch && (
        <Toolbar
          onSearchClick={() => setShowSearch(true)}
          onNewWorkflowClick={handleClickNewWorkflow}
        />
      )}
      <Search visible={showSearch} onClose={() => setShowSearch(false)} />
      <ContentWrapper showSearch={showSearch}>
        <Header>
          <hgroup>
            <ChartTitle onClick={() => handleRenameChart()}>
              {chart?.name}{' '}
              <span>
                <Icon type="Edit" />
              </span>
            </ChartTitle>
            <h4>by {chart?.user}</h4>
          </hgroup>
          <section className="daterange">
            <DateRangeSelector chart={chart} />
          </section>
          {!showSearch && (
            <section className="actions">
              <Button
                icon={updateAutomatically ? 'Checkmark' : 'XCompact'}
                type="secondary"
                onClick={() => handleToggleAutomaticUpdates()}
              >
                Automatic Update
              </Button>
              <Button type="secondary" onClick={() => runWorkflows()}>
                Run workflows
              </Button>
              <Button
                icon="Checkmark"
                type="primary"
                onClick={() => handleClickSave()}
              >
                Save
              </Button>
              <SharingDropdown chart={chart} />
              <Button icon="Download" variant="ghost">
                Export
              </Button>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Item onClick={() => handleDuplicateChart()}>
                      <Icon type="Duplicate" />
                      <span>Duplicate</span>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon="Down" iconPlacement="right">
                  Actions
                </Button>
              </Dropdown>
            </section>
          )}
        </Header>
        <ChartContainer>
          <SplitPaneLayout>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <PlotlyChartComponent
                  chart={chart}
                  onAxisChange={handleChangeSourceAxis}
                  showYAxis={!showSearch}
                />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <div style={{ display: 'flex', height: '100%' }}>
                <SourceTableWrapper>
                  <SourceTable>
                    <thead>{sourceTableHeaderRow}</thead>
                    <tbody>
                      {timeseriesRows}
                      {workflowRows}
                    </tbody>
                  </SourceTable>
                </SourceTableWrapper>
                {workspaceMode === 'editor' && (
                  <NodeEditor workflowId={activeSourceItem} chartId={chartId} />
                )}
              </div>
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
        <BottombarWrapper>
          <BottombarItem
            isActive={workspaceMode === 'workspace'}
            onClick={() => setWorkspaceMode('workspace')}
          >
            <ToolbarIcon type="Timeseries" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>Workspace</span>
          </BottombarItem>
          <BottombarItem
            isActive={workspaceMode === 'editor'}
            onClick={() => setWorkspaceMode('editor')}
          >
            <ToolbarIcon type="Edit" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>
              Calculations
            </span>
          </BottombarItem>
          <BottombarItem
            isActive={workspaceMode === 'report'}
            onClick={() => setWorkspaceMode('report')}
          >
            <ToolbarIcon type="BarChart" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>
              Data Quality Report
            </span>
          </BottombarItem>
        </BottombarWrapper>
        <DataQualityReport
          handleClose={handleCloseDataQualityReport}
          {...dataQualityReport}
        />
      </ContentWrapper>
    </ChartViewContainer>
  );
};

export default ChartView;
