import DummyTimeSeries, {
  NodeEffect as DummyTimeSeriesEffect,
  NodeEffectId as DummyTimeSeriesEffectId,
} from './DummyTimeSeries';
import UnitConversion, {
  NodeEffect as UnitConversionEffect,
  NodeEffectId as UnitConversionEffectId,
} from './UnitConversion';
import OutputSeries from './OutputSeries';
import { NodeOption } from '../types';

export default [
  {
    name: 'Dummy Time Series',
    node: DummyTimeSeries,
    effect: DummyTimeSeriesEffect,
    effectId: DummyTimeSeriesEffectId,
  },
  {
    name: 'UnitConversion',
    node: UnitConversion,
    effect: UnitConversionEffect,
    effectId: UnitConversionEffectId,
  },
  {
    name: 'Dummy Time Series',
    node: OutputSeries,
  },
] as NodeOption[];
