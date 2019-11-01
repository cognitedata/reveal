/*!
 * Copyright 2019 Cognite AS
 */


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
// NOTE workaround for TypeScript
const ctx: Worker = self as any;

const init = () => {
  const workerId = Math.floor(Math.random() * 1_000_000_000);
  let rootSectorHandle: rustTypes.SectorHandle | undefined;

  // Respond to message from parent thread
  ctx.addEventListener('message', async event => {
    const rust = await rustModule;
    if (!event.data) {
      return;
    }
    const { messageId, work } = event.data;

    if (work.parseRootSector) {
      const { buffer } = work.parseRootSector;
      rootSectorHandle = rust.parse_root_sector(buffer);
      const result: ParseRootSectorResult = {
        result: 'OK' // TODO replace with reference or something
      };
      ctx.postMessage({
        messageId,
        result
      });
    }
    if (work.parseSector) {
      const { buffer } = work.parseSector;
      if (!rootSectorHandle) {
        throw new Error(`Worker ${workerId} requested to parse sector before parsing root sector!`);
      }
      const sectorDataHandle = rust.parse_sector(rootSectorHandle!, buffer);
      const sectorData = rust.convert_sector(sectorDataHandle);
      const collection = sectorData.triangle_mesh_collection();
      const result: ParseSectorResult = {
        fileIds: collection.file_id(),
        nodeIds: collection.node_id(),
        treeIndexes: collection.tree_index(),
        colors: collection.color(),
        triangleCounts: collection.triangle_count(),
        sizes: collection.size()
      };
      ctx.postMessage({
        messageId,
        result
      });
    }
    if (work.parseCtm) {
      // TODO handle parsing failure
      // TODO add type for transferred data
      const { buffer } = work.parseCtm;
      const ctm = rust.parse_ctm(buffer);
      const result: ParseCtmResult = {
        indices: ctm.indices(),
        vertices: ctm.vertices(),
        normals: ctm.normals()
      };
      ctx.postMessage({
        messageId,
        result
      });
    }
    if (work.parseQuads) {
      const { buffer } = work.parseQuads;
      const quads = rust.parse_and_convert_f3df(buffer);
      const result: ParseQuadsResult = {
        data: quads
      };
      ctx.postMessage({
        messageId,
        result
      });
    }
  });
};

init();
