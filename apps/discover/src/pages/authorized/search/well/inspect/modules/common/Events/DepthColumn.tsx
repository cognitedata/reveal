import React from 'react';

import { Body } from '@cognite/cogs.js';

import {
  DepthMeasurementUnit,
  DistanceUnit,
  UserPreferredUnit,
} from 'constants/units';
import { FlexGrow } from 'styles/layout';

import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnSubHeader,
  BodyColumnBody,
  ScaleLine,
  DepthMeasurementScale,
  ScaleLineDepth,
} from './elements';

export type Props = {
  scaleBlocks: number[];
  measurementUnit: DepthMeasurementUnit;
  unit: UserPreferredUnit | DistanceUnit.FEET | DistanceUnit.METER;
};

const DepthColumn: React.FC<Props> = ({
  scaleBlocks,
  measurementUnit,
  unit,
}: Props) => {
  return (
    <BodyColumn width={100}>
      <BodyColumnHeaderWrapper>
        <BodyColumnMainHeader>{measurementUnit}</BodyColumnMainHeader>
        <FlexGrow />
        <BodyColumnSubHeader>{unit}</BodyColumnSubHeader>
      </BodyColumnHeaderWrapper>
      <BodyColumnBody>
        <DepthMeasurementScale>
          {scaleBlocks.map((row, index) => {
            if (index === 0) {
              /**
               * Making the `0` text bold and render without decimal places (0.00 -> 0)
               */
              return (
                <ScaleLine key={row}>
                  <ScaleLineDepth>
                    <Body strong level={2}>
                      {Number(row)}
                    </Body>
                  </ScaleLineDepth>
                </ScaleLine>
              );
            }
            return (
              <ScaleLine key={row}>
                <ScaleLineDepth>{row.toFixed(2)}</ScaleLineDepth>
              </ScaleLine>
            );
          })}
        </DepthMeasurementScale>
      </BodyColumnBody>
    </BodyColumn>
  );
};

export default DepthColumn;
