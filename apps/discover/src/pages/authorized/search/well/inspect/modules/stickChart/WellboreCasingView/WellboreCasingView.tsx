import { getDepthRange } from 'domain/wells/casings/internal/selectors/getDepthRange';
import { filterNdsBySelectedEvents } from 'domain/wells/nds/internal/selectors/filterNdsBySelectedEvents';
import { filterNptBySelectedEvents } from 'domain/wells/npt/internal/selectors/filterNptBySelectedEvents';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { DragDropContainer } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { useDeepMemo } from 'hooks/useDeep';

import {
  SCALE_BOTTOM_PADDING,
  SCALE_BLOCK_HEIGHT,
} from '../../common/Events/constants';
import { EventsColumnView } from '../../common/Events/types';
import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { CasingSchematicView, ChartColumn } from '../types';
import { getScaleBlocks } from '../utils/scale';

import { DEPTH_SCALE_MIN_HEIGHT } from './constants';
import { ContentWrapper, WellboreCasingsViewWrapper } from './elements';
import { FormationColumn } from './FormationColumn/FormationColumn';
import { Header } from './Header';
import { NdsEventsColumn } from './NdsEventsColumn';
import { NptEventsColumn } from './NptEventsColumn';
import { SchemaColumn } from './SchemaColumn';
import { SummaryColumn } from './SummaryColumn';
import { WellboreNdsDetailedView } from './WellboreNdsDetailedView';

interface WellboreCasingsViewProps {
  data: CasingSchematicView;
  columnOrder: ChartColumn[];
  visibleColumns: ChartColumn[];
  selectedNptCodes: MultiSelectCategorizedOptionMap;
  selectedNdsCodes: MultiSelectCategorizedOptionMap;
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  isWellTopsLoading: boolean;
  showBothSides?: boolean;
}

export const WellboreCasingView: React.FC<WellboreCasingsViewProps> = ({
  data,
  columnOrder,
  visibleColumns,
  selectedNptCodes = {},
  selectedNdsCodes = {},
  isNptEventsLoading,
  isNdsEventsLoading,
  isWellTopsLoading,
  showBothSides = false,
}) => {
  const depthScaleRef = useRef<HTMLElement>(null);

  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);
  const [isSchemaLoading, setSchamaLoading] = useState<boolean>(true);
  const [showNptDetailView, setShowNptDetailView] = useState<boolean>(false);
  const [showNdsDetailView, setShowNdsDetailView] = useState<boolean>(false);
  const [currentEventViewMode, setCurrentEventViewMode] =
    useState<EventsColumnView>(EventsColumnView.Cluster);

  const {
    wellboreMatchingId,
    wellName,
    wellboreName,
    casingAssemblies,
    nptEvents,
    ndsEvents,
    rkbLevel,
    waterDepth,
    wellTop,
  } = data;

  const filteredNptEvents = useDeepMemo(
    () => filterNptBySelectedEvents(nptEvents, selectedNptCodes),
    [nptEvents, selectedNptCodes]
  );

  const filteredNdsEvents = useDeepMemo(
    () => filterNdsBySelectedEvents(ndsEvents, selectedNdsCodes),
    [ndsEvents, selectedNdsCodes]
  );

  const [_, maxDepth] = useDeepMemo(
    () =>
      getDepthRange(
        casingAssemblies,
        nptEvents,
        ndsEvents,
        wellTop?.tops || []
      ),
    [data]
  );

  const setDepthScaleBlocks = useCallback(() => {
    setSchamaLoading(true);
    const depthColumnHeight = depthScaleRef.current?.offsetHeight;
    const height = depthColumnHeight || DEPTH_SCALE_MIN_HEIGHT;
    const usableHeight = height - SCALE_BLOCK_HEIGHT - SCALE_BOTTOM_PADDING;
    const depthScaleBlocks = getScaleBlocks(usableHeight, maxDepth);
    setScaleBlocks(depthScaleBlocks);
    setSchamaLoading(false);
  }, [depthScaleRef.current?.offsetHeight, maxDepth]);

  useEffect(() => setDepthScaleBlocks(), [setDepthScaleBlocks]);

  const handleBackFromDetailViewClick = () => {
    setShowNdsDetailView(false);
    setShowNptDetailView(false);
  };

  const isColumnVisible = (column: ChartColumn) => {
    return visibleColumns.includes(column);
  };

  return (
    <>
      <WellboreCasingsViewWrapper>
        <Header
          wellName={wellName}
          wellboreName={wellboreName}
          wellboreMatchingId={wellboreMatchingId}
          currentEventViewMode={currentEventViewMode}
          onEventViewModeChange={setCurrentEventViewMode}
          onChangeDropdown={({ eventType }) => {
            if (eventType === 'nds') {
              setShowNdsDetailView(true);
            }
            if (eventType === 'npt') {
              setShowNptDetailView(true);
            }
          }}
        />

        <ContentWrapper ref={depthScaleRef}>
          <DragDropContainer
            id="welbore-casing-view-content"
            elementsOrder={columnOrder}
          >
            {isColumnVisible(ChartColumn.CASINGS) && (
              <FormationColumn
                key="formation"
                scaleBlocks={scaleBlocks}
                isLoading={isWellTopsLoading}
                wellTop={wellTop}
              />
            )}
            {isColumnVisible(ChartColumn.CASINGS) && (
              <SchemaColumn
                key={ChartColumn.CASINGS}
                isLoading={isSchemaLoading}
                rkbLevel={rkbLevel}
                waterDepth={waterDepth}
                casingAssemblies={casingAssemblies}
                scaleBlocks={scaleBlocks}
                showBothSides={showBothSides}
              />
            )}

            {isColumnVisible(ChartColumn.NPT) && (
              <NptEventsColumn
                key={ChartColumn.NPT}
                scaleBlocks={scaleBlocks}
                events={filteredNptEvents}
                isLoading={isNptEventsLoading}
                view={currentEventViewMode}
              />
            )}

            {isColumnVisible(ChartColumn.NDS) && (
              <NdsEventsColumn
                key={ChartColumn.NDS}
                scaleBlocks={scaleBlocks}
                events={filteredNdsEvents}
                isLoading={isNdsEventsLoading}
                view={currentEventViewMode}
              />
            )}

            {isColumnVisible(ChartColumn.SUMMARY) && (
              <SummaryColumn
                key={ChartColumn.SUMMARY}
                casingAssemblies={casingAssemblies}
              />
            )}
          </DragDropContainer>
        </ContentWrapper>
      </WellboreCasingsViewWrapper>

      {showNptDetailView && (
        <SelectedWellboreNptView
          selectedWellboreId={wellboreMatchingId}
          onCloseSelectedWellboreNptViewClick={handleBackFromDetailViewClick}
        />
      )}

      {showNdsDetailView && (
        <WellboreNdsDetailedView
          selectedWellboreId={wellboreMatchingId}
          onBackClick={handleBackFromDetailViewClick}
        />
      )}
    </>
  );
};
