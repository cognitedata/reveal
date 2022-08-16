import { MeasurementType } from '../types';

export const isMeasurementTypeFitOrLot = (measurementType: MeasurementType) => {
  return [MeasurementType.FIT, MeasurementType.LOT].includes(measurementType);
};
