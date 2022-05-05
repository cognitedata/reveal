import { renderHook } from '@testing-library/react-hooks';
import { Chart, ChartThreshold } from 'models/chart/types';

import useThresholdsResults, {
  thresholdParameters,
} from './threshold-calculations';

const thresholdResultMockData = {
  data: {
    error: null,
    results: {
      count: 0,
      cumulative_duration: 0,
      events: [],
    },
    warnings: null,
  },
  error: null,
};

jest.mock('hooks/calculation-backend', () => ({
  ...jest.requireActual('hooks/calculation-backend'),
  useCreateThreshold: () => () => {
    return {
      data: {
        id: '4d09e78c-e707-4e82-ad76-42c9a3081ae6',
        status: 'Pending',
      },
    };
  },
  useThresholdCreator: () => () => {},
  useThresholdIsReady: () => {
    return { data: 'Success', error: null };
  },
  useThresholdResultData: () => {
    return { data: thresholdResultMockData, error: null };
  },
}));

jest.mock('models/chart/atom', () => ({
  ...jest.requireActual('models/chart/atom'),
  useChartAtom: () => {
    const id = '816711a7-25a3-48a3-a7e1-822e35a515sa';
    const chart: Chart = {
      id,
      version: 1,
      name: 'test chart',
      user: 'user_1@example.org',
      updatedAt: 1615976865123,
      createdAt: 1615976863997,
      public: true,
      dateFrom: 'then',
      dateTo: 'now',
    };

    return [chart, () => {}];
  },
}));

describe('thresholdParameters', () => {
  it('should create thresholdParameters for `between` type', () => {
    const thresholdItem: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      type: 'between',
      visible: true,
      lowerLimit: 20,
      upperLimit: 30,
      filter: {
        maxUnit: 'hours',
        minValue: 0,
        minUnit: 'seconds',
        maxValue: 1000000,
      },
    };

    const params = thresholdParameters(
      '2020-08-13T20:55:41.145Z',
      '2021-05-16T14:56:34.092Z',
      thresholdItem,
      'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
      'timeseries',
      'seconds',
      'hours'
    );

    expect(params).toEqual({
      start_time: 1597352141145,
      end_time: 1621176994092,
      threshold_options: {
        limits: {
          lower: 20,
          upper: 30,
        },
        filter: {
          min: 0,
          max: 3600000000000,
        },
      },
      tag: 'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
    });
  });

  it('should create thresholdParameters for `under` type', () => {
    const thresholdItem: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      type: 'under',
      visible: true,
      lowerLimit: undefined,
      upperLimit: 30,
      filter: {
        maxUnit: 'hours',
        minValue: 0,
        minUnit: 'seconds',
        maxValue: 1000000,
      },
    };

    const params = thresholdParameters(
      '2020-08-13T20:55:41.145Z',
      '2021-05-16T14:56:34.092Z',
      thresholdItem,
      'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
      'timeseries',
      'seconds',
      'hours'
    );

    expect(params).toEqual({
      start_time: 1597352141145,
      end_time: 1621176994092,
      threshold_options: {
        limits: {
          lower: undefined,
          upper: 30,
        },
        filter: {
          min: 0,
          max: 3600000000000,
        },
      },
      tag: 'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
    });
  });

  it('should create thresholdParameters for `over` type', () => {
    const thresholdItem: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      type: 'over',
      visible: true,
      lowerLimit: 10,
      upperLimit: undefined,
      filter: {
        maxUnit: 'hours',
        minValue: 0,
        minUnit: 'seconds',
        maxValue: 1000000,
      },
    };

    const params = thresholdParameters(
      '2020-08-13T20:55:41.145Z',
      '2021-05-16T14:56:34.092Z',
      thresholdItem,
      'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
      'timeseries',
      'seconds',
      'hours'
    );

    expect(params).toEqual({
      start_time: 1597352141145,
      end_time: 1621176994092,
      threshold_options: {
        limits: {
          lower: 10,
          upper: undefined,
        },
        filter: {
          min: 0,
          max: 3600000000000,
        },
      },
      tag: 'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
    });
  });
});

describe('useThresholdsResults', () => {
  it('should call calculation backend for timeseries and return results', () => {
    const threshold: ChartThreshold = {
      id: '816711a7-25a3-48a3-a7e1-822e35a515fb',
      name: 'New threshold 3',
      visible: true,
      sourceId: 'c207897c-33c3-44d2-ba68-f8ec6950dfac',
      lowerLimit: undefined,
      upperLimit: 32,
      type: 'between',
      filter: {},
    };
    const { result } = renderHook(() =>
      useThresholdsResults(
        threshold,
        'timeseries',
        '19fa2ed1-6e30-4dd7-834d-d47e231287as4'
      )
    );

    expect(result.current).toStrictEqual({
      data: thresholdResultMockData,
    });
  });

  it('should call calculation backend for workflow and return results', () => {
    const { result } = renderHook(() =>
      useThresholdsResults(
        {
          id: '816711a7-25a3-48a3-a7e1-822e35a515fb',
          name: 'New threshold 3',
          visible: true,
          sourceId: 'c207897c-33c3-44d2-ba68-f8ec6950dfac',
          lowerLimit: 29,
          upperLimit: 32,
          type: 'between',
          filter: {},
        },
        'workflow',
        '19fa2ed1-6e30-4dd7-834d-d47e231287as4'
      )
    );

    expect(result.current).toStrictEqual({
      data: thresholdResultMockData,
    });
  });
});
