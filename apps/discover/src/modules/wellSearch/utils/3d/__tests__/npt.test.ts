import { mockNpt } from '__test-utils/fixtures/npt';
import { mockedWellStateFixture } from '__test-utils/fixtures/well';
import { WellboreNPTEventsMap } from 'modules/wellSearch/types';

import { mapNPTTo3D } from '../npt';

describe('mapNPTTo3D', () => {
  it(`should convert npt events to 3d events format`, () => {
    const events: WellboreNPTEventsMap = {
      759155409324993: [
        {
          ...mockNpt,
          ...{
            measuredDepth: {
              unit: 'meter',
              value: 100,
            },
          },
        },
      ],
    };

    const results = mapNPTTo3D(events, mockedWellStateFixture.wellSearch.wells);
    expect(results).toEqual([
      {
        assetIds: [759155409324993],
        metadata: {
          npt_md: '328.084',
          description: '',
        },
      },
    ]);
  });
});
