/*!
 * Copyright 2022 Cognite AS
 */

import { SectorCuller } from '@reveal/cad-geometry-loaders';

/*
 * Part of the `internal` field of `RevealOptions`
 */
export type InternalRevealCadOptions = {
  sectorCuller?: SectorCuller;
};
