import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import { convertDistance } from 'utils/units/convertDistance';

import { INds } from '@cognite/node-visualizer';

import { FEET } from 'constants/units';

export const mapNDSTo3D = (
  ndsEvents: NdsInternalWithTvd[]
): Partial<INds>[] => {
  return ndsEvents.map((nds) => {
    const {
      wellboreAssetExternalId,
      source,
      holeDiameter,
      holeStart,
      holeEnd,
      holeStartTvd,
      holeEndTvd,
    } = nds;

    /**
     * N-vid is making a mess with event positioning when provided with units other than ft.
     */
    const diameterHole = holeDiameter && convertDistance(holeDiameter, FEET);

    const mdHoleStart = holeStart && convertDistance(holeStart, FEET);

    const mdHoleEnd = holeEnd && convertDistance(holeEnd, FEET);

    const tvdHoleStart = holeStartTvd && convertDistance(holeStartTvd, FEET);

    const tvdHoleEnd = holeEndTvd && convertDistance(holeEndTvd, FEET);

    return {
      ...nds,
      source: source.sourceName,
      assetIds: [wellboreAssetExternalId],
      metadata: {
        diameter_hole: diameterHole ? String(diameterHole.value) : '',
        diameter_hole_unit: FEET,
        md_hole_start: mdHoleStart ? String(mdHoleStart.value) : '',
        md_hole_start_unit: FEET,
        md_hole_end: mdHoleEnd ? String(mdHoleEnd.value) : '',
        md_hole_end_unit: FEET,
        tvd_offset_hole_start: tvdHoleStart ? String(tvdHoleStart.value) : '',
        tvd_offset_hole_start_unit: FEET,
        tvd_offset_hole_end: tvdHoleEnd ? String(tvdHoleEnd.value) : '',
        tvd_offset_hole_end_unit: FEET,
      },
    };
  });
};
