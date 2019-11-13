/*!
 * Copyright 2019 Cognite AS
 */

import * as Comlink from 'comlink';
import { CtmWorkerResult, Sector, SectorMetadata, TriangleMesh } from '../src/models/sector/types';
import { FetchSectorDelegate, FetchCtmDelegate } from '../src/models/sector/delegates';
import { createOffsets } from '../src/utils/arrayUtils';
import {
  ParseRootSectorArguments,
  ParseRootSectorResult,
  ParseSectorArguments,
  ParseSectorResult,
  ParseCtmArguments,
  ParseCtmResult,
  ParseQuadsArguments,
  ParseQuadsResult
} from './types/parser.types';
import * as rustTypes from '../pkg';
const rustModule = import('../pkg');

export class ParserWorker {
  private workerId: number;
  private rootSectorHandle: rustTypes.SectorHandle | undefined;
  constructor() {
    this.workerId = Math.floor(Math.random() * 1_000_000_000);
  }
  parseRootSector = async (buffer: Uint8Array): Promise<void> => {
    const rust = await rustModule;
    this.rootSectorHandle = rust.parse_root_sector(buffer);
  };
  parseSector = async (buffer: Uint8Array): Promise<ParseSectorResult> => {
    const rust = await rustModule;
    if (!this.rootSectorHandle) {
      throw new Error(`Worker ${this.workerId} requested to parse sector before parsing root sector!`);
    }
    const sectorDataHandle = rust.parse_sector(this.rootSectorHandle, buffer);
    const sectorData = rust.convert_sector(sectorDataHandle);
    const collection = sectorData.triangle_mesh_collection();
    const result = {
      fileIds: collection.file_id().slice(),
      nodeIds: collection.node_id().slice(),
      treeIndexes: collection.tree_index().slice(),
      colors: collection.color().slice(),
      triangleCounts: collection.triangle_count().slice(),
      sizes: collection.size().slice()
    };
    sectorDataHandle.free();
    collection.free();
    return result;
  };
  parseCtm = async (buffer: Uint8Array): Promise<ParseCtmResult> => {
    const rust = await rustModule;
    // TODO handle parsing failure
    const ctm = rust.parse_ctm(buffer);
    const result = {
      indices: ctm.indices(),
      vertices: ctm.vertices(),
      normals: ctm.normals()
    };
    ctm.free();
    return result;
  };
  parseQuads = async (buffer: Uint8Array): Promise<ParseQuadsResult> => {
    const rust = await rustModule;
    const quads = rust.parse_and_convert_f3df(buffer);
    return {
      data: quads
    };
  };
}

const obj = new ParserWorker();

Comlink.expose(obj);
