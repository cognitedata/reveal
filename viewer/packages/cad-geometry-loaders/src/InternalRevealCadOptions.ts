/*!
 * Copyright 2022 Cognite AS
 */

import { SectorCuller } from './sector/culling/SectorCuller';

/*
 * Part of the `internal` field of `RevealOptions`
 */
export type InternalRevealCadOptions = {
  sectorCuller?: SectorCuller;
};
