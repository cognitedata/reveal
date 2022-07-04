import { ComponentProps, useCallback, useEffect, useState } from 'react';
import get from 'lodash/get';
import { toast, Loader } from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
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
} from 'models/charts/charts/types/types';
import { useSearchParam } from 'hooks/navigation';
import { SEARCH_KEY } from 'utils/constants';
import { startTimer, stopTimer, trackUsage } from 'services/metrics';
import { Modes } from 'pages/types';
import { useRecoilState, useRecoilValue } from 'recoil';
import chartAtom from 'models/charts/charts/atoms/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
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
import { timeseriesAtom } from 'models/charts/timeseries-results/atom';
import {
  availableWorkflows,
  calculationSummaries,
} from 'models/calculation-backend/calculation-results/atom-selectors/selectors';
import { TimeseriesCollectionEffects } from 'effects/timeseries';
import { CalculationCollectionEffects } from 'effects/calculations';
import { flow } from 'lodash';
import { getUnitConverter } from 'models/charts/units/utils/getUnitConverter';
import { timeseriesSummaries } from 'models/charts/timeseries-results/selectors';
import { isProduction } from 'models/charts/config/utils/environment';
import ConnectedDetailsSidebar from 'containers/DetailsSidebar/ConnectedDetailsSidebar';
import { chartSources } from 'models/charts/charts/atom-selectors/selectors';
import ChartViewPageAppBar from 'pages/ChartViewPage/ChartViewPageAppBar';
import PageTitle from 'components/PageTitle/PageTitle';
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
} from 'models/charts/charts/selectors/updates';
import Locale from 'models/charts/user-preferences/classes/Locale';
import useInitializedChart from 'models/charts/chart/hooks/useInitializedChart';
import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  TopPaneWrapper,
} from './elements';
import ChartViewHeader from './ChartViewHeader';
import { useUploadCalculations } from './hooks';

type ChartViewProps = {
  chartId: string;
};

const defaultTranslations = makeDefaultTranslations(
  'Chart could not be saved!',
  'Could not load chart',
  'This chart does not seem to exist. You might not have access',
  'All charts'
);

const keys = translationKeys(defaultTranslations);

const ChartViewPage = ({ chartId: chartIdProp }: ChartViewProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showThresholdMenu, setShowThresholdMenu] = useState(false);
  const [query = '', setQuery] = useSearchParam(SEARCH_KEY, false);
  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: login } = useUserInfo();

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
    ...useTranslations(keys, 'ChartView').t,
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

  const [selectedSourceId, setSelectedSourceId] = useState('');

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

  const handleSourceClick = useCallback((sourceId: string = '') => {
    setSelectedSourceId(sourceId);
  }, []);

  const handleInfoClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showContextMenu : true;
      setShowContextMenu(showMenu);
      setShowThresholdMenu(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
    },
    [selectedSourceId, showContextMenu]
  );

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  }, []);

  const handleThresholdClick = useCallback(
    (sourceId?: string) => {
      const isSameSource = sourceId === selectedSourceId;
      const showMenu = isSameSource ? !showThresholdMenu : true;
      setShowThresholdMenu(showMenu);
      setShowContextMenu(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
    },
    [selectedSourceId, showThresholdMenu]
  );

  const handleCloseThresholdMenu = useCallback(() => {
    setShowThresholdMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setQuery('');
    trackUsage('ChartView.CloseSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  }, [setQuery]);

  const handleMoveSource = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setChart((oldChart) =>
        updateSourceCollectionOrder(oldChart!, sourceIndex, destinationIndex)
      );
    },
    [setChart]
  );

  const sources = useRecoilValue(chartSources);

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
    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
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
      <ChartViewPageAppBar allChartsLabel={t['All charts']} />
      <ChartViewContainer id="chart-view">
        {showSearch && (
          <SearchSidebar visible={showSearch} onClose={handleCloseSearch} />
        )}
        <ContentWrapper showSearch={showSearch}>
          <ChartViewHeader
            userId={login?.id}
            isOwner={isChartOwner}
            stackedMode={stackedMode}
            setStackedMode={setStackedMode}
            showSearch={showSearch}
            showYAxis={showYAxis}
            showMinMax={showMinMax}
            showGridlines={showGridlines}
            mergeUnits={mergeUnits}
            dateFrom={new Date(chart.dateFrom)}
            dateTo={new Date(chart.dateTo)}
            handleOpenSearch={handleOpenSearch}
            handleClickNewWorkflow={handleClickNewWorkflow}
            handleImportCalculationsClick={
              isProduction ? undefined : handleImportCalculationsClick
            }
            handleSettingsToggle={handleSettingsToggle}
            handleDateChange={handleDateChange}
            translations={ChartViewHeaderTranslations}
            locale={Locale.currentDateFnsLocale}
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
        {showContextMenu && selectedSourceItem && (
          <ConnectedDetailsSidebar
            source={selectedSourceItem}
            onClose={handleCloseContextMenu}
          />
        )}

        {showThresholdMenu && (
          <ThresholdSidebar
            onClose={handleCloseThresholdMenu}
            updateChart={setChart}
            chart={chart}
          />
        )}
      </ChartViewContainer>
    </>
  );
};

export default ChartViewPage;
