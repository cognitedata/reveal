import React from 'react';

import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { DepthMeasurementUnit } from 'constants/units';

import {
  BodyColumnBody,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineAbsolute,
  ScaleLineDepth,
} from '../../../../common/Events/elements';
import { useScaledDepth } from '../../../hooks/useScaledDepth';
import {
  DepthColumnContainer,
  DepthScaleLabel,
  DepthScaleLabelMarker,
  DepthScaleLabelTag,
} from '../elements';

export type Props = {
  scaleBlocks: number[];
  depthValuesMap: Record<number, number | undefined>;
  depthMeasurementType: DepthMeasurementUnit;
};

const DepthColumn: React.FC<Props> = ({
  scaleBlocks,
  depthValuesMap,
  depthMeasurementType,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  const isTvdBased = depthMeasurementType === DepthMeasurementUnit.TVD;
  const scaleMaxDepth = last(scaleBlocks);

  return (
    <DepthColumnContainer>
      <BodyColumnBody>
        <DepthMeasurementScale>
          <ScaleLine>
            <ScaleLineDepth>0</ScaleLineDepth>
          </ScaleLine>

          {Object.keys(depthValuesMap).map((depth, index) => {
            const md = Number(depth);
            const tvd = depthValuesMap[md];

            if (isTvdBased && isUndefined(tvd)) {
              return null;
            }

            const label = isTvdBased ? tvd : md;

            return (
              <DepthScaleLabel
                // eslint-disable-next-line react/no-array-index-key
                key={`${index}-${depth}`}
                top={getScaledDepth(md)}
              >
                <DepthScaleLabelTag>
                  {toFixedNumberFromNumber(Number(label), Fixed.NoDecimals)}
                </DepthScaleLabelTag>
                <DepthScaleLabelMarker />
              </DepthScaleLabel>
            );
          })}

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
