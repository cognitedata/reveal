import { MeasurementTypeParent } from '../types';

export const isMeasurementTypeFitOrLot = (
  measurementType: MeasurementTypeParent
) => {
  return [MeasurementTypeParent.FIT, MeasurementTypeParent.LOT].includes(
    measurementType
  );
};
