import { getDepthRange } from 'domain/wells/casings/internal/selectors/getDepthRange';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DragDropContainer } from 'components/DragDropContainer';

import { SCALE_BOTTOM_PADDING } from '../../common/Events/constants';
import { SelectedWellboreNptView } from '../../nptEvents/Graph';
import { CasingSchematicView } from '../types';
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
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  showBothSides?: boolean;
}

export const WellboreCasingView: React.FC<WellboreCasingsViewProps> = ({
  data,
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

  const [_, maxDepth] = useMemo(
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

        <ContentWrapper>
          <DragDropContainer id="welbore-casing-view-content">
            <SchemaColumn
              ref={depthScaleRef}
              isLoading={isSchemaLoading}
              rkbLevel={rkbLevel}
              waterDepth={waterDepth}
              casingAssemblies={casingAssemblies}
              scaleBlocks={scaleBlocks}
              showBothSides={showBothSides}
            />

            <NptEventsColumn
              scaleBlocks={scaleBlocks}
              events={nptEvents}
              isLoading={isNptEventsLoading}
            />

            <NdsEventsColumn
              scaleBlocks={scaleBlocks}
              events={ndsEvents}
              isLoading={isNdsEventsLoading}
            />

            <SummaryColumn casingAssemblies={casingAssemblies} />
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
