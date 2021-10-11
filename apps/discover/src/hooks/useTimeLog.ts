import isUndefined from 'lodash/isUndefined';

import { ITimer, Metrics, useMetrics } from '@cognite/metrics';

import { log } from '_helpers/log';

/**
 * This hooks are use to log timing events so data can be visualized later for analysis.
 */
export enum TimeLogStages {
  Network = 'Network', // To log network latency
  Preperation = 'Preparation', // To log data manipulation time
  Render = 'Render', // To log component rendering time
}

/**
 * Return a cognite Metric instance
 *
 * @param component Name of the component being logged
 */
export const useGetCogniteMetric = (component: string): Metrics => {
  return useMetrics(component);
};

/**
 * Create a metric instance and start the timer with key provided and parms passed.
 *
 * @param stage Which stage is the logger for ( Network, Preparation or Render )
 * @param component Name of the component being logged
 * @param key String which is used to tag the log
 * @param eventParams Additional parameters need to store with the log
 */
export const useCreateMetricAndStartTimeLogger = (
  stage: TimeLogStages,
  component: string,
  key: string,
  eventParams?: any
): ITimer => {
  const metrics = useMetrics(component);
  return metrics.start(key, { ...eventParams, stage });
};

/**
 * Create a metric instance and start the timer with key provided and parms passed.
 *
 * @param stage Which stage is the logger for ( Network, Preparation or Render )
 * @param metric Metric instance
 * @param key String which is used to tag the log
 * @param eventParams Additional parameters need to store with the log
 */
export const useStartTimeLogger = (
  stage: TimeLogStages,
  metric: Metrics,
  key: string,
  eventParams?: any
): ITimer => {
  return metric.start(key, { ...eventParams, stage });
};

/**
 * Stops the timer and submit the time log with given parameters
 *
 * @param timer Timer instance that needed to stop
 * @param params Parameters need to store with log
 */
export const useStopTimeLogger = (timer?: ITimer, params?: any): void => {
  if (isUndefined(timer)) {
    log('Oops timer is undefined. Event will not be logged', [], 2);
    return;
  }
  timer.stop(params);
};
