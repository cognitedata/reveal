/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type TriggerTypeData, type TimeseriesRuleTrigger } from '../types';
import { getTriggerTimeseriesNumericData } from './getTriggerTimeseriesNumericData';
import { triggerDataTimeseries } from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';
import { type Asset } from '@cognite/sdk';

describe('getTriggerTimeseriesNumericData', () => {
  it('should return the latest datapoint value for a timeseries trigger', () => {
    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerTimeseriesNumericData(triggerDataTimeseries, trigger);

    const timeseries =
      triggerDataTimeseries.type === 'timeseries' ? triggerDataTimeseries.timeseries : undefined;
    const datapoints = timeseries?.timeseriesWithDatapoints[0].datapoints;
    const latestDatapoint =
      datapoints !== undefined ? datapoints[datapoints.length - 1].value : undefined;

    expect(result).toBe(latestDatapoint);
  });

  it('should return the latest datapoint value from a string time series for a time series trigger', () => {
    const triggerTypeData: TriggerTypeData = {
      type: 'timeseries',
      timeseries: {
        timeseriesWithDatapoints: [
          {
            externalId: 'timeseries-1',
            id: 123,
            isString: true,
            isStep: false,
            description: 'description',
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
            datapoints: [
              { timestamp: new Date(), value: '42' },
              { timestamp: new Date(), value: '43' }
            ]
          }
        ],
        linkedAssets: {
          rootId: 0,
          name: '',
          id: 0,
          lastUpdatedTime: new Date(),
          createdTime: new Date()
        } satisfies Asset
      }
    };

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerTimeseriesNumericData(triggerTypeData, trigger);

    const timeseries =
      triggerTypeData.type === 'timeseries' ? triggerTypeData.timeseries : undefined;
    const datapoints = timeseries?.timeseriesWithDatapoints[0].datapoints;
    const latestDatapoint =
      datapoints !== undefined ? datapoints[datapoints.length - 1].value : undefined;

    expect(result).toBe(Number(latestDatapoint));
  });

  it('should return undefined if the rule trigger type is not timeseries', () => {
    const trigger: TimeseriesRuleTrigger = {
      type: 'metadata',
      externalId: 'timeseries-1'
    } as unknown as TimeseriesRuleTrigger;

    const result = getTriggerTimeseriesNumericData(triggerDataTimeseries, trigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if triggerTypeData type is not timeseries', () => {
    const triggerTypeData: TriggerTypeData = {
      type: 'metadata',
      asset: {
        metadata: {
          key1: '123'
        },
        rootId: 0,
        name: '',
        id: 0,
        lastUpdatedTime: new Date(),
        createdTime: new Date()
      }
    };

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerTimeseriesNumericData(triggerTypeData, trigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if no matching timeseries is found', () => {
    const triggerTypeData: TriggerTypeData = {
      type: 'timeseries',
      timeseries: {
        timeseriesWithDatapoints: [
          {
            externalId: 'timeseries-2',
            id: 123,
            isString: false,
            isStep: false,
            description: 'description',
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
            datapoints: [
              { timestamp: new Date(), value: 42 },
              { timestamp: new Date(), value: 43 }
            ]
          }
        ],
        linkedAssets: {
          rootId: 0,
          name: '',
          id: 0,
          lastUpdatedTime: new Date(),
          createdTime: new Date()
        } satisfies Asset
      }
    };

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerTimeseriesNumericData(triggerTypeData, trigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if no datapoints are found', () => {
    const triggerTypeData: TriggerTypeData = {
      type: 'timeseries',
      timeseries: {
        timeseriesWithDatapoints: [
          {
            externalId: 'timeseries-2',
            id: 123,
            isString: false,
            isStep: false,
            description: 'description',
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
            datapoints: []
          }
        ],
        linkedAssets: {
          rootId: 0,
          name: '',
          id: 0,
          lastUpdatedTime: new Date(),
          createdTime: new Date()
        }
      }
    };

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerTimeseriesNumericData(triggerTypeData, trigger);

    expect(result).toBeUndefined();
  });
});
