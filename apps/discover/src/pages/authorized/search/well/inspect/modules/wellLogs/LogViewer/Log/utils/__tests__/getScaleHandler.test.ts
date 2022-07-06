import { DepthIndexTypeEnum } from '@cognite/sdk-wells-v3';

import {
  getMockLogData,
  getMockLogDataForMDColumn,
  getMockLogDataForTVDColumn,
} from '__test-utils/fixtures/wellLogs';

import { Tuplet } from '../../types';
import {
  getClosestValue,
  getDefaultScaleHandler,
  getScaleHandler,
} from '../getScaleHandler';

describe('getScaleHandler', () => {
  it('should return default scale handler if exists only measured depth as a depth column', () => {
    const mdLogData = getMockLogDataForMDColumn();
    const { domain } = mdLogData.MD;
    const scaleHandler = getScaleHandler({
      logData: mdLogData,
      domain,
      depthIndexType: DepthIndexTypeEnum.MeasuredDepth,
    });
    const defaultScaleHandler = getDefaultScaleHandler(domain);

    expect(JSON.stringify(scaleHandler)).toEqual(
      JSON.stringify(defaultScaleHandler)
    );
  });

  it('should return default scale handler if exists only true vertical depth as a depth column', () => {
    const tvdLogData = getMockLogDataForTVDColumn();
    const { domain } = tvdLogData.TVD;
    const scaleHandler = getScaleHandler({
      logData: tvdLogData,
      domain,
      depthIndexType: DepthIndexTypeEnum.TrueVerticalDepth,
    });
    const defaultScaleHandler = getDefaultScaleHandler(domain);

    expect(JSON.stringify(scaleHandler)).toEqual(
      JSON.stringify(defaultScaleHandler)
    );
  });

  it('should return default scale handler if the secondary depth column values are null', () => {
    const mdLogData = getMockLogDataForMDColumn({
      values: [0, 50, 100],
      domain: [0, 100],
    });
    const tvdLogData = getMockLogDataForTVDColumn({
      values: [
        [0, null],
        [50, null],
        [100, null],
      ] as unknown as Tuplet[],
    });
    const { domain } = mdLogData.MD;

    const scaleHandler = getScaleHandler({
      logData: { ...mdLogData, ...tvdLogData },
      domain,
      depthIndexType: DepthIndexTypeEnum.MeasuredDepth,
    });
    const defaultScaleHandler = getDefaultScaleHandler(domain);

    expect(JSON.stringify(scaleHandler)).toEqual(
      JSON.stringify(defaultScaleHandler)
    );
  });

  it('should return default scale handler when data is OK, but depthIndexType is wrong', () => {
    const logData = getMockLogData();
    const { domain } = logData.TVD;

    const scaleHandler = getScaleHandler({
      logData,
      domain,
      depthIndexType: DepthIndexTypeEnum.MeasuredDepth, // Actually, it's TVD indexed.
    });
    const defaultScaleHandler = getDefaultScaleHandler(domain);

    expect(JSON.stringify(scaleHandler)).toEqual(
      JSON.stringify(defaultScaleHandler)
    );
  });

  it('should return scale handler when everything is OK', () => {
    const logData = getMockLogData();
    const { domain } = logData.TVD;

    const scaleHandler = getScaleHandler({
      logData,
      domain,
      depthIndexType: DepthIndexTypeEnum.TrueVerticalDepth,
    });
    const defaultScaleHandler = getDefaultScaleHandler(domain);

    /**
     * Should return the scale handler.
     * But, not the default scale handler.
     */
    expect(scaleHandler).toBeTruthy();
    expect(JSON.stringify(scaleHandler)).not.toEqual(
      JSON.stringify(defaultScaleHandler)
    );
  });
});

describe('getClosestValue', () => {
  it('should handle empty values array and return 0 as the closest value', () => {
    const value = getClosestValue([], 10);
    expect(value).toEqual(0);
  });

  it(`should return closest value`, () => {
    const value = getClosestValue([1, 2, 3], 2);
    expect(value).toEqual(2);

    const higherValue = getClosestValue([1, 2, 3], 5);
    expect(higherValue).toEqual(3);

    const lowerValue = getClosestValue([1, 2, 3], 0);
    expect(lowerValue).toEqual(1);
  });
});

describe('getDefaultScaleHandler', () => {
  it(`should return default scale handler which doesn't have any changes in scale mapping`, () => {
    const logData = getMockLogData();
    const { domain } = logData.TVD;

    const scaleHandler = getScaleHandler({
      logData,
      domain,
      depthIndexType: DepthIndexTypeEnum.TrueVerticalDepth,
    });

    expect(scaleHandler).toBeTruthy();
    expect(scaleHandler.scale.domain()).toEqual(domain);
    expect(scaleHandler.scale.range()).toEqual(domain);

    /**
     * It should have one-to-one scale mapping.
     * Used `Math.round` since it returns 9.999999999996 like values.
     */
    expect(Math.round(scaleHandler.scale(0))).toEqual(0);
    expect(Math.round(scaleHandler.scale(10))).toEqual(10);
  });
});
