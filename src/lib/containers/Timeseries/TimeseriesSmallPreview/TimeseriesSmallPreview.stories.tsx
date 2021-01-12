import React from 'react';
import { timeseries } from 'lib/stubs/timeseries';
import { TimeseriesSmallPreview } from './TimeseriesSmallPreview';

export default {
  title: 'Time Series/TimeseriesSmallPreview',
  component: TimeseriesSmallPreview,
};
export const Example = () => (
  <TimeseriesSmallPreview timeseriesId={timeseries[0].id} />
);
