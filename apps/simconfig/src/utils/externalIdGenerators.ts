import { sanitizeValue } from './stringUtils';

interface TimeSeriesExternalIdValues {
  simulator: string;
  modelName: string;
  calculationType: string;
  timeSeriesType: string;
}
export const generateOutputTimeSeriesExternalId = ({
  simulator,
  timeSeriesType,
  calculationType,
  modelName,
}: TimeSeriesExternalIdValues) =>
  sanitizeValue(
    `${simulator}-OUTPUT-${calculationType}-${timeSeriesType}-${modelName}`
  );

export const generateInputTimeSeriesExternalId = ({
  simulator,
  timeSeriesType,
  calculationType,
  modelName,
}: TimeSeriesExternalIdValues) =>
  sanitizeValue(
    `${simulator}-INPUT-${calculationType}-${timeSeriesType}-${modelName}`
  );
