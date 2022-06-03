import { useCallback, useEffect, useMemo, useState } from 'react';
import get from 'lodash/get';
import dayjs from 'dayjs';
import { toast, Loader } from '@cognite/cogs.js';
import {
  useParams,
  useRouteMatch,
  Switch as RouterSwitch,
  Route,
} from 'react-router-dom';
import NodeEditor from 'components/NodeEditor/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import ChartPlotContainer from 'components/PlotlyChart/ChartPlotContainer';
import { useChart, useUpdateChart } from 'hooks/charts-storage';
import {
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/chart/types';
import { useSearchParam } from 'hooks/navigation';
import { SEARCH_KEY } from 'utils/constants';
import { startTimer, stopTimer, trackUsage } from 'services/metrics';
import { Modes } from 'pages/types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
  addWorkflows,
  updateChartDateRange,
  updateSourceCollectionOrder,
  updateVisibilityForAllSources,
  updateWorkflowsFromV1toV2,
  updateWorkflowsToSupportVersions,
} from 'models/chart/updates';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';

import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import { FileView } from 'pages/FileView/FileView';
import { useIsChartOwner } from 'hooks/user';
import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import ThresholdSidebar from 'components/Thresholds/ThresholdSidebar';
import SearchSidebar from 'components/Search/SearchSidebar';
import { useFilePicker } from 'use-file-picker';
import SourceTable from 'pages/ChartView/SourceTable';

import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  SourceTableWrapper,
  TopPaneWrapper,
} from './elements';
import ChartViewHeader from './ChartViewHeader';

type ChartViewProps = {
  chartId: string;
};

const defaultTranslations = makeDefaultTranslations(
  'Chart could not be saved!',
  'Could not load chart',
  'This chart does not seem to exist. You might not have access'
);

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showThresholdMenu, setShowThresholdMenu] = useState(false);
  const [query = '', setQuery] = useSearchParam(SEARCH_KEY, false);
  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
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
   * Get all available operations (needed for migration)
   */
  const [, , operations] = useAvailableOps();

  /**
   * Initialize local chart atom
   */
  useEffect(() => {
    if ((chart && chart.id === chartId) || !originalChart) {
      return;
    }

    if (!operations || !operations.length) {
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
       * Convert/migrate workflows using @cognite/connect to the format supported by React Flow (v2)
       */
      .map((_chart) => updateWorkflowsFromV1toV2(_chart, operations))
      /**
       * Convert/migrate from v2 format to v3 (toolFunction -> selectedOperation, functionData -> parameterValues, etc...)
       */
      .map((_chart) => updateWorkflowsToSupportVersions(_chart))[0];

    /**
     * Add chart to local state atom
     */
    setChart(updatedChart);
  }, [originalChart, chart, chartId, setChart, operations]);

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

  const { t: ChartViewHeaderTranslations } = useTranslations(
    ChartViewHeader.translationKeys,
    'ChartView'
  );

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

  const showYAxis = get(chart, 'settings.showYAxis', true);
  const showMinMax = get(chart, 'settings.showMinMax', false);
  const showGridlines = get(chart, 'settings.showGridlines', true);
  const mergeUnits = get(chart, 'settings.mergeUnits', true);

  useEffect(() => {
    trackUsage('PageView.ChartView', {
      isOwner: isChartOwner,
    });
    startTimer('ChartView.ViewTime');

    return () => {
      stopTimer('ChartView.ViewTime');
      if (workspaceMode === 'editor') {
        stopTimer('NodeEditor.ViewTime');
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
    startTimer('NodeEditor.ViewTime');
  }, []);

  const handleCloseEditor = useCallback(() => {
    setWorkspaceMode('workspace');
    stopTimer('NodeEditor.ViewTime');
  }, []);

  const handleSourceClick = useCallback((sourceId?: string) => {
    setSelectedSourceId(sourceId);
  }, []);

  const handleInfoClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showContextMenu : true;
      setShowContextMenu(showMenu);
      setShowThresholdMenu(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    [selectedSourceId, showContextMenu]
  );

  const handleThresholdClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showThresholdMenu : true;
      setShowThresholdMenu(showMenu);
      setShowContextMenu(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    [selectedSourceId, showThresholdMenu]
  );

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseThresholdMenu = useCallback(() => {
    setShowThresholdMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setQuery('');
    trackUsage('ChartView.CloseSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, [setQuery]);

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

  /**
   * File upload handling
   */
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.json',
    readAs: 'Text',
  });

  const handleImportCalculations = useCallback(
    (string) => {
      let calculations: ChartWorkflowV2[] = [];
      try {
        calculations = JSON.parse(string);
      } catch (err) {
        toast.error('Invalid file format or content');
      }
      setChart((oldChart) => addWorkflows(oldChart!, calculations));
      toast.success('Calculations imported successfully!');
    },
    [setChart]
  );

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!filesContent.length) {
      return;
    }
    handleImportCalculations(filesContent[0].content);
  }, [filesContent, loading, handleImportCalculations]);

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
            <SearchSidebar visible={showSearch} onClose={handleCloseSearch} />
          )}
          <ContentWrapper showSearch={showSearch}>
            <ChartViewHeader
              chart={chart}
              setChart={setChart}
              stackedMode={stackedMode}
              setStackedMode={setStackedMode}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              translations={ChartViewHeaderTranslations}
              showYAxis={showYAxis}
              showMinMax={showMinMax}
              showGridlines={showGridlines}
              mergeUnits={mergeUnits}
              openNodeEditor={openNodeEditor}
              openFileSelector={openFileSelector}
              setSelectedSourceId={setSelectedSourceId}
            />
            <ChartContainer>
              <SplitPaneLayout defaultSize={200}>
                <TopPaneWrapper className="chart">
                  <ChartWrapper>
                    <ChartPlotContainer
                      key={chartId}
                      chart={chart}
                      setChart={setChart}
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
                            <SourceTable
                              mode={workspaceMode}
                              chart={chart}
                              setChart={setChart}
                              provided={provided}
                              isEveryRowHidden={isEveryRowHidden}
                              headerTranslations={sourceTableTranslation}
                              selectedSourceId={selectedSourceId}
                              openNodeEditor={openNodeEditor}
                              onRowClick={handleSourceClick}
                              onInfoClick={handleInfoClick}
                              onThresholdClick={handleThresholdClick}
                              onShowHideButtonClick={handleShowHideButtonClick}
                            />
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
          <ThresholdSidebar
            visible={showThresholdMenu}
            onClose={handleCloseThresholdMenu}
            updateChart={setChart}
            chart={chart}
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

export default ChartView;
