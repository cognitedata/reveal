import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

export type MeasurementView = DepthMeasurementWithData;

export type MeasurementViewMap = Record<string, MeasurementView[]>;
