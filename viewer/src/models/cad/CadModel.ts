/*!
 * Copyright 2020 Cognite AS
 */

import { FetchSectorDelegate, FetchCtmDelegate, ParseSectorDelegate } from './delegates';
import { Sector, SectorQuads, SectorScene, SectorModelTransformation } from './types';

export interface CadModel {
  fetchSectorDetailed: FetchSectorDelegate;
  fetchSectorSimple: FetchSectorDelegate;
  fetchCtm: FetchCtmDelegate;
  parseDetailed: ParseSectorDelegate<Sector>;
  parseSimple: ParseSectorDelegate<SectorQuads>;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
