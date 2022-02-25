/*!
 * Copyright 2022 Cognite AS
 */

import { SectorCuller } from '@reveal/cad-geometry-loaders';
import { SectorGeometry } from '@reveal/cad-parsers';
import { SectorQuads } from '@reveal/rendering';

/*
 * Part of the `internal` field of `RevealOptions`
 */
export type InternalRevealCadOptions = {
  parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
  sectorCuller?: SectorCuller;
};
