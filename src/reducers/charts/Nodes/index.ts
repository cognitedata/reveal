import * as DSPToolboxFunction from './DSPToolboxFunction';
import * as TimeSeriesReference from './TimeSeriesReference';
import * as SourceReference from './SourceReference';
import * as Constant from './Constant';
import * as OutputSeries from './OutputSeries';
import { NodeOption } from '../types';

export default [
  {
    name: 'Time Series',
    ...TimeSeriesReference,
  },
  {
    name: 'Source',
    ...SourceReference,
  },
  {
    name: 'Constant',
    ...Constant,
  },
  {
    name: 'Toolbox Function',
    ...DSPToolboxFunction,
  },
  {
    name: 'Output Timeseries',
    ...OutputSeries,
  },
] as NodeOption[];
