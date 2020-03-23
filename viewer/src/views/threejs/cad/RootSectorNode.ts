/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';
import { toThreeMatrix4 } from '../utilities';
import { CadModel } from '../../../models/cad/CadModel';
import { Materials } from './materials';
import { MemoryRequestCache } from '../../../cache/MemoryRequestCache';
import { ParsedSector } from '../../../data/model/ParsedSector';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';
import { consumeSectorSimple } from './consumeSectorSimple';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { SectorQuads, Sector } from '../../../models/cad/types';
import { ConsumedSector } from '../../../data/model/ConsumedSector';

function hashIdAndLevelOfDetail(id: number, levelOfDetail: LevelOfDetail) {
  return `${id},${levelOfDetail}`;
}

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;
  private readonly materials: Materials;

  private readonly consumeSectorCache: MemoryRequestCache<string, ParsedSector, THREE.Group>;
  private _nodeIdToTreeIndexMap: Map<number, number>;
  private _treeIndexToNodeIdMap: Map<number, number>;

  constructor(model: CadModel, materials: Materials) {
    super(0, '/');
    const { scene, modelTransformation } = model;
    this.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));
    this.sectorNodeMap = new Map();
    this.materials = materials;
    this._nodeIdToTreeIndexMap = new Map();
    this._treeIndexToNodeIdMap = new Map();

    this.consumeSectorCache = new MemoryRequestCache<string, ParsedSector, THREE.Group>(
      (_hash: string, sector: ParsedSector) => this.consumeImpl(sector.id, sector)
    );

    buildScene(scene.root, this, this.sectorNodeMap);
  }

  get nodeIdToTreeIndexMap() {
    return this._nodeIdToTreeIndexMap;
  }
  get treeIndexToNodeIdMap() {
    return this._treeIndexToNodeIdMap;
  }

  public async consumeSector(id: number, sector: ParsedSector): Promise<ConsumedSector> {
    const { levelOfDetail, metadata } = sector;
    const group = this.consumeSectorCache.request(hashIdAndLevelOfDetail(id, levelOfDetail), sector);

    return {
      id,
      levelOfDetail,
      metadata,
      group
    };
  }

  private consumeImpl(id: number, sector: ParsedSector) {
    const { levelOfDetail, metadata, data } = sector;
    const group = ((): THREE.Group => {
      switch (levelOfDetail) {
        case LevelOfDetail.Discarded: {
          return new THREE.Group();
        }
        case LevelOfDetail.Simple: {
          const simpleData = data as SectorQuads;
          this._nodeIdToTreeIndexMap = new Map([...this._nodeIdToTreeIndexMap, ...simpleData.nodeIdToTreeIndexMap]);
          this._treeIndexToNodeIdMap = new Map([...this._treeIndexToNodeIdMap, ...simpleData.treeIndexToNodeIdMap]);
          this.dispatchEvent({ type: 'nodeIdToTreeIndexMapUpdated', sector });
          return consumeSectorSimple(id, simpleData, metadata, this.materials);
        }
        case LevelOfDetail.Detailed: {
          const detailedData = data as Sector;
          this._nodeIdToTreeIndexMap = new Map([...this._nodeIdToTreeIndexMap, ...detailedData.nodeIdToTreeIndexMap]);
          this._treeIndexToNodeIdMap = new Map([...this._treeIndexToNodeIdMap, ...detailedData.treeIndexToNodeIdMap]);
          this.dispatchEvent({ type: 'nodeIdToTreeIndexMapUpdated', sector });
          return consumeSectorDetailed(id, detailedData, metadata, this.materials);
        }
        default:
          throw new Error(`Unsupported level of detail ${sector.levelOfDetail}`);
      }
    })();
    return group;
  }
}
