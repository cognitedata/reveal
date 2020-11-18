import * as DummyTimeSeries from './DummyTimeSeries';
import * as UnitConversion from './UnitConversion';
import * as OutputSeries from './OutputSeries';
import * as CDFDatapoints from './CDFDataPoints';
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
    name: 'Output Timeseries',
    ...OutputSeries,
  },
  {
    name: 'CDF Datapoints',
    ...CDFDatapoints,
  },
] as NodeOption[];
