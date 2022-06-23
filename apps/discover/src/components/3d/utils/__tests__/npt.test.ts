import { mockNpt } from '__test-utils/fixtures/npt';

import { mapNPTTo3D } from '../npt';

describe('mapNPTTo3D', () => {
  it(`should convert npt events to 3d events format`, () => {
    const events = [
      {
        ...mockNpt,
        wellboreMatchingId: '759155409324993',
        wellboreAssetExternalId: '759155409324993',
        measuredDepth: {
          unit: 'meter',
          value: 100,
        },
      },
    ];

    const results = mapNPTTo3D(events);
    expect(results).toEqual([
      {
        assetIds: ['759155409324993'],
        metadata: {
          npt_md: '328.084',
          description: '',
        },
      },
    ]);
  });
});
