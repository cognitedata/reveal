import React from 'react';
import { timeseries } from 'stubs/timeseries';
import { TimeseriesPreview } from './TimeseriesPreview';

export default {
  title: 'Time Series/TimeseriesPreview',
  component: TimeseriesPreview,
};
export const Example = () => (
  <TimeseriesPreview timeseriesId={timeseries[0].id} />
);
