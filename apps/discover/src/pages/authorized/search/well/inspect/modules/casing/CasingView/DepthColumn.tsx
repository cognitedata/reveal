import React from 'react';

import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { FlexGrow } from 'styles/layout';

import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnSubHeader,
  BodyColumnBody,
  ScaleLine,
  CasingScale,
  ScaleLineDepth,
} from './elements';

export type Props = {
  scaleBlocks: number[];
  unit: UMSUserProfilePreferences.MeasurementEnum | 'ft' | 'm';
};

const DepthColumn: React.FC<Props> = ({ scaleBlocks, unit }: Props) => {
  return (
    <BodyColumn>
      <BodyColumnHeaderWrapper>
        <BodyColumnMainHeader>MD</BodyColumnMainHeader>
        <FlexGrow />
        <BodyColumnSubHeader>{unit}</BodyColumnSubHeader>
      </BodyColumnHeaderWrapper>
      <BodyColumnBody>
        <CasingScale>
          {scaleBlocks.map((row) => (
            <ScaleLine key={row}>
              <ScaleLineDepth>{row.toFixed(2)}</ScaleLineDepth>
            </ScaleLine>
          ))}
        </CasingScale>
      </BodyColumnBody>
    </BodyColumn>
  );
};

export default DepthColumn;
