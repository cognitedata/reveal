import { useCallback, useEffect, useMemo, useState } from 'react';
import get from 'lodash/get';
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
import { useUpdateChart } from 'hooks/charts-storage';
import {
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/chart/types';
import { useSearchParam } from 'hooks/navigation';
import { SEARCH_KEY } from 'utils/constants';
import { startTimer, stopTimer, trackUsage } from 'services/metrics';
import { Modes } from 'pages/types';
import {
  addWorkflows,
  duplicateWorkflow,
  initializeSourceCollection,
  removeSource,
  updateChartSource,
  updateSourceCollectionOrder,
  updateVisibilityForAllSources,
} from 'models/chart/updates';
import { useRecoilState, useRecoilValue } from 'recoil';
import chartAtom from 'models/chart/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import { FileView } from 'pages/FileView/FileView';
import { useIsChartOwner } from 'hooks/user';
import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import ThresholdSidebar from 'components/Thresholds/ThresholdSidebar';
import SearchSidebar from 'components/Search/SearchSidebar';
import SourceTable from 'components/SourceTable/SourceTable';
import { timeseriesAtom } from 'models/timeseries-results/atom';
import {
  availableWorkflows,
  calculationSummaries,
} from 'models/calculation-results/selectors';
import { TimeseriesCollectionEffects } from 'effects/timeseries';
import { CalculationCollectionEffects } from 'effects/calculations';
import { flow } from 'lodash';
import { getUnitConverter } from 'utils/units';
import { timeseriesSummaries } from 'models/timeseries-results/selectors';
import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  TopPaneWrapper,
} from './elements';
import ChartViewHeader from './ChartViewHeader';
import {
  useInitializedChart,
  useStatistics,
  useUploadCalculations,
} from './hooks';

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
   * Get local initialized chart
   */
  const { data: chart, isError, isLoading } = useInitializedChart(chartId);

  /**
   * Get local chart context
   */
  const [, setChart] = useRecoilState(chartAtom);

  /**
   * Check if you own the chart
   */
  const isChartOwner = useIsChartOwner(chart);

  /**
   * Get stored results for timeseries and calculations
   */
  const timeseriesData = useRecoilValue(timeseriesAtom);
  const calculationData = useRecoilValue(availableWorkflows);

  /**
   * Method for updating storage value of chart
   */
  const { isError: updateError, error: updateErrorMsg } = useUpdateChart();

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
   * Initialize sort order collection
   */
  useEffect(() => {
    if (!chart) {
      return;
    }

    if (!chart.sourceCollection || chart.sourceCollection === undefined) {
      setChart((oldChart) => initializeSourceCollection(oldChart!));
    }
  }, [chart, setChart]);

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

  const handleMoveSource = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setChart((oldChart) =>
        updateSourceCollectionOrder(oldChart!, sourceIndex, destinationIndex)
      );
    },
    [setChart]
  );

  const sources = useMemo(() => {
    return (chart?.sourceCollection ?? [])
      .map((x) =>
        x.type === 'timeseries'
          ? {
              type: 'timeseries',
              ...chart?.timeSeriesCollection?.find((ts) => ts.id === x.id),
            }
          : {
              type: 'workflow',
              ...chart?.workflowCollection?.find((calc) => calc.id === x.id),
            }
      )
      .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
  }, [
    chart?.sourceCollection,
    chart?.timeSeriesCollection,
    chart?.workflowCollection,
  ]);

  const isEveryRowHidden = sources.every(({ enabled }) => !enabled);

  const handleShowHideButtonClick = useCallback(() => {
    setChart((oldChart) =>
      updateVisibilityForAllSources(oldChart!, isEveryRowHidden)
    );
  }, [setChart, isEveryRowHidden]);

  const handleImportCalculationsSuccess = useCallback(
    (calculations: ChartWorkflowV2[]) => {
      setChart((oldChart) => addWorkflows(oldChart!, calculations));
      toast.success('Calculations imported successfully!');
    },
    [setChart]
  );

  const handleImportCalculationsError = useCallback(() => {
    toast.error('Invalid file format or content');
  }, []);

  /**
   * File upload handling
   */
  const openFileSelector = useUploadCalculations({
    onSuccess: handleImportCalculationsSuccess,
    onError: handleImportCalculationsError,
  });

  /**
   * Get source item currently active
   */
  const selectedSourceItem = sources.find((s) => s.id === selectedSourceId);

  /**
   * Statistics results (for active item)
   */
  const { results: statisticsResult, status: statisticsStatus } = useStatistics(
    selectedSourceItem,
    chart?.dateFrom || new Date().toISOString(),
    chart?.dateTo || new Date().toISOString(),
    showContextMenu
  );

  const handleUpdateChartSource = useCallback(
    (sourceId: string, diff: Partial<ChartTimeSeries | ChartWorkflow>) =>
      setChart((oldChart) => updateChartSource(oldChart!, sourceId, diff)),
    [setChart]
  );

  const handleOverrideUnitClick =
    (source: ChartTimeSeries | ChartWorkflow) => (unitOption: any) => {
      const currentInputUnit = source.unit;
      const currentOutputUnit = source.preferredUnit;
      const nextInputUnit = unitOption?.value;

      const min = source.range?.[0];
      const max = source.range?.[1];
      const hasValidRange = typeof min === 'number' && typeof max === 'number';

      const convert = flow(
        getUnitConverter(currentOutputUnit, currentInputUnit),
        getUnitConverter(nextInputUnit, currentOutputUnit)
      );

      const range = hasValidRange ? [convert(min!), convert(max!)] : [];

      /**
       * Update unit and corresponding converted range
       */
      handleUpdateChartSource(source.id, {
        unit: unitOption.value,
        range,
      });
    };

  const handleConversionUnitClick =
    (source: ChartTimeSeries | ChartWorkflow) => (unitOption: any) => {
      const currentInputUnit = source.unit;
      const currentOutputUnit = source.preferredUnit;
      const nextOutputUnit = unitOption?.value;

      const min = source.range?.[0];
      const max = source.range?.[1];

      const hasValidRange = typeof min === 'number' && typeof max === 'number';

      const convert = flow(
        getUnitConverter(currentOutputUnit, currentInputUnit),
        getUnitConverter(currentInputUnit, nextOutputUnit)
      );

      const range = hasValidRange ? [convert(min!), convert(max!)] : [];

      /**
       * Update unit and corresponding converted range
       */
      handleUpdateChartSource(source.id, {
        preferredUnit: unitOption?.value,
        range,
      });
    };

  const handleCustomUnitLabelClick =
    (source: ChartTimeSeries | ChartWorkflow) => (label: string) => {
      handleUpdateChartSource(source.id, {
        customUnitLabel: label,
        preferredUnit: '',
        unit: '',
      });
    };

  const handleResetUnitClick =
    (source: ChartTimeSeries | ChartWorkflow) => () => {
      const currentInputUnit = source.unit;
      const currentOutputUnit = source.preferredUnit;

      const min = source.range?.[0];
      const max = source.range?.[1];
      const convertUnit = getUnitConverter(currentOutputUnit, currentInputUnit);
      const hasValidRange = typeof min === 'number' && typeof max === 'number';
      const range = hasValidRange ? [convertUnit(min), convertUnit(max)] : [];

      /**
       * Update units and corresponding converted range
       */
      handleUpdateChartSource(source.id, {
        unit: '',
        preferredUnit: '',
        customUnitLabel: '',
        range,
      });
    };

  const handleStatusIconClick =
    (source: ChartTimeSeries | ChartWorkflow) => () => {
      setChart((oldChart) => ({
        ...oldChart!,
        timeSeriesCollection: oldChart!.timeSeriesCollection?.map((ts) =>
          ts.id === source.id
            ? {
                ...ts,
                enabled: !ts.enabled,
              }
            : ts
        ),
        workflowCollection: oldChart!.workflowCollection?.map((wf) =>
          wf.id === source.id
            ? {
                ...wf,
                enabled: !wf.enabled,
              }
            : wf
        ),
      }));
    };

  const handleRemoveSourceClick =
    (source: ChartTimeSeries | ChartWorkflow) => () =>
      setChart((oldChart) => removeSource(oldChart!, source.id));

  const handleUpdateAppearance =
    (source: ChartTimeSeries | ChartWorkflow) =>
    (diff: Partial<ChartTimeSeries | ChartWorkflow>) =>
      setChart((oldChart) => ({
        ...oldChart!,
        timeSeriesCollection: oldChart!.timeSeriesCollection?.map((ts) =>
          ts.id === source.id
            ? {
                ...ts,
                ...diff,
              }
            : ts
        ),
        workflowCollection: oldChart!.workflowCollection?.map((wf) =>
          wf.id === source.id
            ? {
                ...(wf as ChartWorkflowV2),
                ...(diff as Partial<ChartWorkflowV2>),
              }
            : wf
        ),
      }));

  const handleUpdateName =
    (source: ChartTimeSeries | ChartWorkflow) => (value: string) => {
      handleUpdateChartSource(source.id, {
        name: value,
      });
    };

  const handleDuplicateCalculation =
    (source: ChartTimeSeries | ChartWorkflow) => () => {
      const wf = chart?.workflowCollection?.find((wfc) => wfc.id === source.id);
      if (wf) {
        setChart((oldChart) => duplicateWorkflow(oldChart!, source.id));
      }
    };

  const summaries = {
    ...useRecoilValue(timeseriesSummaries),
    ...useRecoilValue(calculationSummaries),
  };

  if (isLoading) {
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

  return (
    <>
      <TimeseriesCollectionEffects />
      <CalculationCollectionEffects />
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
                        timeseriesData={timeseriesData}
                        calculationsData={calculationData}
                      />
                    </ChartWrapper>
                  </TopPaneWrapper>
                  <BottomPaneWrapper className="table">
                    <div style={{ display: 'flex', height: '100%' }}>
                      <SourceTable
                        mode={workspaceMode}
                        sources={sources}
                        summaries={summaries}
                        isEveryRowHidden={isEveryRowHidden}
                        headerTranslations={sourceTableTranslation}
                        selectedSourceId={selectedSourceId}
                        openNodeEditor={openNodeEditor}
                        onRowClick={handleSourceClick}
                        onInfoClick={handleInfoClick}
                        onThresholdClick={handleThresholdClick}
                        onShowHideButtonClick={handleShowHideButtonClick}
                        timeseriesData={timeseriesData}
                        calculationData={calculationData}
                        onConversionUnitClick={handleConversionUnitClick}
                        onCustomUnitLabelClick={handleCustomUnitLabelClick}
                        onOverrideUnitClick={handleOverrideUnitClick}
                        onResetUnitClick={handleResetUnitClick}
                        onStatusIconClick={handleStatusIconClick}
                        onRemoveSourceClick={handleRemoveSourceClick}
                        onUpdateAppearance={handleUpdateAppearance}
                        onUpdateName={handleUpdateName}
                        onDuplicateCalculation={handleDuplicateCalculation}
                        onMoveSource={handleMoveSource}
                      />
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
                  </BottomPaneWrapper>
                </SplitPaneLayout>
              </ChartContainer>
            </ContentWrapper>
            <DetailsSidebar
              visible={showContextMenu}
              onClose={handleCloseContextMenu}
              sourceItem={selectedSourceItem}
              statisticsResult={statisticsResult}
              statisticsStatus={statisticsStatus}
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
            <FileView chart={chart} assetId={match.params.assetId} />
          )}
        />
      </RouterSwitch>
    </>
  );
};

export default ChartView;
