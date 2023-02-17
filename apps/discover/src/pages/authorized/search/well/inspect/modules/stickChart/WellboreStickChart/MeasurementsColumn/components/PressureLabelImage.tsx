import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import { getPressureLabelImage } from '../../../utils/getPressureLabelImage';

export interface PressureLabelImageProps {
  measurementTypeParent: MeasurementTypeParent;
}

export const PressureLabelImage: React.FC<PressureLabelImageProps> = ({
  measurementTypeParent,
}) => {
  const image = getPressureLabelImage(measurementTypeParent);

  if (!image) {
    return null;
  }

  return <img src={image} alt={measurementTypeParent} />;
};
