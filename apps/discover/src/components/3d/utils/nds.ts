import { unsafeChangeUnitTo } from 'utils/units';

import { INds } from '@cognite/node-visualizer';
import { CogniteEvent } from '@cognite/sdk';

export const mapNDSTo3D = (eventsMap: CogniteEvent[]): Partial<INds>[] => {
  return eventsMap.map((event) => {
    const metaData = event.metadata;
    if (!metaData) {
      return {
        ...event,
        assetIds: (event.assetIds || []).map(String),
      };
    }
    /**
     * N-vid is making a mess with event positioning when provided with units other than ft.
     */
    const diameterHole = unsafeChangeUnitTo(
      Number(metaData.diameter_hole),
      metaData.diameter_hole_unit,
      'ft'
    );
    const mdHoleStart = unsafeChangeUnitTo(
      Number(metaData.md_hole_start),
      metaData.md_hole_start_unit,
      'ft'
    );
    const mdHoleEnd = unsafeChangeUnitTo(
      Number(metaData.md_hole_end),
      metaData.md_hole_end_unit,
      'ft'
    );
    const tvdOffsetHoleStart = unsafeChangeUnitTo(
      Number(metaData.md_hole_start),
      metaData.md_hole_start_unit,
      'ft'
    );
    const tvdOffsetHoleEnd = unsafeChangeUnitTo(
      Number(metaData.tvd_offset_hole_end),
      metaData.tvd_offset_hole_end_unit,
      'ft'
    );
    return {
      ...event,
      assetIds: (event.assetIds || []).map(String),
      metadata: {
        ...event.metadata,
        diameter_hole: diameterHole ? String(diameterHole) : '',
        diameter_hole_unit: 'ft',
        md_hole_start: mdHoleStart ? String(mdHoleStart) : '',
        md_hole_start_unit: 'ft',
        md_hole_end: mdHoleEnd ? String(mdHoleEnd) : '',
        md_hole_end_unit: 'ft',
        tvd_offset_hole_start: tvdOffsetHoleStart
          ? String(tvdOffsetHoleStart)
          : '',
        tvd_offset_hole_start_unit: 'ft',
        tvd_offset_hole_end: tvdOffsetHoleEnd ? String(tvdOffsetHoleEnd) : '',
        tvd_offset_hole_end_unit: 'ft',
      },
    };
  });
};
