import { mockNdsEvents } from '__test-utils/fixtures/nds';

import { getTrajectoryInterpolationRequests } from '../nds';

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
});
