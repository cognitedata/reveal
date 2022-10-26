import { Chart, ChartThreshold, ChartThresholdEventFilter } from './types';

/**
 * Initialize thresholdCollection
 * ===================================
 * Initializes an empty array of `thresholdCollection` in the `chart` instance.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @returns Chart                 - Returns updated CHART object with empty thresholdCollection[]
 */
export function initializeThresholdCollections(chart: Chart): Chart {
  return {
    ...chart,
    thresholdCollection: [] as ChartThreshold[],
  };
}

/**
 * Add Threshold
 * ===================================
 * Initializes a new threshold object in Chart only with ID and default name.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param id                      - A new ID to create empty threshold object.
 * @returns Chart                 - Returns updated CHART object with given threshold added to the top of thresholdCollection[]
 */
export const addChartThreshold = (
  chart: Chart,
  newThreshold: ChartThreshold
) => {
  return {
    ...chart!,
    thresholdCollection: [newThreshold, ...(chart?.thresholdCollection || [])],
  };
};

/**
 * Remove Threshold
 * ===================================
 * Initializes a new threshold object in Chart only with ID and default name.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param id                      - The ID of threshold that needs to be removed.
 * @returns Chart                 - Returns updated CHART object with given threshold removed
 */
export const removeChartThreshold = (chart: Chart, id: string) => {
  return {
    ...chart!,
    thresholdCollection: [
      ...(chart?.thresholdCollection || []).filter((item) => item.id !== id),
    ],
  };
};

/**
 * Update Threshold
 * ===================================
 * Updates a new threshold object with given new threshold object and maintains the array order.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - A current chart instance to update
 * @param updatedThreshold        - An updated threshold object
 * @returns Chart                 - Returns updated CHART object with updated threshold
 */
const updateChartThreshold = (
  chart: Chart,
  updatedThreshold: ChartThreshold
) => {
  const updatedThresholdIndex = (chart?.thresholdCollection || []).findIndex(
    ({ id }) => id === updatedThreshold.id
  );

  return {
    ...chart!,
    thresholdCollection: [
      ...(chart?.thresholdCollection || []).slice(0, updatedThresholdIndex),
      updatedThreshold,
      ...(chart?.thresholdCollection || []).slice(updatedThresholdIndex + 1),
    ],
  };
};

/**
 * Threshold Name
 * ===================================
 * Updates given threshold with a new name
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param name                    - a new name for given thresold
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdName = (
  chart: Chart,
  id: string,
  name: string
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;
  if (name === threshold.name) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    name,
  });
};

/**
 * Threshold Visibility
 * ===================================
 * Updates given threshold visibility
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param visible                 - show/hide boolean
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdVisibility = (
  chart: Chart,
  id: string,
  visible: boolean
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;
  if (visible === threshold.visible) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    visible,
  });
};

/**
 * Threshold Source
 * ===================================
 * Update threshold source with given timeseries or workflow ID
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param sourceId                - Source ID - either timeseries or workflow ID
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdSelectedSource = (
  chart: Chart,
  id: string,
  sourceId: string
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;
  if (sourceId === threshold.sourceId) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    sourceId,
  });
};

/**
 * Threshold Type
 * ===================================
 * Update threshold type for plotting.
 * UNDER | OVER - shows a single line.
 * BETWEEN - plots a rectangle
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param type                    - Updated threshold graph type i.e. UNDER | OVER | BETWEEN
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdType = (
  chart: Chart,
  id: string,
  type: ChartThreshold['type']
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    type,
  });
};

/**
 * Threshold Lower Limit
 * ===================================
 * Update threshold lower limit value
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param lowerLimit              - lower limit value of threshold
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdLowerLimit = (
  chart: Chart,
  id: string,
  lowerLimit: number
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    lowerLimit,
  });
};

/**
 * Threshold Upper Limit
 * ===================================
 * Update threshold upper limit value
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param upperLimit              - upper limit value of threshold
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdUpperLimit = (
  chart: Chart,
  id: string,
  upperLimit: number
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    upperLimit,
  });
};

/**
 * Threshold Filters
 * ===================================
 * Update threshold filters for event length
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param Filters                 - {Object} filter object to specify min/max durations
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdEventFilters = (
  chart: Chart,
  id: string,
  filter: ChartThresholdEventFilter
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    filter,
  });
};

/**
 * Threshold Properties
 * ===================================
 * Update threshold properties as a prtial update
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param chart                   - Chart object
 * @param id                      - threshold id
 * @param diff                    - threshold partial object
 * @returns Chart                 - an updated Chart object
 */
export const updateChartThresholdProperties = (
  chart: Chart,
  id: string,
  diff: Partial<ChartThreshold>
) => {
  const threshold = chart.thresholdCollection?.find((item) => item.id === id);
  if (!threshold) return chart;

  return updateChartThreshold(chart, {
    ...threshold,
    ...diff,
  });
};
