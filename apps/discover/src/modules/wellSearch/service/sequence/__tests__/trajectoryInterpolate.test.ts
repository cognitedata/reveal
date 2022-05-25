import { mockTrueVerticalDepths } from '__test-utils/fixtures/nds';

import {
  getDummyTrueVerticalDepths,
  getTVDForMD,
  ResponseItemType,
} from '../../../../../domain/wells/trajectory/service/network/trajectoryInterpolate';

const mockResponseItems: ResponseItemType[] = [
  {
    wellboreAssetExternalId: 'wellboreAssetExternalId-1',
    wellboreMatchingId: 'wellboreMatchingId-1',
  },
  {
    wellboreAssetExternalId: 'wellboreAssetExternalId-2',
    wellboreMatchingId: 'wellboreMatchingId-2',
  },
];

describe('trajectoryInterpolate', () => {
  describe('getDummyTrueVerticalDepths', () => {
    it('should return dummy true vertical depths or the given nds events', () => {
      expect(getDummyTrueVerticalDepths(mockResponseItems)).toEqual([
        {
          measuredDepths: [],
          sequenceSource: { sequenceExternalId: '', sourceName: '' },
          trueVerticalDepthUnit: { unit: 'meter' },
          trueVerticalDepths: [],
          wellboreAssetExternalId: 'wellboreAssetExternalId-1',
          wellboreMatchingId: 'wellboreMatchingId-1',
        },
        {
          measuredDepths: [],
          sequenceSource: { sequenceExternalId: '', sourceName: '' },
          trueVerticalDepthUnit: { unit: 'meter' },
          trueVerticalDepths: [],
          wellboreAssetExternalId: 'wellboreAssetExternalId-2',
          wellboreMatchingId: 'wellboreMatchingId-2',
        },
      ]);
    });
  });

  describe('getTVDForMD', () => {
    it('should return the tvd for given md as expected', () => {
      expect(getTVDForMD(mockTrueVerticalDepths, 75)).toEqual(35);
      expect(getTVDForMD(mockTrueVerticalDepths, 85)).toEqual(50);
      expect(getTVDForMD(mockTrueVerticalDepths, 50)).toBeUndefined();
    });
  });
});
