import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import {
  Button,
  Icon,
  toast,
  Tooltip,
  Dropdown,
  Menu,
  Switch,
  Flex,
} from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import Search from 'components/Search';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import {
  ChartTimeSeries,
  ChartWorkflow,
  SourceCollectionData,
} from 'reducers/charts/types';
import { getEntryColor } from 'utils/colors';
import { useSearchParam } from 'hooks';
import { SEARCH_KEY } from 'utils/constants';
import { metrics, trackUsage } from 'utils/metrics';
import { ITimer } from '@cognite/metrics';
import { Modes } from 'pages/types';
import DetailsSidebar from 'components/DetailsSidebar';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import SourceRows from './SourceRows';

import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  Header,
  SourceItem,
  SourceName,
  SourceTable,
  SourceTableWrapper,
  TopPaneWrapper,
} from './elements';

type ChartViewProps = {
  chartId: string;
};

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const [query = '', setQuery] = useSearchParam(SEARCH_KEY, false);

  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: chart, isError, isFetched } = useChart(chartId);
  const { data: login } = useUserInfo();
  const [showContextMenu, setShowContextMenu] = useState(false);

  const [selectedSourceId, setSelectedSourceId] = useState<
    string | undefined
  >();

  const [showSearch, setShowSearch] = useState(false);
  const [showYAxis, setShowYAxis] = useState(true);
  const [showMinMax, setShowMinMax] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState<Modes>('workspace');
  const [stackedMode, setStackedMode] = useState<boolean>(false);
  const [editorTimer, setEditorTimer] = useState<ITimer | undefined>();
  const isWorkspaceMode = workspaceMode === 'workspace';

  useEffect(() => {
    trackUsage('PageView.ChartView', { isOwner: chart?.user === login?.id });
    const timer = metrics.start('ChartView.ViewTime');

    return () => {
      timer.stop();
      if (editorTimer) {
        editorTimer.stop();
      }
    };
    // Should not rerun when editorTimer is changed, only on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    mutate: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!', { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg]);

  /**
   * Open search drawer if query is present in the url
   */
  useEffect(() => {
    if (query !== '' && !showSearch) {
      setShowSearch(true);
    }
  }, [query, showSearch]);

  const openNodeEditor = () => {
    setWorkspaceMode('editor');
    if (!editorTimer) {
      setEditorTimer(metrics.start('NodeEditor.ViewTime'));
    }
  };

  const closeNodeEditor = () => {
    setWorkspaceMode('workspace');
    if (editorTimer) {
      editorTimer.stop();
      setEditorTimer(undefined);
    }
  };

  const handleClickNewWorkflow = () => {
    if (chart) {
      const newWorkflowId = nanoid();
      const newWorkflow = {
        id: newWorkflowId,
        name: 'New Calculation',
        color: getEntryColor(chart.id, newWorkflowId),
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        nodes: [],
        connections: [],
        createdAt: Date.now(),
      } as ChartWorkflow;

      updateChart(
        {
          ...chart,
          workflowCollection: [
            ...(chart.workflowCollection || []),
            newWorkflow,
          ],
          sourceCollection: [
            { type: 'workflow', id: newWorkflowId },
            ...(chart.sourceCollection || []),
          ],
        },
        {
          onSuccess: () => {
            setSelectedSourceId(newWorkflowId);
            openNodeEditor();
          },
        }
      );
      trackUsage('ChartView.AddCalculation');
    }
  };

  if (!isFetched) {
    return <Icon type="Loading" />;
  }

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

  const handleSourceClick = async (sourceId?: string) => {
    setSelectedSourceId(sourceId);
  };

  const handleInfoClick = async (sourceId?: string) => {
    const isSameSource = sourceId === selectedSourceId;
    const showMenu = isSameSource ? !showContextMenu : true;
    setShowContextMenu(showMenu);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleCloseContextMenu = async () => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleOpenSearch = async () => {
    setShowSearch(true);
    trackUsage('ChartView.OpenSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleCloseSearch = async () => {
    setShowSearch(false);
    setQuery('');
    trackUsage('ChartView.CloseSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const selectedSourceItem = [
    ...(chart.timeSeriesCollection || []).map(
      (ts) =>
        ({
          type: 'timeseries',
          ...ts,
        } as ChartTimeSeries)
    ),
    ...(chart.workflowCollection || []).map(
      (wf) =>
        ({
          type: 'workflow',
          ...wf,
        } as ChartWorkflow)
    ),
  ].find(({ id }) => id === selectedSourceId);

  const sourceTableHeaderRow = (
    <tr>
      <th>
        <SourceItem>
          <SourceName>
            <Icon
              type="Eye"
              style={{
                marginLeft: 7,
                marginRight: 20,
                verticalAlign: 'middle',
              }}
            />
            Name
          </SourceName>
        </SourceItem>
      </th>
      {isWorkspaceMode && (
        <>
          <th style={{ width: 250 }}>
            <SourceItem>
              <SourceName>Description</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 210 }}>
            <SourceItem>
              <SourceName>Tag</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Min</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Max</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Median</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 180, paddingRight: 8 }}>
            <SourceItem style={{ justifyContent: 'flex-end' }}>
              <SourceName>Unit</SourceName>
            </SourceItem>
          </th>
          <th
            style={{ width: 50, paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>P&amp;IDs</SourceName>
            </SourceItem>
          </th>
          <th
            style={{ width: 50, paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Style</SourceName>
            </SourceItem>
          </th>
          <th
            style={{ width: 50, paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Remove</SourceName>
            </SourceItem>
          </th>
          <th
            style={{ width: 50, paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Details</SourceName>
            </SourceItem>
          </th>
          <th
            style={{ width: 50, paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>More</SourceName>
            </SourceItem>
          </th>
        </>
      )}
    </tr>
  );
  const reorder = (
    sourceCollection: SourceCollectionData[],
    startIndex: number,
    endIndex: number
  ) => {
    const [removed] = sourceCollection.splice(startIndex, 1);
    sourceCollection.splice(endIndex, 0, removed);
    return sourceCollection;
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedChart = {
      ...chart,
      sourceCollection: reorder(
        chart?.sourceCollection || [],
        result.source.index,
        result.destination.index
      ),
    };
    updateChart(reorderedChart);
  };

  return (
    <ChartViewContainer id="chart-view">
      {showSearch && (
        <Search visible={showSearch} onClose={handleCloseSearch} />
      )}
      <ContentWrapper showSearch={showSearch}>
        <Header className="downloadChartHide" inSearch={showSearch}>
          {!showSearch && (
            <section className="actions">
              <Button icon="Plus" type="primary" onClick={handleOpenSearch}>
                Add time series
              </Button>
              <Button
                icon="Function"
                type="ghost"
                onClick={handleClickNewWorkflow}
              >
                Add calculation
              </Button>
            </section>
          )}
          {login?.id && login?.id !== chart?.user && (
            <section>
              <WarningAlert
                type="warning"
                message="View only. Duplicate to edit."
                icon={<Icon type="Info" />}
                showIcon
              />
            </section>
          )}
          <section className="daterange">
            <Tooltip content={`${showGridlines ? 'Hide' : 'Show'} gridlines`}>
              <Button
                icon="GridLines"
                type={showGridlines ? 'link' : 'ghost'}
                aria-label="view"
                onClick={() => setShowGridlines(!showGridlines)}
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
            <Tooltip content={`${showMinMax ? 'Hide' : 'Show'} min/max`}>
              <Button
                icon="Timeseries"
                type={showMinMax ? 'link' : 'ghost'}
                aria-label="view"
                onClick={() => setShowMinMax(!showMinMax)}
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
            <Tooltip content="Y axes">
              <Dropdown
                content={
                  <Menu>
                    <DropdownWrapper>
                      <Flex>
                        <DropdownTitle>Y axis</DropdownTitle>
                      </Flex>
                      <Flex direction="row">
                        <Switch
                          name="toggleYAxis"
                          value={showYAxis}
                          onChange={() => setShowYAxis(!showYAxis)}
                        >
                          Show Y axes
                        </Switch>
                      </Flex>
                    </DropdownWrapper>
                  </Menu>
                }
              >
                <>
                  <Button
                    icon="YAxis"
                    type="ghost"
                    aria-label="view"
                    style={{ paddingRight: 8, marginLeft: 4 }}
                  >
                    <Icon type="CaretDown" />
                  </Button>
                </>
              </Dropdown>
            </Tooltip>
            <Tooltip content={`${stackedMode ? 'Disable' : 'Enable'} stacking`}>
              <Button
                icon="ChartStackedView"
                type={stackedMode ? 'link' : 'ghost'}
                onClick={() => setStackedMode(!stackedMode)}
                aria-label="view"
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
            <Divider />
            <DateRangeSelector chart={chart} />
          </section>
        </Header>
        <ChartContainer>
          <SplitPaneLayout defaultSize={200}>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <PlotlyChartComponent
                  key={chartId}
                  chartId={chartId}
                  isInSearch={showSearch}
                  isYAxisShown={showYAxis}
                  isMinMaxShown={showMinMax}
                  isGridlinesShown={showGridlines}
                  stackedMode={stackedMode}
                />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-sources">
                  {(provided) => (
                    <div style={{ display: 'flex', height: '100%' }}>
                      <SourceTableWrapper>
                        <SourceTable ref={provided.innerRef}>
                          <thead>{sourceTableHeaderRow}</thead>
                          <tbody>
                            <SourceRows
                              draggable
                              chart={chart}
                              updateChart={updateChart}
                              mode={workspaceMode}
                              selectedSourceId={selectedSourceId}
                              openNodeEditor={openNodeEditor}
                              onRowClick={handleSourceClick}
                              onInfoClick={handleInfoClick}
                              dateFrom={chart.dateFrom}
                              dateTo={chart.dateTo}
                            />
                            {provided.placeholder}
                          </tbody>
                        </SourceTable>
                      </SourceTableWrapper>
                      {workspaceMode === 'editor' && !!selectedSourceId && (
                        <NodeEditor
                          mutate={updateChart}
                          workflowId={selectedSourceId}
                          closeNodeEditor={closeNodeEditor}
                          chart={chart}
                        />
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
      </ContentWrapper>
      <DetailsSidebar
        visible={showContextMenu}
        onClose={handleCloseContextMenu}
        sourceItem={selectedSourceItem}
      />
    </ChartViewContainer>
  );
};

const WarningAlert = styled(Alert)`
  .ant-alert-message {
    color: var(--cogs-text-warning);
  }
`;

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin-left: 10px;
`;

const DropdownTitle = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 12px;
  margin: 0 0 8px 0;
`;

const DropdownWrapper = styled.div`
  padding: 8px;
`;

export default ChartView;
