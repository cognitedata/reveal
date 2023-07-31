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
      holeTop,
      holeBase,
      holeTopTvd,
      holeBaseTvd,
    } = nds;

    return {
      ...nds,
      source: source.sourceName,
      assetIds: [wellboreAssetExternalId],
      metadata: {
        diameter_hole: String(holeDiameter?.value),
        diameter_hole_unit: holeDiameter?.unit,
        md_hole_start: String(holeTop?.value),
        md_hole_start_unit: holeTop?.unit,
        md_hole_end: String(holeBase?.value),
        md_hole_end_unit: holeBase?.unit,
        tvd_offset_hole_start: String(holeTopTvd?.value),
        tvd_offset_hole_start_unit: holeTopTvd?.unit,
        tvd_offset_hole_end: String(holeBaseTvd?.value),
        tvd_offset_hole_end_unit: holeBaseTvd?.unit,
      },
    };
  });
};
