/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from './CadNode';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { ModelNodeAppearance } from './ModelNodeAppearance';
import { discardSector } from './sector/sectorUtilities';
import { Subscription } from 'rxjs';

export class CadManager<TModelIdentifier> {
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();

  private _needsRedraw: boolean = false;

  constructor(
    cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._cadModelUpdateHandler = cadModelUpdateHandler;
    this._subscription.add(
      this._cadModelUpdateHandler.observable().subscribe(
        sector => {
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
        },
        error => {
          // tslint:disable-next-line: no-console
          console.error(error);
        }
      )
    );
  }

  dispose() {
    this._subscription.unsubscribe();
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

  set clippingPlanes(value: THREE.Plane[]) {
    this._cadModelUpdateHandler.clippingPlanes = value;
    this._needsRedraw = true;
  }

  set clipIntersection(value: boolean) {
    this._cadModelUpdateHandler.clipIntersection = value;
    this._needsRedraw = true;
  }

  async addModel(modelIdentifier: TModelIdentifier, modelAppearance?: ModelNodeAppearance): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(modelIdentifier);
    const model = this._cadModelFactory.createModel(metadata, modelAppearance);
    this._cadModelMap.set(metadata.blobUrl, model);
    this._cadModelUpdateHandler.updateModels(model);
    return model;
  }
}
