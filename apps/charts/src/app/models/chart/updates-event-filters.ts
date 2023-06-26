import { Chart, ChartEventFilters } from './types';

/**
 * Initialize eventFilters
 * ===================================
 * Initializes an empty array of `eventFilters` in the `chart` instance.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @returns Chart                 - Returns updated CHART object with empty eventFilters[]
 */
export function initEventFilters(chart: Chart): Chart {
  return {
    ...chart,
    eventFilters: [],
  };
}

/**
 * Add Event Filter
 * ===================================
 * Adds a new eventFilters in Chart.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param eventFilters             - A new ID to create empty eventFilters object.
 * @returns Chart                 - Returns updated CHART object with given eventFilters added to the top of eventFilters[]
 */
export const addEventFilters = (chart: Chart, filters: ChartEventFilters) => {
  return {
    ...chart!,
    eventFilters: [filters, ...(chart?.eventFilters || [])],
  };
};

/**
 * Remove EventFilter
 * ===================================
 * Initializes a new eventFilters object in Chart only with ID and default name.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param id                      - The ID of eventFilters that needs to be removed.
 * @returns Chart                 - Returns updated CHART object with given eventFilters removed
 */
export const removeChartEventFilter = (chart: Chart, id: string) => {
  return {
    ...chart!,
    eventFilters: [
      ...(chart?.eventFilters || []).filter((item) => item.id !== id),
    ],
  };
};

/**
 * Update EventFilters
 * ===================================
 * Updates the eventFilters with given new eventFilters object and maintains the array order.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param updatedEventFilter      - An updated eventFilters object
 * @returns Chart                 - Returns updated CHART object with updated eventFilters
 */

const updateChartEventFilters = (
  chart: Chart,
  updatedEventFilter: ChartEventFilters
) => {
  const updatedEventFilterIndex = (chart?.eventFilters || []).findIndex(
    ({ id }) => id === updatedEventFilter.id
  );

  return {
    ...chart!,
    eventFilters: [
      ...(chart?.eventFilters || []).slice(0, updatedEventFilterIndex),
      updatedEventFilter,
      ...(chart?.eventFilters || []).slice(updatedEventFilterIndex + 1),
    ],
  };
};

/**
 * EventFilters Properties
 * ===================================
 * Update eventFilters properties as a prtial update
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - eventFilters id
 * @param diff                    - eventFilters partial object
 * @returns Chart                 - an updated Chart object
 */
export const updateEventFiltersProperties = (
  chart: Chart,
  id: string,
  diff: Partial<ChartEventFilters>
) => {
  const eventFilters = chart.eventFilters?.find((item) => item.id === id);
  if (!eventFilters) return chart;

  return updateChartEventFilters(chart, {
    ...eventFilters,
    ...diff,
  });
};
