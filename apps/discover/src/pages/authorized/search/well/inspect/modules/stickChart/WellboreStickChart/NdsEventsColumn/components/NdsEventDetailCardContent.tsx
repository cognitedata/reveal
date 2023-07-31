import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import { DepthMeasurementUnit } from 'constants/units';
import { FlexRowFullWidth } from 'styles/layout';

import { DetailCardBlock } from '../../../components/DetailCard';
import { ToggleHighlightButton } from '../../../components/DetailCard/ToggleHighlightButton';
import { getDisplayUnit } from '../../../utils/getDisplayUnit';

export interface NdsEventDetailCardContentProps {
  event: NdsInternalWithTvd;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NdsEventDetailCardContent: React.FC<
  NdsEventDetailCardContentProps
> = ({ event, depthMeasurementType }) => {
  const {
    source: { eventExternalId },
    riskType,
    subtype,
    ndsCodeColor,
    severity,
    probability,
    holeDiameter,
    holeTop,
    holeBase,
    holeTopTvd,
    holeBaseTvd,
  } = event;

  const holeTopDepth = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD && holeTop) {
      return holeTop;
    }
    if (depthMeasurementType === DepthMeasurementUnit.TVD && holeTopTvd) {
      return holeTopTvd;
    }
    return null;
  }, [holeTop?.value, holeTopTvd?.value]);

  const holeBaseDepth = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD && holeBase) {
      return holeBase;
    }
    if (depthMeasurementType === DepthMeasurementUnit.TVD && holeBaseTvd) {
      return holeBaseTvd;
    }
    return null;
  }, [holeBase?.value, holeBaseTvd?.value]);

  return (
    <>
      <FlexRowFullWidth>
        <DetailCardBlock
          extended
          title={riskType || 'Unknown'}
          value={subtype || 'Unknown'}
          avatarColor={ndsCodeColor}
        >
          <ToggleHighlightButton type="nds" eventExternalId={eventExternalId} />
        </DetailCardBlock>
        <DetailCardBlock title="Severity" value={severity} />
      </FlexRowFullWidth>

      <FlexRowFullWidth>
        <DetailCardBlock title="Probability" value={probability} />
        <DetailCardBlock
          title={`Diameter ${getDisplayUnit(holeDiameter?.unit)}`}
          value={holeDiameter?.value}
        />
      </FlexRowFullWidth>

      <FlexRowFullWidth>
        <DetailCardBlock
          title={`Top Depth ${depthMeasurementType} ${getDisplayUnit(
            holeTopDepth?.unit
          )}`}
          value={holeTopDepth?.value}
        />
        <DetailCardBlock
          title={`Base Depth ${depthMeasurementType} ${getDisplayUnit(
            holeBaseDepth?.unit
          )}`}
          value={holeBaseDepth?.value}
        />
      </FlexRowFullWidth>
    </>
  );
};
