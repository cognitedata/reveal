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
        return [
          ...depthIndicators,
          <DepthIndicator
            key={casingAssembly.id}
            casingAssembly={casingAssembly}
            flip={flip}
            isOverlapping={isDepthLabelOverlapping(
              casingAssemblies,
              index,
              getScaledDepth
            )}
            depthMeasurementType={depthMeasurementType}
            scaler={getScaledDepth}
          />,
        ];
      },
      [casingAssemblies, getScaledDepth, depthMeasurementType]
    );

    const DepthIndicatorsLeftHalf = useMemo(() => {
      if (!showBothSides) {
        return null;
      }
      return reduce(
        casingAssemblies,
        (...args) => depthIndicatorsReducer(...args, true),
        EMPTY_ARRAY as JSX.Element[]
      );
    }, [showBothSides, depthIndicatorsReducer]);

    const DepthIndicatorsRightHalf = useMemo(() => {
      return reduceRight(
        casingAssemblies,
        depthIndicatorsReducer,
        EMPTY_ARRAY as JSX.Element[]
      );
    }, [depthIndicatorsReducer]);

    return (
      <DepthIndicatorsContainer ref={ref}>
        {DepthIndicatorsLeftHalf}
        {DepthIndicatorsRightHalf}
      </DepthIndicatorsContainer>
    );
  }
);
