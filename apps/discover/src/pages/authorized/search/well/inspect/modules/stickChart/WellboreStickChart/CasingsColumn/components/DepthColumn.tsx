import * as React from 'react';

import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepCallback } from 'hooks/useDeep';

import { SCALE_BLOCK_HEIGHT } from '../../../../common/Events/constants';
import {
  BodyColumnBody,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineAbsolute,
  ScaleLineDepth,
} from '../../../../common/Events/elements';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';
import { DepthColumnContainer } from '../elements';

export type Props = {
  scaleBlocks: number[];
  scaleBlocksTVD?: number[];
  depthMeasurementType?: DepthMeasurementUnit;
};

const DepthColumn: React.FC<Props> = ({
  scaleBlocks,
  scaleBlocksTVD = EMPTY_ARRAY,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}) => {
  const renderScaleMaxDepth = useDeepCallback(() => {
    const scaleMaxDepthMD = last(scaleBlocks);
    const scaleMaxDepthTVD = last(scaleBlocksTVD);

    if (isUndefined(scaleMaxDepthMD)) {
      return null;
    }

    const scaleMaxDepthDisplay =
      depthMeasurementType === DepthMeasurementUnit.MD
        ? scaleMaxDepthMD
        : scaleMaxDepthTVD;

    /**
     * When depthMeasurementType is set to TVD,
     * We still use MD based max depth to get the top value.
     * We don't change the scale to prevent rerendering.
     * Instead we change the displayed value only.
     * So, only the depth scale is rerndered. The other columns remain same.
     */
    return (
      <ScaleLineAbsolute top={SCALE_BLOCK_HEIGHT * (scaleBlocks.length - 1)}>
        <ScaleLineDepth>{scaleMaxDepthDisplay}</ScaleLineDepth>
      </ScaleLineAbsolute>
    );
  }, [scaleBlocks, scaleBlocksTVD, depthMeasurementType]);

  return (
    <DepthColumnContainer>
      <BodyColumnBody>
        <DepthMeasurementScale>
          <ScaleLine>
            <ScaleLineDepth>0</ScaleLineDepth>
          </ScaleLine>

          {renderScaleMaxDepth()}
        </DepthMeasurementScale>
      </BodyColumnBody>
    </DepthColumnContainer>
  );
};

export default DepthColumn;
