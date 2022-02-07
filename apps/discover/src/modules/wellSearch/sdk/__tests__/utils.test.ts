import { mapV2ToV3DepthMeasurementFilter } from '../utils';

describe('utils', () => {
  describe('mapV2ToV3DepthMeasurementFilter', () => {
    test('should return undefined when depthMeasurements is not passed', () => {
      const result = mapV2ToV3DepthMeasurementFilter();
      expect(result).toBeUndefined();
    });
    test('should return undefined when containsAny is not passed', () => {
      const result = mapV2ToV3DepthMeasurementFilter({});
      expect(result).toBeUndefined();
    });
    test('should return undefined when containsAny is empty', () => {
      const result = mapV2ToV3DepthMeasurementFilter({ containsAny: [] });
      expect(result).toBeUndefined();
    });
    test('should return measurementTypes filter when containsAny has data', () => {
      const result = mapV2ToV3DepthMeasurementFilter({
        containsAny: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore v2 sdk has exhaustive types whereas v3 has any string
          { measurementType: 'test1' },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore v2 sdk has exhaustive types whereas v3 has any string
          { measurementType: 'test2' },
        ],
      });
      expect(result).toEqual({
        measurementTypes: { containsAny: ['test1', 'test2'] },
      });
    });
  });
});
