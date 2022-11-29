import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterMeasurementsByDepth } from 'domain/wells/measurements/internal/selectors/filterMeasurementsByDepth';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { FlexColumn } from 'styles/layout';

import { BodyColumnBody } from '../../../common/Events/elements';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { useScaledDepth } from '../../hooks/useScaledDepth';
import { HoleSectionView } from '../../types';
import { adaptDepthMeasurementToMudWeights } from '../../utils/adaptDepthMeasurementToMudWeights';

import { HoleSectionLabel, HoleSectionsColumnContainer } from './elements';
import { MudWeightInfo } from './MudWeightInfo';

export interface HoleSectionsColumnProps {
  data?: HoleSectionView[];
  measurementsData?: DepthMeasurementWithData[];
  scaleBlocks: number[];
  depthMeasurementType: DepthMeasurementUnit;
}

export const HoleSectionsColumn: React.FC<HoleSectionsColumnProps> = ({
  data,
  measurementsData = EMPTY_ARRAY,
  scaleBlocks,
  depthMeasurementType,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const depthMeasurementsMD = useDeepMemo(
    () => filterMdIndexedDepthMeasurements(measurementsData),
    [measurementsData]
  );

  const depthMeasurementsTVD = useDeepMemo(
    () => filterTvdIndexedDepthMeasurements(measurementsData),
    [measurementsData]
  );

  if (!data || isEmpty(data)) {
    return null;
  }

  const renderHoleSectionBlock = (section: HoleSectionView) => {
    const {
      id,
      holeSizeFormatted,
      topMeasuredDepth,
      baseMeasuredDepth,
      topTrueVerticalDepth,
      baseTrueVerticalDepth,
    } = section;

    const depthTop = isMdScale ? topMeasuredDepth : topTrueVerticalDepth;
    const depthBase = isMdScale ? baseMeasuredDepth : baseTrueVerticalDepth;

    const measurementsForScale = isMdScale
      ? depthMeasurementsMD
      : depthMeasurementsTVD;

    const depthMeasurement = head(
      filterMeasurementsByDepth(measurementsForScale, {
        min: depthTop,
        max: depthBase,
      })
    );

    const mudWeights =
      depthMeasurement && adaptDepthMeasurementToMudWeights(depthMeasurement);

    if (!holeSizeFormatted || isUndefined(depthTop) || isUndefined(depthBase)) {
      return null;
    }

    const center = (depthBase + depthTop) / 2;
    const top = getScaledDepth(center);

    return (
      <HoleSectionLabel key={id} top={top}>
        {holeSizeFormatted} Hole <MudWeightInfo mudWeights={mudWeights} />
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
