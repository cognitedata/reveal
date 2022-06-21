import { getDepthRange } from 'domain/wells/casings/internal/selectors/getDepthRange';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import DepthColumn from '../../../common/Events/DepthColumn';
import EventsByDepth from '../../../common/Events/EventsByDepth';
import { CasingSchematicView } from '../../types';
import { getScaleBlocks } from '../../utils/scale';
import { DEPTH_SCALE_MIN_HEIGHT } from '../constants';

import { ContentWrapper, WellboreCasingsViewWrapper } from './elements';
import { Header } from './Header';
import { SchemaColumn } from './SchemaColumn';

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

  const {
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

  return (
    <WellboreCasingsViewWrapper>
      <Header
        wellName={wellName}
        wellboreName={wellboreName}
        onChangeDropdown={console.log}
      />

      <ContentWrapper>
        <DepthColumn
          ref={depthScaleRef}
          scaleBlocks={scaleBlocks}
          unit={waterDepth.unit}
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
  );
};
