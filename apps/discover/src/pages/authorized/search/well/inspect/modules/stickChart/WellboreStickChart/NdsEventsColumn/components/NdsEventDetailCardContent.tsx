import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import { DepthMeasurementUnit } from 'constants/units';
import { FlexRowFullWidth } from 'styles/layout';

import { DetailCardBlock } from '../../../components/DetailCard';
import { getDisplayUnit } from '../../../utils/getDisplayUnit';

export interface NdsEventDetailCardContentProps {
  event: NdsInternalWithTvd;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NdsEventDetailCardContent: React.FC<
  NdsEventDetailCardContentProps
> = ({ event, depthMeasurementType }) => {
  const {
    riskType,
    subtype,
    ndsCodeColor,
    severity,
    probability,
    holeDiameter,
    holeStart,
    holeEnd,
    holeStartTvd,
    holeEndTvd,
  } = event;

  const holeStartDepth = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD && holeStart) {
      return holeStart;
    }
    if (depthMeasurementType === DepthMeasurementUnit.TVD && holeStartTvd) {
      return holeStartTvd;
    }
    return null;
  }, [holeStart?.value, holeStartTvd?.value]);

  const holeEndDepth = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD && holeEnd) {
      return holeEnd;
    }
    if (depthMeasurementType === DepthMeasurementUnit.TVD && holeEndTvd) {
      return holeEndTvd;
    }
    return null;
  }, [holeEnd?.value, holeEndTvd?.value]);

  return (
    <>
      <FlexRowFullWidth>
        <DetailCardBlock
          extended
          title={riskType || 'Unknown'}
          value={subtype || 'Unknown'}
          avatarColor={ndsCodeColor}
        />
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
          title={`${depthMeasurementType} Hole Start ${getDisplayUnit(
            holeStartDepth?.unit
          )}`}
          value={holeStartDepth?.value}
        />
        <DetailCardBlock
          title={`${depthMeasurementType} Hole End ${getDisplayUnit(
            holeEndDepth?.unit
          )}`}
          value={holeEndDepth?.value}
        />
      </FlexRowFullWidth>
    </>
  );
};
