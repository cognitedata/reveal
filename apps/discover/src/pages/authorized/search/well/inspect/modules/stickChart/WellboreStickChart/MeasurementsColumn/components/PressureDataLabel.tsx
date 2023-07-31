import * as React from 'react';

import { PressureData } from '../../../types';
import { MeasurementLabel, PressureDataLabelWrapper } from '../elements';

import { PressureLabelImage } from './PressureLabelImage';

export interface PressureDataLabelProps {
  data: PressureData;
  scaledDepth: number;
}

export const PressureDataLabel: React.FC<PressureDataLabelProps> = ({
  data,
  scaledDepth,
}) => {
  const { value, unit, measurementTypeParent } = data;

  return (
    <PressureDataLabelWrapper
      top={scaledDepth}
      data-testid={`pressure-data-${measurementTypeParent}`}
    >
      <MeasurementLabel>
        {value} {unit}
      </MeasurementLabel>
      <PressureLabelImage measurementTypeParent={measurementTypeParent} />
    </PressureDataLabelWrapper>
  );
};
