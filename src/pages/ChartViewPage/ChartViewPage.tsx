import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import get from 'lodash/get';
import { useFlag } from '@cognite/react-feature-flags';
import { toast, Loader, Button, Tooltip } from '@cognite/cogs.js';
import { useIsChartOwner } from 'hooks/user';
import { useParams } from 'react-router-dom';
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
import {
  SEARCH_KEY,
  ACTIVE_SIDEBAR_KEY,
  EVENT_SIDEBAR_KEY,
  MONITORING_SIDEBAR_KEY,
  ALERTING_SIDEBAR_KEY,
  THRESHOLD_SIDEBAR_KEY,
} from 'utils/constants';
import { startTimer, stopTimer, trackUsage } from 'services/metrics';
import { Modes } from 'pages/types';
import {
  addWorkflow,
  addWorkflows,
  duplicateWorkflow,
  initializeSourceCollection,
  removeSource,
  updateChartDateRange,
  updateChartSource,
  updateSourceCollectionOrder,
  updateVisibilityForAllSources,
} from 'models/chart/updates';
import { useRecoilState, useRecoilValue } from 'recoil';
import chartAtom from 'models/chart/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import ThresholdSidebar from 'components/Thresholds/ThresholdSidebar';
import SearchSidebar from 'components/Search/SearchSidebar';
import { getEntryColor } from 'utils/colors';

import { v4 as uuidv4 } from 'uuid';
import { Elements } from 'react-flow-renderer';

import {
  NodeDataDehydratedVariants,
  NodeTypes,
} from 'components/NodeEditor/V2/types';

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

import { chartSources } from 'models/chart/selectors';
import ChartViewPageAppBar from 'pages/ChartViewPage/ChartViewPageAppBar';
import ChartViewPageSecondaryAppBar from 'pages/ChartViewPage/ChartViewPageSecondaryAppBar';

import PageTitle from 'components/PageTitle/PageTitle';
import ErrorSidebar from 'components/ErrorSidebar/ErrorSidebar';
import { WorkflowState } from 'models/calculation-results/types';
import { Toolbar } from 'components/Common/SidebarElements';
import DataProfilingSidebar from 'components/DataProfilingSidebar/DataProfilingSidebar';
import EventSidebar from 'components/EventSidebar/EventSidebar';
import { eventResultsAtom } from 'models/event-results/atom';
import { EventResultEffects } from 'effects/events';
import MonitoringSidebar from 'components/MonitoringSidebar/MonitoringSidebar';
import AlertingSidebar from 'components/AlertingSidebar/AlertingSidebar';
import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  TopPaneWrapper,
} from './elements';
import ChartViewHeader from './ChartViewHeader';
import { ChartActionButton } from './ChartActionButton';
import {
  useInitializedChart,
  useStatistics,
  useUploadCalculations,
} from './hooks';

const defaultTranslations = makeDefaultTranslations(
  'Data Profiling',
  'Monitoring',
  'Alerting',
  'Threshold',
  'Events',
  'Chart could not be saved!',
  'Could not load chart',
  'This chart does not seem to exist. You might not have access',
  'All charts'
);

const keys = translationKeys(defaultTranslations);

const ChartViewPage = () => {
  const { isEnabled: isMonitoringEnabled } = useFlag('CHARTS_UI_MONITORING', {
    fallback: false,
    forceRerender: true,
  });
  const { isEnabled: isDataProfilingEnabled } = useFlag(
    'CHARTS_UI_DATAPROFILING',
    {
      fallback: false,
      forceRerender: true,
    }
  );
  const [activeSidebar = '', setActiveSidebarQuery] =
    useSearchParam(ACTIVE_SIDEBAR_KEY);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDataProfilingSidebar, setShowDataProfilingSidebar] =
    useState(false);
  const [showThresholdSidebar, setShowThresholdSidebar] = useState(
    activeSidebar === THRESHOLD_SIDEBAR_KEY
  );
  const [showMonitoringSidebar, setShowMonitoringSidebar] = useState(
    activeSidebar === MONITORING_SIDEBAR_KEY
  );
  const [showAlertingSidebar, setShowAlertingSidebar] = useState(
    activeSidebar === ALERTING_SIDEBAR_KEY
  );
  const [showErrorSidebar, setShowErrorSidebar] = useState(false);
  const [showEventSidebar, setShowEventSidebar] = useState(
    activeSidebar === EVENT_SIDEBAR_KEY
  );
  const [query = '', setQuery] = useSearchParam(SEARCH_KEY);
  const { chartId = '' } = useParams<{ chartId: string }>();
  /**
   * Get local initialized chart
   */
  const {
    data: chart,
    isError,
    isLoading,
  } = useInitializedChart(chartId || '');

  /**
   * Get local chart context
   */
  const [, setChart] = useRecoilState(chartAtom);

  /**
   * Check if you own the chart
   */
  const isChartOwner = useIsChartOwner(chart);

  /**
   * Get stored results for timeseries, calculations and events
   */
  const timeseriesData = useRecoilValue(timeseriesAtom);
  const calculationData = useRecoilValue(availableWorkflows);
  const eventData = useRecoilValue(eventResultsAtom);

  /**
   * Method for updating storage value of chart
   */
  const { isError: updateError, error: updateErrorMsg } = useUpdateChart();

  /**
   * Translations for ChartView
   */
  const t = {
    ...defaultTranslations,
    ...useTranslations(keys, 'ChartView').t,
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

  const calledOnceEffect = useRef(false);
  const [showSearch, setShowSearch] = useState(true);

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

  const sources = useRecoilValue(chartSources);

  useEffect(() => {
    /**
     * We are using this calledOnceEffect here since we dont want the showSearch to
     * become false after the user intentionally opens it by clicking the add time series
     * button
     */
    if (calledOnceEffect.current) {
      return;
    }
    if (isLoading === false) {
      if (sources.length > 0) {
        setShowSearch(false);
        calledOnceEffect.current = true;
      }
    }
  }, [isLoading, sources]);

  useEffect(() => {
    return () => {
      /**
       * We needed to do this because the chart is set in a recoil state
       * so the next time we load this page, the previous chart is still
       * there until the new one is initialized
       */
      setChart(undefined);
    };
  }, [setChart]);

  /**
   * Open search drawer if query is present in the url
   */
  useEffect(() => {
    if (query !== '' && !showSearch) {
      setShowSearch(true);
    }
  }, [query, showSearch]);

  /**
   * Save events visibility on query param
   */
  useEffect(() => {
    if (showEventSidebar) {
      setActiveSidebarQuery(EVENT_SIDEBAR_KEY);
    }
    if (showThresholdSidebar) {
      setActiveSidebarQuery(THRESHOLD_SIDEBAR_KEY);
    }
    if (showAlertingSidebar) {
      setActiveSidebarQuery(ALERTING_SIDEBAR_KEY);
    }
    if (showMonitoringSidebar) {
      setActiveSidebarQuery(MONITORING_SIDEBAR_KEY);
    }
  }, [
    showEventSidebar,
    showThresholdSidebar,
    showMonitoringSidebar,
    showAlertingSidebar,
  ]);

  const openNodeEditor = useCallback(() => {
    setWorkspaceMode('editor');
    startTimer('NodeEditor.ViewTime');
  }, []);

  const handleCloseEditor = useCallback(() => {
    setWorkspaceMode('workspace');
    stopTimer('NodeEditor.ViewTime');
  }, []);

  const handleSourceClick = useCallback(
    (sourceId?: string) => {
      setSelectedSourceId(sourceId);
      const isCalcRow = calculationData.find(
        (calc: WorkflowState) => calc.id === sourceId
      );
      if (!isCalcRow) {
        setShowErrorSidebar(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
      }
    },
    [calculationData]
  );

  const handleInfoClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showContextMenu : true;
      setShowContextMenu(showMenu);
      setShowDataProfilingSidebar(false);
      setShowThresholdSidebar(false);
      setShowErrorSidebar(false);
      setShowEventSidebar(false);
      setShowMonitoringSidebar(false);
      setShowAlertingSidebar(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    [selectedSourceId, showContextMenu]
  );

  const handleDataProfilingSidebarToggle = useCallback(() => {
    setShowContextMenu(false);
    setShowErrorSidebar(false);
    setShowEventSidebar(false);
    setShowThresholdSidebar(false);
    setShowMonitoringSidebar(false);
    setShowAlertingSidebar(false);
    setShowDataProfilingSidebar((prevState) => !prevState);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const handleThresholdSidebarToggle = useCallback(() => {
    setShowContextMenu(false);
    setShowErrorSidebar(false);
    setShowDataProfilingSidebar(false);
    setShowEventSidebar(false);
    setShowMonitoringSidebar(false);
    setShowAlertingSidebar(false);
    setShowThresholdSidebar((prevState) => !prevState);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const handleMonitoringSidebarToggle = useCallback(() => {
    setShowContextMenu(false);
    setShowErrorSidebar(false);
    setShowEventSidebar(false);
    setShowThresholdSidebar(false);
    setShowDataProfilingSidebar(false);
    setShowAlertingSidebar(false);
    setShowMonitoringSidebar((prevState) => !prevState);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const handleAlertingSidebarToggle = useCallback(() => {
    setShowContextMenu(false);
    setShowErrorSidebar(false);
    setShowEventSidebar(false);
    setShowThresholdSidebar(false);
    setShowDataProfilingSidebar(false);
    setShowMonitoringSidebar(false);
    setShowAlertingSidebar((prevState) => !prevState);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const handleErrorIconClick = useCallback(
    (sourceId: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showErrorSidebar : true;
      setShowContextMenu(false);
      setShowThresholdSidebar(false);
      setShowDataProfilingSidebar(false);
      setShowEventSidebar(false);
      setShowErrorSidebar(showMenu);

      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    },
    [selectedSourceId, showErrorSidebar, setShowThresholdSidebar]
  );

  const handleEventSidebarToggle = useCallback(() => {
    setShowContextMenu(false);
    setShowErrorSidebar(false);
    setShowDataProfilingSidebar(false);
    setShowThresholdSidebar(false);
    setShowMonitoringSidebar(false);
    setShowAlertingSidebar(false);
    setShowEventSidebar((prevState) => !prevState);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseThresholdMenu = useCallback(() => {
    setShowThresholdSidebar(false);
    setActiveSidebarQuery('');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseErrorSidebar = useCallback(() => {
    setShowErrorSidebar(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseDataProfilingSidebar = useCallback(() => {
    setShowDataProfilingSidebar(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseMonitoringSidebar = useCallback(() => {
    setShowMonitoringSidebar(false);
    setActiveSidebarQuery('');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseAlertingSidebar = useCallback(() => {
    setShowAlertingSidebar(false);
    setActiveSidebarQuery('');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, []);

  const handleCloseEventSidebar = useCallback(() => {
    setShowEventSidebar(false);
    setActiveSidebarQuery('');
    trackUsage('ChartView.CloseEventSidebar');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, [setActiveSidebarQuery]);

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

  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
    trackUsage('ChartView.OpenSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, [setShowSearch]);

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
  }, [chart, setChart, openNodeEditor, setSelectedSourceId]);

  const handleDateChange: ComponentProps<
    typeof ChartViewHeader
  >['handleDateChange'] = ({ startDate, endDate }) => {
    if (startDate || endDate) {
      setChart((oldChart: any) =>
        updateChartDateRange(oldChart!, startDate, endDate)
      );
    }
  };

  /**
   * File upload handling
   */
  const handleImportCalculationsClick = useUploadCalculations({
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
      <PageTitle title={chart.name} />
      <TimeseriesCollectionEffects />
      <CalculationCollectionEffects />
      <EventResultEffects />
      <ChartViewPageAppBar allChartsLabel={t['All charts']} />
      <ChartViewPageSecondaryAppBar
        handleDateChange={handleDateChange}
        showYAxis={showYAxis}
        showMinMax={showMinMax}
        showGridlines={showGridlines}
        mergeUnits={mergeUnits}
        stackedMode={stackedMode}
        setStackedMode={setStackedMode}
        handleSettingsToggle={handleSettingsToggle}
      />
      <ChartViewContainer id="chart-view">
        {showSearch && (
          <SearchSidebar visible={showSearch} onClose={handleCloseSearch} />
        )}
        <ContentWrapper showSearch={showSearch}>
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
                    eventData={eventData}
                  />
                </ChartWrapper>
                <ChartActionButton
                  handleOpenSearch={handleOpenSearch}
                  handleClickNewWorkflow={handleClickNewWorkflow}
                  handleImportCalculationsClick={handleImportCalculationsClick}
                />
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
                    onErrorIconClick={handleErrorIconClick}
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
                      onErrorIconClick={handleErrorIconClick}
                      chart={chart}
                      translations={nodeEditorTranslations}
                    />
                  )}
                </div>
              </BottomPaneWrapper>
            </SplitPaneLayout>
          </ChartContainer>
        </ContentWrapper>
        {showContextMenu && (
          <DetailsSidebar
            visible={showContextMenu}
            onClose={handleCloseContextMenu}
            sourceItem={selectedSourceItem}
            statisticsResult={statisticsResult}
            statisticsStatus={statisticsStatus}
          />
        )}
        {showDataProfilingSidebar && (
          <DataProfilingSidebar
            visible={showDataProfilingSidebar}
            onClose={handleCloseDataProfilingSidebar}
            chart={chart}
            updateChart={setChart}
          />
        )}
        {showThresholdSidebar && (
          <ThresholdSidebar
            visible={showThresholdSidebar}
            onClose={handleCloseThresholdMenu}
            updateChart={setChart}
            chart={chart}
          />
        )}

        {showErrorSidebar && (
          <ErrorSidebar
            visible={showErrorSidebar}
            onClose={handleCloseErrorSidebar}
            workflowColor={selectedSourceItem?.color || 'grey'}
            calculationResult={calculationData.find(
              ({ id }) => id === selectedSourceId
            )}
          />
        )}

        {showEventSidebar && (
          <EventSidebar
            visible={showEventSidebar}
            onClose={handleCloseEventSidebar}
            updateChart={setChart}
            chart={chart}
            eventData={eventData}
          />
        )}

        {showMonitoringSidebar && (
          <MonitoringSidebar
            onClose={handleCloseMonitoringSidebar}
            onViewAlertingSidebar={() => {
              handleMonitoringSidebarToggle();
              handleAlertingSidebarToggle();
            }}
          />
        )}

        {showAlertingSidebar && (
          <AlertingSidebar
            onClose={handleCloseAlertingSidebar}
            onViewMonitoringJobs={() => {
              handleAlertingSidebarToggle();
              handleMonitoringSidebarToggle();
            }}
          />
        )}

        <Toolbar>
          {isMonitoringEnabled && (
            <Tooltip content={t.Alerting} position="left">
              <Button
                icon="Bell"
                aria-label="Toggle alerting sidebar"
                toggled={showAlertingSidebar}
                onClick={() => handleAlertingSidebarToggle()}
              />
            </Tooltip>
          )}
          {isDataProfilingEnabled && (
            <Tooltip content={t['Data Profiling']} position="left">
              <Button
                icon="Profiling"
                aria-label="Toggle data profiling sidebar"
                toggled={showDataProfilingSidebar}
                onClick={() => handleDataProfilingSidebarToggle()}
              />
            </Tooltip>
          )}
          <Tooltip content={t.Events} position="left">
            <Button
              icon="Events"
              aria-label="Toggle events sidebar"
              toggled={showEventSidebar}
              onClick={() => handleEventSidebarToggle()}
            />
          </Tooltip>
          <Tooltip content={t.Threshold} position="left">
            <Button
              icon="Threshold"
              aria-label="Toggle threshold sidebar"
              toggled={showThresholdSidebar}
              onClick={() => handleThresholdSidebarToggle()}
            />
          </Tooltip>
          {isMonitoringEnabled && (
            <Tooltip content={t.Monitoring} position="left">
              <Button
                // @ts-ignore
                icon="Alarm"
                aria-label="Toggle monitoring sidebar"
                toggled={showMonitoringSidebar}
                onClick={() => handleMonitoringSidebarToggle()}
              />
            </Tooltip>
          )}
        </Toolbar>
      </ChartViewContainer>
    </>
  );
};

export default ChartViewPage;
