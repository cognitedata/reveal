import * as React from 'react';

import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';

import {
  BodyColumnBody,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineAbsolute,
  ScaleLineDepth,
} from '../../../../common/Events/elements';
import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { DepthColumnContainer } from '../elements';

export type Props = {
  scaleBlocks: number[];
};

const DepthColumn: React.FC<Props> = ({ scaleBlocks }) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  const scaleMaxDepth = last(scaleBlocks);

  return (
    <DepthColumnContainer>
      <BodyColumnBody>
        <DepthMeasurementScale>
          <ScaleLine>
            <ScaleLineDepth>0</ScaleLineDepth>
          </ScaleLine>

          {!isUndefined(scaleMaxDepth) && (
            <ScaleLineAbsolute top={getScaledDepth(scaleMaxDepth)}>
              <ScaleLineDepth>{scaleMaxDepth}</ScaleLineDepth>
            </ScaleLineAbsolute>
          )}
        </DepthMeasurementScale>
      </BodyColumnBody>
    </DepthColumnContainer>
  );
};

export default DepthColumn;
