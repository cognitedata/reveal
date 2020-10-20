import React from 'react';
import { timeseries } from 'stubs/timeseries';
import { UnitFilter } from './UnitFilter';

export default {
  title: 'Search Results/Filters/Time Series/UnitFilter',
  component: UnitFilter,
};
export const Example = () => <UnitFilter items={timeseries} />;
