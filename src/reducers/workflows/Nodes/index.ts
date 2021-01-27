// import * as UnitConversion from './UnitConversion';
// import * as AddConstant from './AddConstant';
// import * as CDFDatapoints from './CDFDataPoints';
// import * as CogniteFunction from './CogniteFunction';
// import * as Difference from './Difference';
// import * as WorkspaceTimeSeries from './WorkspaceTimeSeries';
import * as DSPToolboxFunction from './DSPToolboxFunction';
import * as TimeSeriesReference from './TimeSeriesReference';
import * as Constant from './Constant';
import * as OutputSeries from './OutputSeries';
import { NodeOption } from '../types';

export default [
  {
    name: 'Time Series',
    ...TimeSeriesReference,
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
  // {
  //   name: 'Workspace Time Series',
  //   ...WorkspaceTimeSeries,
  // },
  // {
  //   name: 'Difference',
  //   ...Difference,
  // },
  // {
  //   name: 'Multiply',
  //   ...UnitConversion,
  // },
  // {
  //   name: 'Add Constant',
  //   ...AddConstant,
  // },

  // {
  //   name: 'CDF Time Series',
  //   ...CDFDatapoints,
  // },
  // {
  //   name: 'CDF Function',
  //   ...CogniteFunction,
  // },
] as NodeOption[];
