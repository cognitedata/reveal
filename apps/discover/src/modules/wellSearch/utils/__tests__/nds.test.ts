import {
  mockNdsEvents,
  mockTrueVerticalDepths,
} from '__test-utils/fixtures/nds';

import {
  getDummyTrueVerticalDepths,
  getTrajectoryInterpolationRequests,
  getTVDForMD,
} from '../nds';

describe('nds events utils', () => {
  it('should return trajectory interpolation requests for given nds events', () => {
    expect(getTrajectoryInterpolationRequests(mockNdsEvents)).toEqual([
      {
        wellboreId: { matchingId: 'wellboreMatchingId-1' },
        measuredDepths: [75, 85],
        measuredDepthUnit: { unit: 'meter' },
      },
      {
        wellboreId: { matchingId: 'wellboreMatchingId-2' },
        measuredDepths: [75, 85],
        measuredDepthUnit: { unit: 'meter' },
      },
    ]);
  });

  it('should return the tvd for given md as expected', () => {
    expect(getTVDForMD(mockTrueVerticalDepths, 75)).toEqual(35);
    expect(getTVDForMD(mockTrueVerticalDepths, 85)).toEqual(50);
    expect(getTVDForMD(mockTrueVerticalDepths, 50)).toBeUndefined();
  });

  it('should return dummy true vertical depths or the given nds events', () => {
    expect(getDummyTrueVerticalDepths(mockNdsEvents)).toEqual([
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
