import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import { INds } from '@cognite/node-visualizer';

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

    return {
      ...nds,
      source: source.sourceName,
      assetIds: [wellboreAssetExternalId],
      metadata: {
        diameter_hole: String(holeDiameter?.value),
        diameter_hole_unit: holeDiameter?.unit,
        md_hole_start: String(holeStart?.value),
        md_hole_start_unit: holeStart?.unit,
        md_hole_end: String(holeEnd?.value),
        md_hole_end_unit: holeEnd?.unit,
        tvd_offset_hole_start: String(holeStartTvd?.value),
        tvd_offset_hole_start_unit: holeStartTvd?.unit,
        tvd_offset_hole_end: String(holeEndTvd?.value),
        tvd_offset_hole_end_unit: holeEndTvd?.unit,
      },
    };
  });
};
