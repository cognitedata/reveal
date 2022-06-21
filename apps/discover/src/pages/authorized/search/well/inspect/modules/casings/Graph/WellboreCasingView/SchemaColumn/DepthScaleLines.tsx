import React from 'react';

import { ScaleLine } from '../../../../common/Events/elements';

import { DepthMeasurementScaleWrapper } from './elements';

interface DepthScaleLinesProps {
  scaleBlocks: number[];
}

export const DepthScaleLines: React.FC<DepthScaleLinesProps> = ({
  scaleBlocks,
}) => {
  return (
    <DepthMeasurementScaleWrapper>
      {scaleBlocks.map((depth) => (
        <ScaleLine key={depth} />
      ))}
    </DepthMeasurementScaleWrapper>
  );
};
