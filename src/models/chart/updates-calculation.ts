import { Chart, ScheduledCalculation } from './types';
import { addItem, removeItem } from './helpers';

/**
 * Add Scheduled Calculation
 * ===================================
 * Adds an item to scheduledCalculation Array
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param calculation             - New calculation object that is likely a clone of existing calculation
 * @returns Chart                 - Returns updated CHART object with updated scheduledCalculationCollection[]
 */

export function addScheduledCalculation(
  chart: Chart,
  calculation: ScheduledCalculation
): Chart {
  return addItem(chart, 'scheduledCalculationCollection', calculation);
}

/**
 * Remove Scheduled Calculation
 * ===================================
 * Reoves an item from scheduledCalculation Array
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param calculationId           - ID of the scheduled calculation for removal
 * @returns Chart                 - Returns updated CHART object with updated scheduledCalculationCollection[]
 */

export function removeScheduledCalculation(
  chart: Chart,
  calculationId: string
): Chart {
  return removeItem(chart, 'scheduledCalculationCollection', calculationId);
}
