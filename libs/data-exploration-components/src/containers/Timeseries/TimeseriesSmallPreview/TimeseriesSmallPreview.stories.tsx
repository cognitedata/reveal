import React from 'react';
import { timeseries } from '@data-exploration-components/stubs/timeseries';
import { TimeseriesSmallPreview } from './TimeseriesSmallPreview';

export default {
  title: 'Time Series/TimeseriesSmallPreview',
  component: TimeseriesSmallPreview,
};
export const Example = () => (
  <TimeseriesSmallPreview timeseriesId={timeseries[0].id} />
);
