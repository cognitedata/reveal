/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { IdEither } from '@cognite/sdk';
import { CadNode } from './CadNode';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { discardSector } from './sector/discardSector';
import { ModelNodeAppearance } from '../../../utilities';

export class CadManager {
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();

  private _needsRedraw: boolean = false;

  constructor(
    cadModelMetadataRepository: CadModelMetadataRepository,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._cadModelUpdateHandler = cadModelUpdateHandler;
    this._cadModelUpdateHandler.observable().subscribe(sector => {
      const cadModel = this._cadModelMap.get(sector.blobUrl);
      const sectorNodeParent = cadModel!.rootSector;
      const sectorNode = sectorNodeParent!.sectorNodeMap.get(sector.metadata.id);
      if (!sectorNode) {
        throw new Error(`Could not find 3D node for sector ${sector.metadata.id} - invalid id?`);
      }
      if (sectorNode.group) {
        sectorNode.group.userData.refCount -= 1;
        if (sectorNode.group.userData.refCount === 0) {
          discardSector(sectorNode.group);
        }
        sectorNode.remove(sectorNode.group);
      }
      if (sector.group) {
        // Is this correct now?
        sectorNode.add(sector.group);
      }
      sectorNode.group = sector.group;
      this._needsRedraw = true;
    });
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._cadModelUpdateHandler.updateCamera(camera);
  }

  async addModel(modelRevisionId: IdEither, modelAppearance?: ModelNodeAppearance): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadMetadata(modelRevisionId);
    const model = this._cadModelFactory.createModel(metadata, modelAppearance);
    this._cadModelMap.set(metadata.blobUrl, model);
    this._cadModelUpdateHandler.updateModels(model);
    return model;
  }
}
