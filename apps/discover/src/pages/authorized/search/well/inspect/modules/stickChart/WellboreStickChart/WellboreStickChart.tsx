import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';
import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import * as React from 'react';
import { useEffect, useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DragDropContainer } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { useColumnHeight } from '../hooks/useColumnHeight';
import { useScaleBlocks } from '../hooks/useScaleBlocks';
import { useTrajectoryCurveConfigs } from '../hooks/useTrajectoryCurveConfigs';
import { ChartColumn, ColumnsData, WellboreData } from '../types';

import { CasingsColumn } from './CasingsColumn';
import { CasingsDetailView } from './CasingsDetailView';
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
  depthMeasurementType: DepthMeasurementUnit;
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
  holeSectionsColumn,
  /**
   * Other props
   */
  isWellboreSelected = true,
  maxDepth,
  columnVisibility,
  columnOrder,
  depthMeasurementType: depthMeasurementTypeProp,
  nptCodesSelecton,
  ndsRiskTypesSelection,
  // summaryVisibility,
  measurementTypesSelection,
}) => {
  const [columnOrderInternal, setColumnOrderInternal] = useState(columnOrder);
  const [depthMeasurementType, setDepthMeasurementType] = useState(
    depthMeasurementTypeProp
  );
  const [showCasingsDetailView, setShowCasingsDetailView] = useState(false);
  const [showNptDetailView, setShowNptDetailView] = useState(false);
  const [showNdsDetailView, setShowNdsDetailView] = useState(false);

  const { contentRef, columnHeight } = useColumnHeight();

  const { scaleBlocks } = useScaleBlocks({
    maxDepth,
    columnHeight,
    depthMeasurementType,
  });

  const trajectoryCurveConfigs = useTrajectoryCurveConfigs();

  useDeepEffect(() => {
    setColumnOrderInternal(columnOrder);
  }, [columnOrder]);

  useEffect(() => {
    setDepthMeasurementType(depthMeasurementTypeProp);
  }, [depthMeasurementTypeProp]);

  const isAnyColumnVisible = useDeepMemo(() => {
    return Object.values(columnVisibility).some(Boolean);
  }, [columnVisibility]);

  return (
    <>
      <NoUnmountShowHide show={isWellboreSelected}>
        <WellboreStickChartWrapper>
          <Header wellName={wellName} wellboreName={wellboreName} />

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
                depthMeasurementType={depthMeasurementType}
                isVisible={columnVisibility[ChartColumn.FORMATION]}
              />

              <DepthColumn
                key={ChartColumn.DEPTH}
                scaleBlocks={scaleBlocks}
                depthMeasurementType={depthMeasurementType}
                onChangeDepthMeasurementType={setDepthMeasurementType}
                isVisible={isAnyColumnVisible}
              />

              <CasingsColumn
                key={ChartColumn.CASINGS}
                {...casingsColumn}
                scaleBlocks={scaleBlocks}
                holeSections={holeSectionsColumn.data}
                rkbLevel={rkbLevel}
                wellWaterDepth={wellWaterDepth}
                depthMeasurementType={depthMeasurementType}
                onClickDetailsButton={() => setShowCasingsDetailView(true)}
                isVisible={columnVisibility[ChartColumn.CASINGS]}
              />

              <NdsEventsColumn
                key={ChartColumn.NDS}
                {...ndsColumn}
                scaleBlocks={scaleBlocks}
                ndsRiskTypesSelection={ndsRiskTypesSelection}
                depthMeasurementType={depthMeasurementType}
                onClickDetailsButton={() => setShowNdsDetailView(true)}
                isVisible={columnVisibility[ChartColumn.NDS]}
              />

              <NptEventsColumn
                key={ChartColumn.NPT}
                {...nptColumn}
                scaleBlocks={scaleBlocks}
                nptCodesSelecton={nptCodesSelecton}
                depthMeasurementType={depthMeasurementType}
                onClickDetailsButton={() => setShowNptDetailView(true)}
                isVisible={columnVisibility[ChartColumn.NPT]}
              />

              {/* <SummaryColumn
                key={ChartColumn.SUMMARY}
                {...casingsColumn}
                summaryVisibility={summaryVisibility}
                isVisible={columnVisibility[ChartColumn.SUMMARY]}
              /> */}

              <MeasurementsColumn
                key={ChartColumn.MEASUREMENTS}
                {...measurementsColumn}
                scaleBlocks={scaleBlocks}
                measurementTypesSelection={measurementTypesSelection}
                depthMeasurementType={depthMeasurementType}
                isVisible={columnVisibility[ChartColumn.MEASUREMENTS]}
              />

              <TrajectoryColumn
                key={ChartColumn.TRAJECTORY}
                {...trajectoryColumn}
                scaleBlocks={scaleBlocks}
                curveColor={wellboreColor}
                depthMeasurementType={depthMeasurementType}
                trajectoryCurveConfigs={trajectoryCurveConfigs}
                isVisible={columnVisibility[ChartColumn.TRAJECTORY]}
              />
            </DragDropContainer>
          </ContentWrapper>
        </WellboreStickChartWrapper>
      </NoUnmountShowHide>

      {showCasingsDetailView && (
        <CasingsDetailView
          wellName={wellName}
          wellboreName={wellboreName}
          data={casingsColumn?.data}
          onBackClick={() => setShowCasingsDetailView(false)}
        />
      )}

      {showNptDetailView && (
        <SelectedWellboreNptView
          selectedWellboreId={wellboreMatchingId}
          onCloseSelectedWellboreNptViewClick={() =>
            setShowNptDetailView(false)
          }
        />
      )}

      {showNdsDetailView && (
        <WellboreNdsDetailedView
          selectedWellboreId={wellboreMatchingId}
          onBackClick={() => setShowNdsDetailView(false)}
        />
      )}
    </>
  );
};
