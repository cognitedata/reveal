import { IWell } from '@cognite/node-visualizer';

import { Well } from 'modules/wellSearch/types';

export const mapWellsTo3D = (wells: Well[]): Partial<IWell>[] => {
  return wells.map((well) => ({
    ...well,
    id: String(well.id),
    metadata: {
      x_coordinate: well.geometry?.coordinates[0],
      y_coordinate: well.geometry?.coordinates[1],
      water_depth: well.waterDepth?.value,
      water_depth_unit: well.waterDepth?.unit,
    },
  }));
};
