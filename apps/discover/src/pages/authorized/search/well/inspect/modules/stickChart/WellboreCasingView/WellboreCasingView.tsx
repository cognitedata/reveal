import { getDepthRange } from 'domain/wells/casings/internal/selectors/getDepthRange';
import { filterNdsBySelectedEvents } from 'domain/wells/nds/internal/selectors/filterNdsBySelectedEvents';
import { filterNptBySelectedEvents } from 'domain/wells/npt/internal/selectors/filterNptBySelectedEvents';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { DragDropContainer } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { useDeepMemo } from 'hooks/useDeep';

import { SCALE_BOTTOM_PADDING } from '../../common/Events/constants';
import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { CasingSchematicView, ChartColumn } from '../types';
import { getScaleBlocks } from '../utils/scale';

import { DEPTH_SCALE_MIN_HEIGHT } from './constants';
import { ContentWrapper, WellboreCasingsViewWrapper } from './elements';
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
  showBothSides = false,
}) => {
  const depthScaleRef = useRef<HTMLElement>(null);

  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);
  const [isSchemaLoading, setSchamaLoading] = useState<boolean>(true);
  const [showNptDetailView, setShowNptDetailView] = useState<boolean>(false);
  const [showNdsDetailView, setShowNdsDetailView] = useState<boolean>(false);

  const {
    wellboreMatchingId,
    wellName,
    wellboreName,
    casingAssemblies,
    nptEvents,
    ndsEvents,
    rkbLevel,
    waterDepth,
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
    () => getDepthRange(casingAssemblies, nptEvents, ndsEvents),
    [data]
  );

  const setDepthScaleBlocks = useCallback(() => {
    setSchamaLoading(true);
    const depthColumnHeight = depthScaleRef.current?.offsetHeight;
    const height = depthColumnHeight || DEPTH_SCALE_MIN_HEIGHT;
    const usableHeight = height - SCALE_BOTTOM_PADDING;
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

            {isColumnVisible(ChartColumn.CASINGS) && (
              <NptEventsColumn
                key={ChartColumn.NPT}
                scaleBlocks={scaleBlocks}
                events={filteredNptEvents}
                isLoading={isNptEventsLoading}
              />
            )}

            {isColumnVisible(ChartColumn.CASINGS) && (
              <NdsEventsColumn
                key={ChartColumn.NDS}
                scaleBlocks={scaleBlocks}
                events={filteredNdsEvents}
                isLoading={isNdsEventsLoading}
              />
            )}

            {isColumnVisible(ChartColumn.CASINGS) && (
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
