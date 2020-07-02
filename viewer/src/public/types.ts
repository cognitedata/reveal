/*!
 * Copyright 2020 Cognite AS
 */

import { NodeAppearanceProvider } from '@/datamodels/cad';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { SectorCuller } from '@/internal';

export type RevealOptions = {
  logMetrics?: boolean;
  nodeAppearanceProvider?: NodeAppearanceProvider;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};
