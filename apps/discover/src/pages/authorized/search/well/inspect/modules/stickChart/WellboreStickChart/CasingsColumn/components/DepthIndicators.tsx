import { isTied } from 'domain/wells/casings/internal/utils/isTied';

import React, { useCallback, useMemo } from 'react';

import reduce from 'lodash/reduce';
import reduceRight from 'lodash/reduceRight';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { CasingAssemblyView } from '../../../types';
import { isDepthLabelOverlapping } from '../../../utils/isDepthLabelOverlapping';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';
import { DepthIndicatorsContainer } from '../elements';

import { DepthIndicator } from './DepthIndicator';

interface DepthIndicatorsProps {
  casingAssemblies: CasingAssemblyView[];
  scaleBlocks: number[];
  showBothSides?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const DepthIndicators = React.forwardRef<
  HTMLElement,
  DepthIndicatorsProps
>(
  (
    {
      casingAssemblies,
      scaleBlocks,
      showBothSides = false,
      depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
    },
    ref
  ) => {
    const getScaledDepth = useScaledDepth(scaleBlocks);

    const depthIndicatorsReducer = useCallback(
      (
        depthIndicators: JSX.Element[],
        casingAssembly: CasingAssemblyView,
        index: number,
        _: any,
        flip = false
      ) => {
        const { measuredDepthTop, measuredDepthBase } = casingAssembly;

        const casingStartDepthScaled = getScaledDepth(measuredDepthTop.value);
        const casingDepthScaled = getScaledDepth(
          measuredDepthBase.value - measuredDepthTop.value
        );

        return [
          ...depthIndicators,
          <DepthIndicator
            // eslint-disable-next-line react/no-array-index-key
            key={`casing-assembly-${index}`}
            casingAssembly={casingAssembly}
            casingStartDepthScaled={casingStartDepthScaled}
            casingDepthScaled={casingDepthScaled}
            isTied={isTied(casingAssemblies, index)}
            flip={flip}
            depthMeasurementType={depthMeasurementType}
            isOverlapping={isDepthLabelOverlapping(
              casingAssemblies,
              index,
              getScaledDepth
            )}
          />,
        ];
      },
      [casingAssemblies, getScaledDepth, depthMeasurementType]
    );

    const DepthIndicatorsLeftHalf = useMemo(
      () =>
        reduceRight(
          casingAssemblies,
          (...args) => depthIndicatorsReducer(...args, true),
          EMPTY_ARRAY as JSX.Element[]
        ),
      [casingAssemblies, depthIndicatorsReducer]
    );

    const DepthIndicatorsRightHalf = useMemo(
      () =>
        reduce(
          casingAssemblies,
          depthIndicatorsReducer,
          EMPTY_ARRAY as JSX.Element[]
        ),
      [casingAssemblies, depthIndicatorsReducer]
    );

    return (
      <DepthIndicatorsContainer ref={ref}>
        {showBothSides && DepthIndicatorsLeftHalf}
        {DepthIndicatorsRightHalf}
      </DepthIndicatorsContainer>
    );
  }
);
