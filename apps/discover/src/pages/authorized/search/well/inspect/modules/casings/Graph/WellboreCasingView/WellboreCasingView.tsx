import { getDepthRange } from 'domain/wells/casings/internal/selectors/getDepthRange';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DepthMeasurementUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import DepthColumn from '../../../common/Events/DepthColumn';
import EventsByDepth from '../../../common/Events/EventsByDepth';
import { SelectedWellboreNptView } from '../../../nptEvents/Graph';
import { CasingSchematicView } from '../../types';
import { getScaleBlocks } from '../../utils/scale';
import { DEPTH_SCALE_MIN_HEIGHT } from '../constants';

import { ContentWrapper, WellboreCasingsViewWrapper } from './elements';
import { Header } from './Header';
import { SchemaColumn } from './SchemaColumn';
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
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const depthScaleRef = useRef<HTMLElement>(null);

  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);
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
    const depthColumnHeight = depthScaleRef.current?.offsetHeight;
    const height = depthColumnHeight || DEPTH_SCALE_MIN_HEIGHT;
    const depthScaleBlocks = getScaleBlocks(height, maxDepth);
    setScaleBlocks(depthScaleBlocks);
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
          <DepthColumn
            ref={depthScaleRef}
            scaleBlocks={scaleBlocks}
            unit={userPreferredUnit}
            measurementUnit={DepthMeasurementUnit.MD}
          />

          <SchemaColumn
            rkbLevel={rkbLevel}
            waterDepth={waterDepth}
            casingAssemblies={casingAssemblies}
            scaleBlocks={scaleBlocks}
            showBothSides={showBothSides}
          />

          <EventsByDepth
            nptEvents={nptEvents}
            ndsEvents={ndsEvents}
            isNptEventsLoading={isNptEventsLoading}
            isNdsEventsLoading={isNdsEventsLoading}
            scaleBlocks={scaleBlocks}
          />
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
