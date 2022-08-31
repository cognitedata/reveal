import * as React from 'react';

import last from 'lodash/last';

import { SCALE_BLOCK_HEIGHT } from '../../../../common/Events/constants';
import {
  BodyColumnBody,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineAbsolute,
  ScaleLineDepth,
} from '../../../../common/Events/elements';
import { DepthColumnContainer } from '../elements';

export type Props = {
  scaleBlocks: number[];
};

const DepthColumn: React.FC<Props> = ({ scaleBlocks }) => {
  return (
    <DepthColumnContainer>
      <BodyColumnBody>
        <DepthMeasurementScale>
          <ScaleLine>
            <ScaleLineDepth>0</ScaleLineDepth>
          </ScaleLine>

          <ScaleLineAbsolute
            top={SCALE_BLOCK_HEIGHT * (scaleBlocks.length - 1)}
          >
            <ScaleLineDepth>{last(scaleBlocks)}</ScaleLineDepth>
          </ScaleLineAbsolute>
        </DepthMeasurementScale>
      </BodyColumnBody>
    </DepthColumnContainer>
  );
};

export default DepthColumn;
