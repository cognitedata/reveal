import { useCallback, useEffect, useMemo, useState } from 'react';
import get from 'lodash/get';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import {
  Button,
  Icon,
  toast,
  Tooltip,
  Dropdown,
  Menu,
  Switch,
  Loader,
} from '@cognite/cogs.js';
import { Alert } from 'antd';
import {
  useParams,
  useRouteMatch,
  Switch as RouterSwitch,
  Route,
} from 'react-router-dom';
import NodeEditor from 'components/NodeEditor/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import Search from 'components/Search';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/chart/types';
import { getEntryColor } from 'utils/colors';
import { useSearchParam } from 'hooks/navigation';
import { SEARCH_KEY } from 'utils/constants';
import { metrics, shouldTrackMetrics, trackUsage } from 'services/metrics';
import { ITimer } from '@cognite/metrics';
import { Modes } from 'pages/types';
import DetailsSidebar from 'components/DetailsSidebar';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
  addWorkflow,
  updateChartDateRange,
  updateSourceCollectionOrder,
  updateVisibilityForAllSources,
  updateWorkflowsToSupportVersions,
} from 'models/chart/updates';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';

import { Elements } from 'react-flow-renderer';
import {
  NodeDataDehydratedVariants,
  NodeTypes,
} from 'components/NodeEditor/V2/types';
import TimePeriodSelector from 'components/TimePeriodSelector';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import { FileView } from 'pages/FileView/FileView';
import { useIsChartOwner } from 'hooks/user';
import SourceRows from './SourceRows';

import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  Header,
  SourceTable,
  SourceTableWrapper,
  TopPaneWrapper,
} from './elements';

type ChartViewProps = {
  chartId: string;
};

const CHART_SETTINGS_KEYS = {
  SHOW_Y_AXIS: 'showYAxis',
  SHOW_MIN_MAX: 'showMinMax',
  SHOW_GRIDLINES: 'showGridlines',
  MERGE_UNITS: 'mergeUnits',
};

const defaultTranslations = makeDefaultTranslations(
  'Chart could not be saved!',
  'Could not load chart',
  'This chart does not seem to exist. You might not have access',
  'Add time series',
  'Add calculation',
  'View only. Duplicate to edit.',
  'Hide gridlines',
  'Show gridlines',
  'Hide min/max',
  'Show min/max',
  'Y axes',
  'Y axis',
  'Show Y axes',
  'Merge units',
  'Disable stacking',
  'Enable stacking'
);

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [query = '', setQuery] = useSearchParam(SEARCH_KEY, false);
  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: login } = useUserInfo();
  const { path } = useRouteMatch();

  /**
   * Get stored chart
   */
  const { data: originalChart, isError, isFetched } = useChart(chartId);

  /**
   * Get local chart context
   */
  const [chart, setChart] = useRecoilState(chartAtom);

  /**
   * Check if you own the chart
   */
  const isChartOwner = useIsChartOwner(chart);

  /**
   * Method for updating storage value of chart
   */
  const {
    mutate: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  /**
   * Initialize local chart atom
   */
  useEffect(() => {
    if ((chart && chart.id === chartId) || !originalChart) {
      return;
    }

    /**
     * Fallback date range to default 1M if saved dates are not valid
     */
    const dateFrom = Date.parse(originalChart.dateFrom!)
      ? originalChart.dateFrom!
      : dayjs().subtract(1, 'M').toISOString();
    const dateTo = Date.parse(originalChart.dateTo!)
      ? originalChart.dateTo!
      : dayjs().toISOString();

    const updatedChart = [originalChart]
      .map((_chart) => updateChartDateRange(_chart, dateFrom, dateTo))
      /**
       * Convert/migrate from v2 format to v3 (toolFunction -> selectedOperation, functionData -> parameterValues, etc...)
       */
      .map((_chart) => updateWorkflowsToSupportVersions(_chart))[0];

    /**
     * Add chart to local state atom
     */
    setChart(updatedChart);
  }, [originalChart, chart, chartId, setChart]);

  /**
   * Sync local chart atom to storage
   */
  useEffect(() => {
    if (chart) {
      updateChart(chart);
    }
  }, [chart, updateChart]);

  /**
   * Translations for ChartView
   */

  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ChartView').t,
  };

  /**
   * Translations for Source Table
   */
  const { t: sourceTableTranslation } = useTranslations(
    SourceTableHeader.translationKeys,
    'SourceTableHeader'
  );

  const { t: nodeEditorTranslations } = useTranslations(
    NodeEditor.translationKeys,
    'NodeEditor'
  );

  const [selectedSourceId, setSelectedSourceId] = useState<
    string | undefined
  >();

  const [showSearch, setShowSearch] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<Modes>('workspace');
  const [stackedMode, setStackedMode] = useState<boolean>(false);
  const [editorTimer, setEditorTimer] = useState<ITimer | undefined>();

  const showYAxis = get(chart, 'settings.showYAxis', true);
  const showMinMax = get(chart, 'settings.showMinMax', false);
  const showGridlines = get(chart, 'settings.showGridlines', true);
  const mergeUnits = get(chart, 'settings.mergeUnits', true);

  useEffect(() => {
    if (!shouldTrackMetrics) {
      return () => {};
    }
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

  const translatedChartNotSavedError = t['Chart could not be saved!'];
  useEffect(() => {
    if (updateError) {
      toast.error(translatedChartNotSavedError, { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg, translatedChartNotSavedError]);

  /**
   * Open search drawer if query is present in the url
   */
  useEffect(() => {
    if (query !== '' && !showSearch) {
      setShowSearch(true);
    }
  }, [query, showSearch]);

  const openNodeEditor = useCallback(() => {
    setWorkspaceMode('editor');
    if (!editorTimer && shouldTrackMetrics) {
      setEditorTimer(
        metrics.start('NodeEditor.ViewTime', {
          editor:
            chart?.workflowCollection?.find((wf) => wf.id === selectedSourceId)
              ?.version === 'v2'
              ? 'React Flow'
              : 'Connect',
        })
      );
    }
  }, [chart?.workflowCollection, editorTimer, selectedSourceId]);

  const handleCloseEditor = useCallback(() => {
    setWorkspaceMode('workspace');
    if (editorTimer) {
      editorTimer.stop();
      setEditorTimer(undefined);
    }
  }, [editorTimer]);

  const handleClickNewWorkflow = useCallback(() => {
    if (!chart) {
      return;
    }

    const newWorkflowId = uuidv4();

    /**
     * The current template is just an output node
     * that's added for you (but it could be anything!)
     */
    const elementsTemplate: Elements<NodeDataDehydratedVariants> = [
      {
        id: uuidv4(),
        type: NodeTypes.OUTPUT,
        position: { x: 400, y: 150 },
      },
    ];

    const newWorkflow: ChartWorkflowV2 = {
      version: 'v2',
      id: newWorkflowId,
      name: 'New Calculation',
      color: getEntryColor(chart.id, newWorkflowId),
      flow: {
        elements: elementsTemplate,
        position: [0, 0],
        zoom: 1,
      },
      lineWeight: 1,
      lineStyle: 'solid',
      enabled: true,
      createdAt: Date.now(),
      unit: '',
      preferredUnit: '',
      settings: { autoAlign: true },
    };

    setChart((oldChart) => addWorkflow(oldChart!, newWorkflow));
    setSelectedSourceId(newWorkflowId);
    openNodeEditor();
    trackUsage('ChartView.AddCalculation');
  }, [chart, setChart, openNodeEditor]);

  const handleSourceClick = useCallback((sourceId?: string) => {
    setSelectedSourceId(sourceId);
  }, []);

  const handleInfoClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showContextMenu : true;
      setShowContextMenu(showMenu);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    [selectedSourceId, showContextMenu]
  );

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
    trackUsage('ChartView.OpenSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setQuery('');
    trackUsage('ChartView.CloseSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, [setQuery]);

  const handleSettingsToggle = useCallback(
    (key: string, value: boolean) => {
      setChart((oldChart) => ({
        ...oldChart!,
        settings: {
          showYAxis,
          showMinMax,
          showGridlines,
          mergeUnits,
          [key]: value,
        },
      }));
    },
    [mergeUnits, setChart, showGridlines, showMinMax, showYAxis]
  );

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) {
        return;
      }

      setChart((oldChart) =>
        updateSourceCollectionOrder(
          oldChart!,
          result.source.index,
          result.destination.index
        )
      );
    },
    [setChart]
  );

  const sources = useMemo(
    () => [
      ...(chart?.timeSeriesCollection || []).map(
        (ts) =>
          ({
            type: 'timeseries',
            ...ts,
          } as ChartTimeSeries)
      ),
      ...(chart?.workflowCollection || []).map(
        (wf) =>
          ({
            type: 'workflow',
            ...wf,
          } as ChartWorkflow)
      ),
    ],
    [chart?.timeSeriesCollection, chart?.workflowCollection]
  );

  const isEveryRowHidden = sources.every(({ enabled }) => !enabled);

  const handleShowHideButtonClick = useCallback(() => {
    setChart((oldChart) =>
      updateVisibilityForAllSources(oldChart!, isEveryRowHidden)
    );
  }, [setChart, isEveryRowHidden]);

  if (!isFetched || (isFetched && originalChart && !chart)) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div>
        <p>{t['Could not load chart']}</p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div>
        {t['This chart does not seem to exist. You might not have access']}
      </div>
    );
  }

  const selectedSourceItem = sources.find((s) => s.id === selectedSourceId);

  return (
    <RouterSwitch>
      <Route exact path={path}>
        <ChartViewContainer id="chart-view">
          {showSearch && (
            <Search visible={showSearch} onClose={handleCloseSearch} />
          )}
          <ContentWrapper showSearch={showSearch}>
            <Header className="downloadChartHide" inSearch={showSearch}>
              {!showSearch && (
                <section className="actions">
                  <Button icon="Add" type="primary" onClick={handleOpenSearch}>
                    {t['Add time series']}
                  </Button>
                  <Button
                    icon="Function"
                    type="ghost"
                    onClick={handleClickNewWorkflow}
                  >
                    {t['Add calculation']}
                  </Button>
                </section>
              )}
              {login?.id && !isChartOwner && (
                <section>
                  <WarningAlert
                    type="warning"
                    message={t['View only. Duplicate to edit.']}
                    icon={<Icon type="Info" />}
                    showIcon
                  />
                </section>
              )}
              <section className="daterange">
                <Tooltip
                  content={`${
                    showGridlines ? t['Hide gridlines'] : t['Show gridlines']
                  }`}
                >
                  <Button
                    icon="GridLines"
                    type={showGridlines ? 'link' : 'ghost'}
                    aria-label="view"
                    onClick={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.SHOW_GRIDLINES,
                        !showGridlines
                      )
                    }
                    style={{ marginLeft: 4 }}
                  />
                </Tooltip>
                <Tooltip
                  content={`${
                    showMinMax ? ['Hide min/max'] : t['Show min/max']
                  }`}
                >
                  <Button
                    icon="Timeseries"
                    type={showMinMax ? 'link' : 'ghost'}
                    aria-label="view"
                    onClick={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.SHOW_MIN_MAX,
                        !showMinMax
                      )
                    }
                    style={{ marginLeft: 4 }}
                  />
                </Tooltip>
                <Tooltip content={t['Y axes']}>
                  <Dropdown
                    content={
                      <Menu>
                        <DropdownWrapper>
                          <DropdownTitle>{t['Y axis']}</DropdownTitle>
                          <Switch
                            name="toggleYAxis"
                            value={showYAxis}
                            onChange={() =>
                              handleSettingsToggle(
                                CHART_SETTINGS_KEYS.SHOW_Y_AXIS,
                                !showYAxis
                              )
                            }
                            style={{ marginBottom: 15 }}
                          >
                            {t['Show Y axes']}
                          </Switch>
                          <Switch
                            name="toggleUnitMerging"
                            value={mergeUnits}
                            onChange={() =>
                              handleSettingsToggle(
                                CHART_SETTINGS_KEYS.MERGE_UNITS,
                                !mergeUnits
                              )
                            }
                          >
                            {t['Merge units']}
                          </Switch>
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
                <Tooltip
                  content={`${
                    stackedMode ? t['Disable stacking'] : t['Enable stacking']
                  }`}
                >
                  <Button
                    icon="StackedChart"
                    type={stackedMode ? 'link' : 'ghost'}
                    onClick={() => setStackedMode(!stackedMode)}
                    aria-label="view"
                    style={{ marginLeft: 4 }}
                  />
                </Tooltip>
                <Divider />
                <RangeWrapper>
                  <RangeColumn>
                    <TimePeriodSelector />
                  </RangeColumn>
                  <RangeColumn>
                    <DateRangeSelector />
                  </RangeColumn>
                </RangeWrapper>
              </section>
            </Header>
            <ChartContainer>
              <SplitPaneLayout defaultSize={200}>
                <TopPaneWrapper className="chart">
                  <ChartWrapper>
                    <PlotlyChartComponent
                      key={chartId}
                      chart={chart}
                      isInSearch={showSearch}
                      isYAxisShown={showYAxis}
                      isMinMaxShown={showMinMax}
                      isGridlinesShown={showGridlines}
                      stackedMode={stackedMode}
                      mergeUnits={mergeUnits}
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
                              <SourceTableHeader
                                mode={workspaceMode}
                                onShowHideButtonClick={
                                  handleShowHideButtonClick
                                }
                                translations={sourceTableTranslation}
                                showHideIconState={!isEveryRowHidden}
                              />
                              <tbody>
                                <SourceRows
                                  draggable
                                  chart={chart}
                                  updateChart={setChart}
                                  mode={workspaceMode}
                                  selectedSourceId={selectedSourceId}
                                  openNodeEditor={openNodeEditor}
                                  onRowClick={handleSourceClick}
                                  onInfoClick={handleInfoClick}
                                />
                                {provided.placeholder}
                              </tbody>
                            </SourceTable>
                          </SourceTableWrapper>
                          {workspaceMode === 'editor' && !!selectedSourceId && (
                            <NodeEditor
                              setChart={setChart}
                              workflowId={selectedSourceId}
                              onClose={handleCloseEditor}
                              chart={chart}
                              translations={nodeEditorTranslations}
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
      </Route>
      <Route
        path={`${path}/files/:assetId`}
        render={({ match }) => (
          <FileView
            chart={chart}
            setChart={setChart}
            assetId={match.params.assetId}
          />
        )}
      />
    </RouterSwitch>
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
  margin-bottom: 15px;
`;

const DropdownWrapper = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const RangeColumn = styled.div`
  margin: 2px 6px;
`;

export default ChartView;
