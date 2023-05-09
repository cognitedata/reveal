import { PlotRelayoutEvent, PlotSelectionEvent } from 'plotly.js';

import get from 'lodash/get';

import { PlotRange } from '../types';
import { getAxisRangeFromValues } from './getAxisRangeFromValues';
import { getValueTypeAsNumber } from './getValueTypeAsNumber';

export const getPlotRangeFromRelayoutEvent = (
  event: PlotRelayoutEvent
): Partial<PlotRange> => {
  const xMin = get(event, 'xaxis.range[0]');
  const xMax = get(event, 'xaxis.range[1]');

  const yMin = get(event, 'yaxis.range[0]');
  const yMax = get(event, 'yaxis.range[1]');

  return {
    x: getAxisRangeFromValues(xMin, xMax),
    y: getAxisRangeFromValues(yMin, yMax),
  };
};

export const getPlotRangeFromPlotSelectionEvent = (
  event?: PlotSelectionEvent
): Partial<PlotRange> => {
  return {
    x: event?.range?.x.map(getValueTypeAsNumber),
    y: event?.range?.y.map(getValueTypeAsNumber),
  } as Partial<PlotRange>;
};
