import {
  ComputationStep,
  TimeSeriesInputTypeEnum,
} from '@cognite/calculation-backend';
import { ChartTimeSeries } from 'models/chart/types';
import { resolveTimeseriesSourceInSteps } from './utils';

describe('resolveTimeseriesSourceInSteps', () => {
  it('should resolve timeseries step input values correctly', () => {
    const chartTimeseries: ChartTimeSeries[] = [
      {
        id: 'some-chart-timeseries-id-1',
        name: 'Some Timeseries',
        color: 'red',
        tsId: 1,
        tsExternalId: 'ts-1',
        enabled: true,
        createdAt: 1000,
      },
      {
        id: 'some-chart-timeseries-id-2',
        name: 'Some Timeseries',
        color: 'red',
        tsId: 2,
        tsExternalId: 'ts-2',
        enabled: true,
        createdAt: 1000,
      },
    ];

    const steps: ComputationStep[] = [
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'some-chart-timeseries-id-1',
          },
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'some-chart-timeseries-id-2',
          },
        ],
      },
    ];

    const resolvedSteps = resolveTimeseriesSourceInSteps(
      steps,
      chartTimeseries
    );

    expect(resolvedSteps).toEqual([
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'ts-1',
          },
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'ts-2',
          },
        ],
      },
    ]);
  });
});
