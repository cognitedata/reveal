/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Datapoints } from '@cognite/sdk';
import { type AssetIdsAndTimeseries } from '../../../data-providers/types';
import { generateTimeseriesAndDatapointsFromTheAsset } from './generateTimeseriesAndDatapointsFromTheAsset';
import {
  assetIdsAndTimeseries,
  contextualizedAssetNodes,
  timeseriesDatapoints
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('generateTimeseriesAndDatapointsFromTheAsset', () => {
  it('should generate timeseries and datapoints from the asset', () => {
    const result = generateTimeseriesAndDatapointsFromTheAsset({
      contextualizedAssetNode: contextualizedAssetNodes[0],
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].externalId).toBe('timeseries-1');
    expect(result[0].datapoints).toEqual([
      {
        timestamp: timeseriesDatapoints[0].datapoints[0].timestamp,
        value: timeseriesDatapoints[0].datapoints[0].value
      }
    ]);
    expect(result[1].externalId).toBe('timeseries-2');
    expect(result[1].datapoints).toEqual([
      {
        timestamp: timeseriesDatapoints[1].datapoints[0].timestamp,
        value: timeseriesDatapoints[1].datapoints[0].value
      }
    ]);
  });

  it('should return an empty array if no matching assetIdsAndTimeseries', () => {
    const mockedWrongAsset = {
      id: 3,
      externalId: 'asset-3',
      name: 'Asset 3',
      rootId: 0,
      lastUpdatedTime: new Date(),
      createdTime: new Date()
    };
    const result = generateTimeseriesAndDatapointsFromTheAsset({
      contextualizedAssetNode: mockedWrongAsset,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if empty timeseriesDatapoints', () => {
    const result = generateTimeseriesAndDatapointsFromTheAsset({
      contextualizedAssetNode: contextualizedAssetNodes[0],
      assetIdsAndTimeseries,
      timeseriesDatapoints: []
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if timeseries is undefined', () => {
    const assetIdsAndTimeseriesWithUndefinedTimeseries: AssetIdsAndTimeseries[] = [
      {
        assetIds: { externalId: 'asset-1' },
        timeseries: undefined
      }
    ];

    const result = generateTimeseriesAndDatapointsFromTheAsset({
      contextualizedAssetNode: contextualizedAssetNodes[0],
      assetIdsAndTimeseries: assetIdsAndTimeseriesWithUndefinedTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if no matching time series', () => {
    const timeseriesDatapointsWithNoMatch: Datapoints[] = [
      {
        externalId: 'timeseries-3',
        datapoints: [{ timestamp: new Date(), value: 42 }],
        isString: false,
        id: 3
      }
    ];

    const result = generateTimeseriesAndDatapointsFromTheAsset({
      contextualizedAssetNode: contextualizedAssetNodes[0],
      assetIdsAndTimeseries,
      timeseriesDatapoints: timeseriesDatapointsWithNoMatch
    });

    expect(result).toEqual([]);
  });
});
