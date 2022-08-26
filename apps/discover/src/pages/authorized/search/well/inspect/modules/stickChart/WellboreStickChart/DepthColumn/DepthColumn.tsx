import * as React from 'react';

import { Distance } from 'convert-units';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import {
  DepthMeasurementUnit,
  DistanceUnit,
  UserPreferredUnit,
} from 'constants/units';
import { FlexGrow } from 'styles/layout';

import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnSubHeader,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineDepth,
} from '../../../common/Events/elements';

export type Props = {
  scaleBlocks: number[];
  measurementUnit: DepthMeasurementUnit;
  unit: UserPreferredUnit | DistanceUnit | Distance;
};

export const DepthColumn = React.forwardRef<HTMLElement, Props>(
  ({ scaleBlocks, measurementUnit, unit }, ref) => {
    return (
      <BodyColumn width={100} ref={ref}>
        <BodyColumnHeaderWrapper>
          <BodyColumnMainHeader>{measurementUnit}</BodyColumnMainHeader>
          <FlexGrow />
          <BodyColumnSubHeader>{unit}</BodyColumnSubHeader>
        </BodyColumnHeaderWrapper>

        <BodyColumnBody>
          <DepthMeasurementScale>
            {scaleBlocks.map((scaleValue) => {
              return (
                <ScaleLine key={scaleValue}>
                  <ScaleLineDepth>
                    {toFixedNumberFromNumber(scaleValue, Fixed.TwoDecimals)}
                  </ScaleLineDepth>
                </ScaleLine>
              );
            })}
          </DepthMeasurementScale>
        </BodyColumnBody>
      </BodyColumn>
    );
  }
);
