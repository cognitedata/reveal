import { getMockNdsInternalEvents } from 'domain/wells/nds/internal/__fixtures/getMockNdsInternalEvents';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import { mapNDSTo3D } from '../nds';

describe('mapNDSTo3D', () => {
  it(`should convert nds events to 3d events format`, () => {
    const events: NdsInternalWithTvd[] = [getMockNdsInternalEvents()];

    const results = mapNDSTo3D(events);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: {
            diameter_hole: '0.445',
            diameter_hole_unit: 'm',
            md_hole_start: '2824',
            md_hole_start_unit: 'm',
            md_hole_end: '2863',
            md_hole_end_unit: 'm',
            tvd_offset_hole_start: '2823.999',
            tvd_offset_hole_start_unit: 'm',
            tvd_offset_hole_end: '2862.999',
            tvd_offset_hole_end_unit: 'm',
          },
        }),
      ])
    );
  });
});
