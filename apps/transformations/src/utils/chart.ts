import {
  RUN_HISTORY_CHART_NUMBER_OF_TICKS_X_AXIS,
  RUN_HISTORY_CHART_TICK_LABEL_BASE_STYLES,
} from '@transformations/common';
import { JobAction, JOB_ACTIONS } from '@transformations/types';
import { TextProps } from '@visx/text/lib/Text';

export const getRunHistoryChartXAxisTickLabelStyle = (
  _: any,
  index: number
): TextProps => {
  let textAnchor: TextProps['textAnchor'] = 'middle';
  if (index === 0) {
    textAnchor = 'start';
  } else if (index === RUN_HISTORY_CHART_NUMBER_OF_TICKS_X_AXIS - 1) {
    textAnchor = 'end';
  }

  return {
    ...RUN_HISTORY_CHART_TICK_LABEL_BASE_STYLES,
    textAnchor,
    dy: 3,
  };
};

export const getRunHistoryChartYAxisTickLabelStyle = (): TextProps => {
  return {
    ...RUN_HISTORY_CHART_TICK_LABEL_BASE_STYLES,
    textAnchor: 'end',
    dy: 3,
  };
};

export const generateRunHistoryChartTickValues = (
  min: number,
  max: number,
  stepNumber: number
) => {
  const interval = (max - min) / (stepNumber - 1);

  return Array(stepNumber)
    .fill(0)
    .map((_, index) => Math.floor(min + index * interval));
};

export const isMetricForJobAction = (metricName: string): boolean => {
  return JOB_ACTIONS.some((jobAction) => metricName.endsWith(jobAction));
};

export const parseMetricName = (
  name: string
): {
  action?: JobAction;
  label: string;
  resource?: string;
} => {
  if (isMetricForJobAction(name)) {
    const splitted = name.split('.');
    return {
      action: splitted[splitted.length - 1] as JobAction,
      resource: splitted[splitted.length - 2],
      label: splitted.slice(0, splitted.length - 1).join('.'),
    };
  }

  // this case applies when metric name is `requestsWithoutRetries` or it is
  // an unknown action for us
  return {
    label: name,
  };
};

const RUN_HISTORY_CHART_CATEGORY_COLORS = [
  'blue',
  'green',
  'purple',
  'orange',
  'pink',
  'yellow',
  'red',
] as const;

export type RunHistoryChartCategoryColor =
  | (typeof RUN_HISTORY_CHART_CATEGORY_COLORS)[number]
  | 'grayscale';

export const getRunHistoryChartCategoryColor = (
  index: number
): RunHistoryChartCategoryColor => {
  return RUN_HISTORY_CHART_CATEGORY_COLORS[
    index % RUN_HISTORY_CHART_CATEGORY_COLORS.length
  ];
};
