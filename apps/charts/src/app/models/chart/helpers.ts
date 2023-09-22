/**
 * Helper Methods to mutate Chart
 */

import { v4 as uuidv4 } from 'uuid';

import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  CollectionType,
  ScheduledCalculation,
  UserInfo,
  SourceType,
} from '@cognite/charts-lib';

const COLLECTION_TYPE_MAP: Record<CollectionType, SourceType> = {
  workflowCollection: 'workflow',
  timeSeriesCollection: 'timeseries',
  scheduledCalculationCollection: 'scheduledCalculation',
};

/**
 * Add Item
 * ===================================
 * Adds a new item to the respective Workflow, Timeseries, or ScheduledCalculation collection.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart           - The current chart instance to update
 * @param collectionType  - One of 'timeSeriesCollection', 'workflowCollection', or 'scheduledCalculationCollection'
 * @param item            - The item to add to the collection
 * @returns               - The updated Chart object
 */
export function addItem<
  T extends ChartWorkflow | ChartTimeSeries | ScheduledCalculation
>(chart: Chart, collectionType: CollectionType, item: T): Chart {
  const type = COLLECTION_TYPE_MAP[collectionType];

  return {
    ...chart,
    [collectionType]: [...(chart[collectionType] || []), { ...item, type }],
    sourceCollection: [
      { id: item.id, type },
      ...(chart.sourceCollection || []),
    ],
  };
}

/**
 * Remove Item
 * ===================================
 * Removes the specified item from the respective Workflow, Timeseries, or ScheduledCalculation collection.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart           - The current chart instance to update
 * @param collectionType  - One of 'timeSeriesCollection', 'workflowCollection', or 'scheduledCalculationCollection'
 * @param itemId          - The ID of the item to remove from the collection
 * @returns               The updated Chart object
 */
export function removeItem(
  chart: Chart,
  collectionType: CollectionType,
  itemId: string
): Chart {
  return {
    ...chart,
    // @ts-ignore
    [collectionType]: chart[collectionType]?.filter((t) => t.id !== itemId),
    sourceCollection: chart.sourceCollection?.filter((t) => t.id !== itemId),
  };
}

/**
 * Duplicate Chart
 * ===================================
 * Creates a clone of the given chart with the current user's information and new timestamps.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart         - The current chart instance to update
 * @param currentUser   - The currently logged-in user's information
 * @returns             A new copy of the chart
 */
export function duplicateChart(chart: Chart, currentUser: UserInfo): Chart {
  const newChartId = uuidv4();
  return {
    ...chart,
    id: newChartId,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    name: `${chart.name} Copy`,
    public: false,
    user: currentUser.id,
    userInfo: currentUser,
  };
}
