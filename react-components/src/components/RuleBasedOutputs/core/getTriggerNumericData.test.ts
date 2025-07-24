/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import {
  type TimeseriesRuleTrigger,
  type MetadataRuleTrigger,
  type TriggerTypeData
} from '../types';
import { getTriggerNumericData } from './getTriggerNumericData';
import {
  mockedTrigger,
  triggerDataFdmNumeric,
  triggerDataTimeseries
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('getTriggerNumericData', () => {
  it('should return numeric data for metadata trigger', () => {
    const triggerTypeData: TriggerTypeData[] = [
      {
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
      }
    ];

    const trigger: MetadataRuleTrigger = {
      type: 'metadata',
      key: 'key1'
    };

    const result = getTriggerNumericData(triggerTypeData, trigger);

    expect(result).toBe(123);
  });

  it('should return numeric data for timeseries trigger', () => {
    const timeseries =
      triggerDataTimeseries.type === 'timeseries' ? triggerDataTimeseries.timeseries : undefined;
    const datapoints = timeseries?.timeseriesWithDatapoints[0].datapoints;
    const latestDatapoint =
      datapoints !== undefined ? datapoints[datapoints.length - 1].value : undefined;

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerNumericData([triggerDataTimeseries], trigger);

    expect(result).toBe(latestDatapoint);
  });

  it('should return undefined if no matching trigger type data is found', () => {
    const triggerTypeData: TriggerTypeData[] = [
      {
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
      }
    ];

    const trigger: TimeseriesRuleTrigger = {
      type: 'timeseries',
      externalId: 'timeseries-1'
    };

    const result = getTriggerNumericData(triggerTypeData, trigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if currentTriggerData is undefined', () => {
    const triggerTypeData: TriggerTypeData[] = [];

    const trigger: MetadataRuleTrigger = {
      type: 'metadata',
      key: 'key1'
    };

    const result = getTriggerNumericData(triggerTypeData, trigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if trigger type is not metadata or timeseries', () => {
    const result = getTriggerNumericData([triggerDataFdmNumeric], mockedTrigger);

    expect(result).toBeUndefined();
  });
});
