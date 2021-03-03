import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import chartsSlice, { chartSelectors, ChartTimeSeries } from 'reducers/charts';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import useDispatch from 'hooks/useDispatch';
import {
  fetchWorkflowsForChart,
  createNewWorkflow,
  deleteWorkflow,
  createWorkflowFromTimeSeries,
} from 'reducers/workflows/api';
import useEnsureData from 'hooks/useEnsureData';
import searchSlice from 'reducers/search';
import {
  renameChart,
  saveExistingChart,
  duplicateChart,
} from 'reducers/charts/api';
import workflowSlice, {
  LatestWorkflowRun,
  Workflow,
  WorkflowRunStatus,
} from 'reducers/workflows';
import noop from 'lodash/noop';
import { units } from 'utils/units';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import DataQualityReport from 'components/DataQualityReport';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { CogniteFunction } from 'reducers/workflows/Nodes/DSPToolboxFunction';
import sdk from 'services/CogniteSDK';
import { waitOnFunctionComplete } from 'utils/cogniteFunctions';
import { AxisUpdate } from 'components/PlotlyChart';
import Search from 'components/Search';
import { Toolbar } from 'components/Toolbar';
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
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const hasData = useEnsureData();
  const dispatch = useDispatch();
  const [activeSourceItem, setActiveSourceItem] = useState<string>();
  const [updateAutomatically, setUpdateAutomatically] = useState<boolean>(true);
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );
  const tenant = useSelector((state) => state.environment.tenant);
  const newlyCreatedChart = useSelector(
    (state) => state.charts.newlyCreatedChart
  );

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

  const workflows = useSelector((state) =>
    chart?.workflowCollection?.map(({ id }) => state.workflows.entities[id])
  )?.filter(Boolean) as Workflow[];

  const error = useSelector((state) => state.charts.status.error);

  const runWorkflows = async () => {
    // console.log('Running all workflows');

    if (!chart) {
      return;
    }

    (workflows || []).forEach(async (flow) => {
      if (!flow) {
        return;
      }

      if (!tenant) {
        return;
      }

      const steps = getStepsFromWorkflow(flow);

      /* eslint-disable no-console */
      console.log('Running workflow');
      /* eslint-enable no-console */

      if (!steps.length) {
        return;
      }

      const computation = {
        steps,
        start_time: new Date(chart.dateFrom).getTime(),
        end_time: new Date(chart.dateTo).getTime(),
        granularity: calculateGranularity(
          [
            new Date(chart.dateFrom).getTime(),
            new Date(chart.dateTo).getTime(),
          ],
          1000
        ),
      };

      /* eslint-disable no-console */
      console.log({ computation });
      /* eslint-enable no-console */

      const functions = await sdk.get<{ items: CogniteFunction[] }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
      );

      const simpleCalc = functions.data.items.find(
        (func) => func.name === 'simple_calc-master'
      );

      if (!simpleCalc) {
        return;
      }

      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: flow.id,
          changes: {
            latestRun: {
              timestamp: Date.now(),
              status: 'RUNNING',
              nodeProgress: flow.nodes.reduce((output, node) => {
                return {
                  ...output,
                  [node.id]: { status: 'RUNNING' },
                };
              }, {}),
            },
          },
        })
      );

      const functionCall = await sdk.post<{ id: number }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/call`,
        {
          data: {
            data: { computation_graph: computation },
          },
        }
      );

      const status = await waitOnFunctionComplete(
        tenant,
        simpleCalc.id,
        functionCall.data.id
      );

      const functionResult = await sdk.get<{ response: Record<string, any> }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/calls/${functionCall.data.id}/response`
      );

      /* eslint-disable no-console */
      console.log({
        status,
        result: functionResult.data,
      });
      /* eslint-enable no-console */

      if (
        !functionResult.data.response ||
        functionResult.data?.response?.error
      ) {
        dispatch(
          workflowSlice.actions.updateWorkflow({
            id: flow.id,
            changes: {
              latestRun: {
                timestamp: Date.now(),
                status: 'FAILED',
                nodeProgress: flow.nodes.reduce((output, node) => {
                  return {
                    ...output,
                    [node.id]: { status: 'FAILED' },
                  };
                }, {}),
              },
            },
          })
        );

        return;
      }

      const latestRun: LatestWorkflowRun = {
        status: 'SUCCESS',
        timestamp: Date.now(),
        errors: [],
        results: {
          datapoints: {
            unit: 'Unknown',
            datapoints: functionResult.data.response.value.map(
              (_: any, i: number) => ({
                timestamp: functionResult.data.response.timestamp[i],
                value: functionResult.data.response.value[i],
              })
            ),
          },
        },
        nodeProgress: flow.nodes.reduce((output, node) => {
          return {
            ...output,
            [node.id]: { status: 'DONE' },
          };
        }, {}),
      };

      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: flow.id,
          changes: {
            latestRun,
          },
        })
      );
    });
  };

  useEffect(() => {
    if (chart?.workflowCollection) {
      dispatch(
        fetchWorkflowsForChart(chart?.workflowCollection.map(({ id }) => id))
      );
    }
  }, [chart?.id]);

  useEffect(() => {
    if (chart) {
      dispatch(searchSlice.actions.setActiveChartId(chart.id));
    }
  }, [chart?.id]);

  useEffect(() => {
    if ((workflows || []).length > 0 && !workflowsRan) {
      setWorkflowsRan(true);
      // Run the existing workflows here
      runWorkflows();
    }
  }, [workflows]);

  useEffect(() => {
    if ((workflows || []).length > 0 && updateAutomatically) {
      runWorkflows();
    }
  }, [chart?.dateFrom, chart?.dateTo, updateAutomatically]);

  useEffect(() => {
    if (newlyCreatedChart) {
      dispatch(chartsSlice.actions.clearNewlyCreatedChart());
    }
  }, [newlyCreatedChart]);

  const handleClickNewWorkflow = () => {
    if (chart) {
      dispatch(createNewWorkflow(chart));
    }
  };

  const handleClickSave = async () => {
    if (chart) {
      try {
        await dispatch(saveExistingChart(chart));
        toast.success('Successfully saved nothing!');
      } catch (e) {
        toast.error('Unable to save - try again!');
      }
    }
  };

  const handleToggleAutomaticUpdates = async () => {
    setUpdateAutomatically((val) => !val);
  };

  const handleRemoveTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.removeTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
      })
    );
  };

  const handleToggleTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.toggleTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
      })
    );
  };

  const handleToggleWorkflow = (workflowId: string) => {
    dispatch(
      chartsSlice.actions.toggleWorkflow({
        id: chart?.id || '',
        workflowId,
      })
    );
  };

  const handleRenameTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.renameTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
        // eslint-disable-next-line no-alert
        name: prompt('Provide new name for time series') || 'unnamed',
      })
    );
  };

  const handleRenameWorkflow = (workflowId: string) => {
    dispatch(
      chartsSlice.actions.renameWorkflow({
        id: chart?.id || '',
        workflowId,
        // eslint-disable-next-line no-alert
        name: prompt('Provide new name for workflow') || 'unnamed',
      })
    );
  };

  const handleChangeTimeSeriesColor = (timeSeriesId: string, color: string) => {
    dispatch(
      chartsSlice.actions.changeTimeseriesColor({
        id: chart?.id || '',
        timeSeriesId,
        color,
      })
    );
  };

  const handleChangeTimeSeriesLineWeight = (
    timeSeriesId: string,
    lineWeight: number
  ) => {
    dispatch(
      chartsSlice.actions.changeTimeseriesLineWeight({
        id: chart?.id || '',
        timeSeriesId,
        lineWeight,
      })
    );
  };

  const handleChangeTimeSeriesLineStyle = (
    timeSeriesId: string,
    lineStyle: 'solid' | 'dashed' | 'dotted'
  ) => {
    dispatch(
      chartsSlice.actions.changeTimeseriesLineStyle({
        id: chart?.id || '',
        timeSeriesId,
        lineStyle,
      })
    );
  };

  const handleChangeWorkflowColor = (workflowId: string, color: string) => {
    dispatch(
      chartsSlice.actions.changeWorkflowColor({
        id: chart?.id || '',
        workflowId,
        color,
      })
    );
  };

  const handleChangeWorkflowLineWeight = (
    workflowId: string,
    lineWeight: number
  ) => {
    dispatch(
      chartsSlice.actions.changeWorkflowLineWeight({
        id: chart?.id || '',
        workflowId,
        lineWeight,
      })
    );
  };

  const handleChangeWorkflowLineStyle = (
    workflowId: string,
    lineStyle: 'solid' | 'dashed' | 'dotted'
  ) => {
    dispatch(
      chartsSlice.actions.changeWorkflowLineStyle({
        id: chart?.id || '',
        workflowId,
        lineStyle,
      })
    );
  };

  if (!hasData) {
    return <Icon type="Loading" />;
  }

  const onDeleteWorkflow = (workflow: Workflow) => {
    if (chart) {
      dispatch(deleteWorkflow(chart, workflow));
    }
  };

  const handleConvertToWorkflow = (id: string) => {
    if (chart) {
      dispatch(createWorkflowFromTimeSeries(chart, id));
    }
  };

  const handleRenameChart = () => {
    if (chart) {
      dispatch(renameChart(chart));
    }
  };

  const handleSetInputUnit = (timeSeriesId: string, unit?: string) => {
    if (chart) {
      dispatch(
        chartsSlice.actions.setInputUnit({ id: chart.id, timeSeriesId, unit })
      );
    }
  };

  const handleSetOutputUnit = (timeSeriesId: string, unit?: string) => {
    if (chart) {
      dispatch(
        chartsSlice.actions.setOutputUnit({ id: chart.id, timeSeriesId, unit })
      );
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

    if (axis.x.length) {
      dispatch(
        chartsSlice.actions.changeVisibleDateRange({
          id: chart?.id || '',
          range: axis.x,
        })
      );
    }

    if (axis.y.length) {
      dispatch(
        chartsSlice.actions.changeSourceYaxis({
          id: chart?.id || '',
          axisUpdates: axis.y,
        })
      );
    }
  };

  const handleDuplicateChart = async () => {
    try {
      await dispatch(duplicateChart(chart!));
      toast.success('Successfully duplicated!');
    } catch (e) {
      toast.error('Unable to duplicate - try again!');
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

  if (error) {
    return (
      <div>
        <p>Could not load chart</p>
        <pre>{error?.message}</pre>
        <pre>{error?.stack}</pre>
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

  const workflowRows = workflows?.map((flow) => {
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
              <Button icon="Share" variant="ghost">
                Share
              </Button>
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
