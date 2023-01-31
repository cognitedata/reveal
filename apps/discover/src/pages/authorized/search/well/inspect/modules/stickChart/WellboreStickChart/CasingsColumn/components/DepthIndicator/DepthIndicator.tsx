import React, { useCallback, useEffect, useRef, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import layers from 'utils/zindex';

import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../../../../types';
import { getDepthTagDisplayDepth } from '../../../../utils/getDepthTagDisplayDepth';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';
import { CasingDepthTag } from '../DepthTag';

import { Casing } from './components/Casing';
import { Cement } from './components/Cement';
import {
  DepthIndicatorWrapper,
  DescriptionFlipped,
  DescriptionUnflipped,
} from './elements';

export interface DepthIndicatorProps {
  casingAssembly: CasingAssemblyView;
  flip?: boolean;
  isOverlapping?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
  scaler: (value: number) => number;
}

/**
 * This component is used to generate depth indicator for a casing
 */
export const DepthIndicator: React.FC<DepthIndicatorProps> = ({
  casingAssembly,
  flip = false,
  isOverlapping = false,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  scaler,
}) => {
  const depthIndicatorRef = useRef<HTMLElement>(null);

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);
  const [depthMarkerWidth, setDepthMarkerWidth] = useState<number>();

  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const {
    outsideDiameterFormatted,
    measuredDepthBase,
    trueVerticalDepthBase,
    cementing,
  } = casingAssembly;

  const depthBase = isMdScale
    ? measuredDepthBase.value
    : trueVerticalDepthBase?.value;

  const updateDepthMarkerWidth = useCallback(
    () => setDepthMarkerWidth(depthIndicatorRef.current?.offsetLeft),
    [depthIndicatorRef.current?.offsetLeft, depthBase]
  );

  useEffect(() => updateDepthMarkerWidth(), [updateDepthMarkerWidth]);

  const DescriptionWrapper = flip ? DescriptionFlipped : DescriptionUnflipped;

  return (
    <DepthIndicatorWrapper
      ref={depthIndicatorRef}
      data-testid="depth-indicator"
      style={{ zIndex }}
      /**
       * A trick to prevent tooltip being overlapped.
       * This increases the zIndex of hovered depth indicator by one.
       * Then return it to the initial when the mouse left.
       */
      onMouseEnter={() => setZIndex(layers.TOOLTIP_HOVERED)}
      onMouseLeave={() => setZIndex(layers.MAIN_LAYER)}
    >
      <Cement
        cementing={cementing}
        depthMeasurementType={depthMeasurementType}
        scaler={scaler}
      />

      <Casing
        casingAssembly={casingAssembly}
        flip={flip}
        depthMeasurementType={depthMeasurementType}
        scaler={scaler}
      />

      {!isUndefined(depthBase) && !isUndefined(depthMarkerWidth) && (
        <CasingDepthTag
          content={getDepthTagDisplayDepth(depthBase)}
          depthMarkerWidth={depthMarkerWidth}
          isOverlapping={isOverlapping}
        />
      )}

      <DescriptionWrapper>{outsideDiameterFormatted}</DescriptionWrapper>
    </DepthIndicatorWrapper>
  );
};
