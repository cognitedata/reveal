import * as DummyTimeSeries from './DummyTimeSeries';
import * as UnitConversion from './UnitConversion';
import * as AddConstant from './AddConstant';
import * as OutputSeries from './OutputSeries';
import * as CDFDatapoints from './CDFDataPoints';
import * as CogniteFunction from './CogniteFunction';
import { NodeOption } from '../types';

export default [
  {
    name: 'Dummy Time Series',
    ...DummyTimeSeries,
  },
  {
    name: 'UnitConversion',
    ...UnitConversion,
  },
  {
    name: 'AddConstant',
    ...AddConstant,
  },
  {
    name: 'Output Timeseries',
    ...OutputSeries,
  },
  {
    name: 'CDF Datapoints',
    ...CDFDatapoints,
  },
  {
    name: 'CDF Function',
    ...CogniteFunction,
  },
] as NodeOption[];
