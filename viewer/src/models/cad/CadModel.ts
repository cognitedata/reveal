/*!
 * Copyright 2020 Cognite AS
 */

import { FetchSectorDelegate, FetchCtmDelegate, ParseSectorDelegate } from './delegates';
import { Sector, SectorQuads, SectorScene, SectorModelTransformation } from './types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface CadModel {
  fetchSectorDetailed: FetchSectorDelegate;
  fetchSectorSimple: FetchSectorDelegate;
  fetchCtm: FetchCtmDelegate;
  parseDetailed: ParseSectorDelegate<Sector>;
  parseSimple: ParseSectorDelegate<SectorQuads>;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
