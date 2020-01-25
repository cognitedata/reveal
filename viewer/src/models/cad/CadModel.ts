/*!
 * Copyright 2020 Cognite AS
 */

import { FetchSectorMetadataDelegate, FetchSectorDelegate, FetchCtmDelegate, ParseSectorDelegate } from './delegates';
import { Sector, SectorQuads, SectorScene, SectorModelTransformation } from './types';

export interface CadModel {
  fetchSectorMetadata: FetchSectorMetadataDelegate;
  fetchSectorDetailed: FetchSectorDelegate;
  fetchSectorSimple: FetchSectorDelegate;
  fetchCtm: FetchCtmDelegate;
  parseDetailed: ParseSectorDelegate<Sector>;
  parseSimple: ParseSectorDelegate<SectorQuads>;
  scene: SectorScene;
  modelTransformation: SectorModelTransformation;
}
