import { DatapointAggregates } from '@cognite/sdk';
import { getTimeseriesSummaryById } from './selectors';
import { TimeseriesCollection } from './types';

describe('timeseries model', () => {
  describe('getTimeseriesSummaryById', () => {
    it('works for empty collection', () => {
      const timeseriesCollection: TimeseriesCollection = [];
      const externalId: string = 'abc-123';
      const summary = getTimeseriesSummaryById(
        timeseriesCollection,
        externalId
      );
      expect(summary).toEqual(undefined);
    });

    it('works for missing id', () => {
      const timeseriesCollection: TimeseriesCollection = [];
      const externalId = undefined;
      const summary = getTimeseriesSummaryById(
        timeseriesCollection,
        externalId
      );
      expect(summary).toEqual(undefined);
    });

    it('works for id not present in collection', () => {
      const timeseriesCollection: TimeseriesCollection = [
        {
          externalId: 'abc-123',
          loading: false,
          series: {
            id: 123,
            externalId: 'abc-123',
            datapoints: [],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
        {
          externalId: 'abc-124',
          loading: false,
          series: {
            id: 124,
            externalId: 'abc-124',
            datapoints: [],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
        {
          externalId: 'abc-125',
          loading: false,
          series: {
            id: 125,
            externalId: 'abc-125',
            datapoints: [],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
      ];
      const externalId: string = 'id-that-does-not-exist-in-list';
      const summary = getTimeseriesSummaryById(
        timeseriesCollection,
        externalId
      );
      expect(summary).toEqual(undefined);
    });

    it('calculates correct summary for found timeseries', () => {
      const timeseriesCollection: TimeseriesCollection = [
        {
          externalId: 'abc-123',
          loading: false,
          series: {
            id: 123,
            externalId: 'abc-123',
            datapoints: [
              {
                timestamp: new Date(),
                min: -10,
                max: 10,
                sum: 2,
                count: 10,
              },
              {
                timestamp: new Date(),
                min: -20,
                max: 20,
                sum: 4,
                count: 20,
              },
              {
                timestamp: new Date(),
                min: -7,
                max: 8,
                sum: 6,
                count: 30,
              },
            ],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
        {
          externalId: 'abc-124',
          loading: false,
          series: {
            id: 124,
            externalId: 'abc-124',
            datapoints: [],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
        {
          externalId: 'abc-125',
          loading: false,
          series: {
            id: 125,
            externalId: 'abc-125',
            datapoints: [],
            isStep: false,
            isString: false,
          } as DatapointAggregates,
        },
      ];

      const externalId: string = 'abc-123';

      const summary = getTimeseriesSummaryById(
        timeseriesCollection,
        externalId
      );

      expect(summary).toEqual({ max: 20, mean: 0.2, min: -20 });
    });
  });
});
