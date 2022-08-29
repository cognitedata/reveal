import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';
import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DragDropContainer } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../common/Events/constants';
import { EventsColumnView } from '../../common/Events/types';
import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { ChartColumn, ColumnsData, WellboreData } from '../types';
import { getScaleBlocks } from '../utils/scale';

import { CasingsColumn } from './CasingsColumn';
import {
  DEFAULT_DEPTH_MEASUREMENT_TYPE,
  DEPTH_SCALE_MIN_HEIGHT,
} from './constants';
import { ContentWrapper, WellboreStickChartWrapper } from './elements';
import { FormationColumn } from './FormationColumn';
import { Header } from './Header';
import { MeasurementsColumn } from './MeasurementsColumn';
import { NdsEventsColumn } from './NdsEventsColumn';
import { NptEventsColumn } from './NptEventsColumn';
import { SummaryColumn } from './SummaryColumn';
import { TrajectoryColumn } from './TrajectoryColumn';
import { WellboreNdsDetailedView } from './WellboreNdsDetailedView';

export interface WellboreStickChartProps extends WellboreData, ColumnsData {
  isWellboreSelected?: boolean;
  maxDepth: MaxDepthData;
  columnVisibility: BooleanMap;
  columnOrder: string[];
  nptCodesSelecton?: NptCodesSelection;
  ndsRiskTypesSelection?: NdsRiskTypesSelection;
}

export const WellboreStickChart: React.FC<WellboreStickChartProps> = ({
  isWellboreSelected = true,
  wellName,
  wellboreName,
  wellboreColor,
  wellboreMatchingId,
  rkbLevel,
  wellWaterDepth,
  maxDepth,
  columnVisibility,
  columnOrder,
  nptCodesSelecton,
  ndsRiskTypesSelection,
  formationColumn,
  casingsColumn,
  nptColumn,
  ndsColumn,
  trajectoryColumn,
  measurementsColumn,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const [depthMeasurementType, setDepthMeasurementType] = useState(
    DEFAULT_DEPTH_MEASUREMENT_TYPE
  );

  const [columnHeight, setColumnHeight] = useState(0);
  const [eventViewMode, setEventViewMode] = useState(EventsColumnView.Cluster);

  const [showNptDetailView, setShowNptDetailView] = useState(false);
  const [showNdsDetailView, setShowNdsDetailView] = useState(false);

  const { maxMeasuredDepth, maxTrueVerticalDepth } = maxDepth;

  const updateColumnHeight = useCallback(() => {
    const depthColumnHeight = contentRef.current?.offsetHeight;
    const height = depthColumnHeight || DEPTH_SCALE_MIN_HEIGHT;
    const columnHeight = height - SCALE_BLOCK_HEIGHT - SCALE_PADDING;
    setColumnHeight(columnHeight);
  }, [contentRef.current]);

  useEffect(() => {
    window.addEventListener('resize', updateColumnHeight);
    return () => window.removeEventListener('resize', updateColumnHeight);
  }, []);

  useEffect(() => {
    updateColumnHeight();
  }, [updateColumnHeight]);

  const scaleBlocksMD = useMemo(
    () => getScaleBlocks(columnHeight, maxMeasuredDepth),
    [columnHeight, maxMeasuredDepth]
  );

  const scaleBlocksTVD = useMemo(
    () => getScaleBlocks(columnHeight, maxTrueVerticalDepth),
    [columnHeight, maxTrueVerticalDepth]
  );

  const scaleBlocks = useDeepMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD) {
      return scaleBlocksMD;
    }
    return scaleBlocksTVD;
  }, [depthMeasurementType, scaleBlocksMD, scaleBlocksTVD]);

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

          <ContentWrapper ref={contentRef}>
            <DragDropContainer
              id="welbore-stick-chart-view-content"
              elementsOrder={columnOrder}
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

              <SummaryColumn
                key={ChartColumn.SUMMARY}
                {...casingsColumn}
                isVisible={columnVisibility[ChartColumn.SUMMARY]}
              />

              <TrajectoryColumn
                key={ChartColumn.TRAJECTORY}
                {...trajectoryColumn}
                scaleBlocks={scaleBlocks}
                curveColor={wellboreColor}
                isVisible={columnVisibility[ChartColumn.TRAJECTORY]}
              />

              <MeasurementsColumn
                key={ChartColumn.MEASUREMENTS}
                {...measurementsColumn}
                scaleBlocks={scaleBlocks}
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
