import { ChartThreshold } from 'models/charts/charts/types/types';
/**
 * Valid Threshold
 * ===================================
 * A valid threshold for displaying in plotly. Based on type, either one or both upper and lowerLimit properties are required.
 *
 * @param threshold ChartThreshold object
 * @returns boolean
 */

export function isThresholdValid(threshold: ChartThreshold): boolean {
  if (!threshold.sourceId) return false;

  switch (threshold.type) {
    case 'between':
      return (
        typeof threshold.upperLimit === 'number' &&
        typeof threshold.lowerLimit === 'number' &&
        !isNaN(threshold.upperLimit) &&
        !isNaN(threshold.lowerLimit)
      );

    case 'under':
      return (
        typeof threshold.upperLimit === 'number' && !isNaN(threshold.upperLimit)
      );

    case 'over':
      return (
        typeof threshold.lowerLimit === 'number' && !isNaN(threshold.lowerLimit)
      );

    default:
      return false;
  }
}
