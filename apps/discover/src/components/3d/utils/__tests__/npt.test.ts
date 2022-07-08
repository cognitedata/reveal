import { getMockNPTEvent } from 'domain/wells/npt/internal/__fixtures/npt';
import { NptInternal } from 'domain/wells/npt/internal/types';

import { mapNPTTo3D } from '../npt';

describe('mapNPTTo3D', () => {
  it(`should convert npt events to 3d events format`, () => {
    const events: NptInternal[] = [
      getMockNPTEvent({
        wellboreMatchingId: '759155409324993',
        wellboreAssetExternalId: '759155409324993',
        measuredDepth: {
          unit: 'm',
          value: 100,
        },
      }),
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
