import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

export interface WellLogView extends Omit<DepthMeasurementWithData, 'id'> {
  id: string;
  wellName?: string;
  wellboreName: string;
}
