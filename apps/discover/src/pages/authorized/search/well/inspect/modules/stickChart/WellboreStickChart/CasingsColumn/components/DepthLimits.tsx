import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import * as React from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { getDepthTagDisplayDepth } from '../../../utils/getDepthTagDisplayDepth';
import { TopContentWrapper } from '../elements';

import { DepthLimitTag } from './DepthTag';
import { TotalDepthWrapper } from './DepthTag/elements';

export interface DepthLimitsProps {
  scaleBlocks: number[];
  maxDepth?: MaxDepthData;
  depthMeasurementType: DepthMeasurementUnit;
}

export const DepthLimits: React.FC<DepthLimitsProps> = ({
  scaleBlocks,
  maxDepth,
  depthMeasurementType,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  const renderTotalDepthTag = () => {
    if (!maxDepth) {
      return null;
    }

    const totalDepth =
      depthMeasurementType === DepthMeasurementUnit.MD
        ? maxDepth.maxMeasuredDepth
        : maxDepth.maxTrueVerticalDepth;

    return (
      <TotalDepthWrapper>
        <DepthLimitTag
          content={`TD: ${getDepthTagDisplayDepth(totalDepth)}`}
          scaledDepth={getScaledDepth(totalDepth)}
        />
      </TotalDepthWrapper>
    );
  };

  return (
    <TopContentWrapper>
      <DepthLimitTag content={0} />
      {renderTotalDepthTag()}
    </TopContentWrapper>
  );
};
