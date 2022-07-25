import { isTied } from 'domain/wells/casings/internal/utils/isTied';

import React, { useCallback, useMemo } from 'react';

import reduce from 'lodash/reduce';
import reduceRight from 'lodash/reduceRight';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { CasingAssemblyView } from '../../../types';
import { DepthIndicatorsContainer } from '../elements';

import { DepthIndicator } from './DepthIndicator';

interface DepthIndicatorsProps {
  casingAssemblies: CasingAssemblyView[];
  scaleBlocks: number[];
  showBothSides?: boolean;
}

export const DepthIndicators = React.forwardRef<
  HTMLElement,
  DepthIndicatorsProps
>(({ casingAssemblies, scaleBlocks, showBothSides = false }, ref) => {
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
        />,
      ];
    },
    [getScaledDepth]
  );

  const DepthIndicatorsLeftHalf = useMemo(
    () =>
      reduceRight(
        casingAssemblies,
        (...args) => depthIndicatorsReducer(...args, true),
        [] as JSX.Element[]
      ),
    [casingAssemblies, depthIndicatorsReducer]
  );

  const DepthIndicatorsRightHalf = useMemo(
    () => reduce(casingAssemblies, depthIndicatorsReducer, [] as JSX.Element[]),
    [casingAssemblies, depthIndicatorsReducer]
  );

  return (
    <DepthIndicatorsContainer ref={ref}>
      {showBothSides && DepthIndicatorsLeftHalf}
      {DepthIndicatorsRightHalf}
    </DepthIndicatorsContainer>
  );
});
