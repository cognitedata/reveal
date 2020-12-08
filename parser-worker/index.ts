/*!
 * Copyright 2020 Cognite AS
 */

import { RevealParserWorker } from './RevealParserWorker';
import * as Comlink from "comlink";

export {
  SectorQuads,
  SectorGeometry,
  TriangleMesh,
  InstancedMesh,
  InstancedMeshFile,
  ParsedPrimitives,
  ParsePrimitiveAttribute,
  ParseCtmResult,
  ParseSectorResult
} from './types';
export { RevealParserWorker };

// Bootstrap
const obj = new RevealParserWorker();
Comlink.expose(obj);
