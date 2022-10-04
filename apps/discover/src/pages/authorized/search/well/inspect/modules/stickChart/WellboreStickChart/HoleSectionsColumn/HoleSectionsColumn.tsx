import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { DepthMeasurementUnit } from 'constants/units';
import { FlexColumn } from 'styles/layout';

import { BodyColumnBody } from '../../../common/Events/elements';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { useScaledDepth } from '../../hooks/useScaledDepth';
import { HoleSectionView } from '../../types';

import { HoleSectionLabel, HoleSectionsColumnContainer } from './elements';

export interface HoleSectionsColumnProps {
  data?: HoleSectionView[];
  scaleBlocks: number[];
  depthMeasurementType: DepthMeasurementUnit;
}

export const HoleSectionsColumn: React.FC<HoleSectionsColumnProps> = ({
  data,
  scaleBlocks,
  depthMeasurementType,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  if (!data || isEmpty(data)) {
    return null;
  }

  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const renderHoleSectionBlock = (section: HoleSectionView) => {
    const {
      name,
      holeSizeFormatted,
      topMeasuredDepth,
      baseMeasuredDepth,
      topTrueVerticalDepth,
      baseTrueVerticalDepth,
    } = section;

    const depthTop = isMdScale ? topMeasuredDepth : topTrueVerticalDepth;
    const depthBase = isMdScale ? baseMeasuredDepth : baseTrueVerticalDepth;

    if (!holeSizeFormatted || isUndefined(depthTop) || isUndefined(depthBase)) {
      return null;
    }

    const center = (depthBase + depthTop) / 2;
    const top = getScaledDepth(center);

    return (
      <HoleSectionLabel key={`${depthTop}-${depthBase}-${name}`} top={top}>
        {holeSizeFormatted} Hole
      </HoleSectionLabel>
    );
  };

  return (
    <HoleSectionsColumnContainer>
      <BodyColumnBody>
        <DepthScaleLines scaleBlocks={scaleBlocks} />
        <FlexColumn>{data.map(renderHoleSectionBlock)}</FlexColumn>
      </BodyColumnBody>
    </HoleSectionsColumnContainer>
  );
};
