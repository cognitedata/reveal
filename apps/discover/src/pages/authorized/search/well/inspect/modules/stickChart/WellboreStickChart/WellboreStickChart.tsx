import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';
import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import * as React from 'react';
import { useCallback, useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DragDropContainer } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { EventsColumnView } from '../../common/Events/types';
import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { useColumnHeight } from '../hooks/useColumnHeight';
import { useScaleBlocks } from '../hooks/useScaleBlocks';
import { ChartColumn, ColumnsData, WellboreData } from '../types';

import { CasingsColumn } from './CasingsColumn';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from './constants';
import { DepthColumn } from './DepthColumn';
import { ContentWrapper, WellboreStickChartWrapper } from './elements';
import { FormationColumn } from './FormationColumn';
import { Header } from './Header';
import { MeasurementsColumn } from './MeasurementsColumn';
import { NdsEventsColumn } from './NdsEventsColumn';
import { NptEventsColumn } from './NptEventsColumn';
// import { SummaryColumn } from './SummaryColumn';
import { TrajectoryColumn } from './TrajectoryColumn';
import { WellboreNdsDetailedView } from './WellboreNdsDetailedView';
import { WellboreStickChartEmptyState } from './WellboreStickChartEmptyState';

export interface WellboreStickChartProps extends WellboreData, ColumnsData {
  isWellboreSelected?: boolean;
  /**
   * If the wellbore doesn't have any data (casings, trajectories, etc.),
   * max depth data is not available.
   */
  maxDepth?: MaxDepthData;
  columnVisibility: BooleanMap;
  columnOrder: string[];
  nptCodesSelecton?: NptCodesSelection;
  ndsRiskTypesSelection?: NdsRiskTypesSelection;
  summaryVisibility?: BooleanMap;
  measurementTypesSelection?: BooleanMap;
}

export const WellboreStickChart: React.FC<WellboreStickChartProps> = ({
  /**
   * WellboreData
   */
  wellName,
  wellboreName,
  wellboreColor,
  wellboreMatchingId,
  rkbLevel,
  wellWaterDepth,
  /**
   * WellboreStickChartColumns
   */
  formationColumn,
  casingsColumn,
  nptColumn,
  ndsColumn,
  trajectoryColumn,
  measurementsColumn,
  /**
   * Other props
   */
  isWellboreSelected = true,
  maxDepth,
  columnVisibility,
  columnOrder,
  nptCodesSelecton,
  ndsRiskTypesSelection,
  // summaryVisibility,
  measurementTypesSelection,
}) => {
  const { contentRef, columnHeight } = useColumnHeight();

  const { scaleBlocks, scaleBlocksTVD } = useScaleBlocks({
    maxDepth,
    columnHeight,
  });

  const [columnOrderInternal, setColumnOrderInternal] = useState(columnOrder);
  const [depthMeasurementType, setDepthMeasurementType] = useState(
    DEFAULT_DEPTH_MEASUREMENT_TYPE
  );
  const [eventViewMode, setEventViewMode] = useState(EventsColumnView.Cluster);
  const [showNptDetailView, setShowNptDetailView] = useState(false);
  const [showNdsDetailView, setShowNdsDetailView] = useState(false);

  useDeepEffect(() => {
    setColumnOrderInternal(columnOrder);
  }, [columnOrder]);

  const isAnyColumnVisible = useDeepMemo(() => {
    return Object.values(columnVisibility).some(Boolean);
  }, [columnVisibility]);

  const handleChangeDropdown = useCallback(
    (eventType: 'npt' | 'nds') => {
      switch (eventType) {
        case 'npt':
          setShowNptDetailView(true);
          break;
        case 'nds':
          setShowNdsDetailView(true);
          break;
      }
    },
    [setShowNptDetailView, setShowNdsDetailView]
  );

  const closeDetailViews = useCallback(() => {
    setShowNptDetailView(false);
    setShowNdsDetailView(false);
  }, [setShowNptDetailView, setShowNdsDetailView]);

  return (
    <>
      <NoUnmountShowHide show={isWellboreSelected}>
        <WellboreStickChartWrapper>
          <Header
            wellName={wellName}
            wellboreName={wellboreName}
            wellboreMatchingId={wellboreMatchingId}
            onEventViewModeChange={setEventViewMode}
            onChangeDropdown={({ eventType }) => {
              handleChangeDropdown(eventType);
            }}
          />

          <WellboreStickChartEmptyState
            isAnyColumnVisible={isAnyColumnVisible}
          />

          <ContentWrapper ref={contentRef}>
            <DragDropContainer
              id="welbore-stick-chart-view-content"
              elementsOrder={columnOrderInternal}
              onRearranged={setColumnOrderInternal}
            >
              <FormationColumn
                key={ChartColumn.FORMATION}
                {...formationColumn}
                scaleBlocks={scaleBlocks}
                isVisible={columnVisibility[ChartColumn.FORMATION]}
              />

              <CasingsColumn
                key={ChartColumn.CASINGS}
                {...casingsColumn}
                scaleBlocks={scaleBlocks}
                scaleBlocksTVD={scaleBlocksTVD}
                rkbLevel={rkbLevel}
                wellWaterDepth={wellWaterDepth}
                depthMeasurementType={depthMeasurementType}
                onChangeDepthMeasurementType={setDepthMeasurementType}
                isVisible={columnVisibility[ChartColumn.CASINGS]}
              />

              <NptEventsColumn
                key={ChartColumn.NPT}
                {...nptColumn}
                scaleBlocks={scaleBlocks}
                view={eventViewMode}
                nptCodesSelecton={nptCodesSelecton}
                isVisible={columnVisibility[ChartColumn.NPT]}
              />

              <NdsEventsColumn
                key={ChartColumn.NDS}
                {...ndsColumn}
                scaleBlocks={scaleBlocks}
                view={eventViewMode}
                ndsRiskTypesSelection={ndsRiskTypesSelection}
                isVisible={columnVisibility[ChartColumn.NDS]}
              />

              {/* <SummaryColumn
                key={ChartColumn.SUMMARY}
                {...casingsColumn}
                summaryVisibility={summaryVisibility}
                isVisible={columnVisibility[ChartColumn.SUMMARY]}
              /> */}

              <DepthColumn
                key={ChartColumn.DEPTH}
                scaleBlocks={scaleBlocks}
                scaleBlocksTVD={scaleBlocksTVD}
                depthMeasurementType={depthMeasurementType}
                isVisible={isAnyColumnVisible}
              />

              <TrajectoryColumn
                key={ChartColumn.TRAJECTORY}
                {...trajectoryColumn}
                scaleBlocks={scaleBlocks}
                curveColor={wellboreColor}
                depthMeasurementType={depthMeasurementType}
                isVisible={columnVisibility[ChartColumn.TRAJECTORY]}
              />

              <MeasurementsColumn
                key={ChartColumn.MEASUREMENTS}
                {...measurementsColumn}
                scaleBlocks={scaleBlocks}
                measurementTypesSelection={measurementTypesSelection}
                isVisible={columnVisibility[ChartColumn.MEASUREMENTS]}
              />
            </DragDropContainer>
          </ContentWrapper>
        </WellboreStickChartWrapper>
      </NoUnmountShowHide>

      {showNptDetailView && (
        <SelectedWellboreNptView
          selectedWellboreId={wellboreMatchingId}
          onCloseSelectedWellboreNptViewClick={closeDetailViews}
        />
      )}

      {showNdsDetailView && (
        <WellboreNdsDetailedView
          selectedWellboreId={wellboreMatchingId}
          onBackClick={closeDetailViews}
        />
      )}
    </>
  );
};
