/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, IdEither } from '@cognite/sdk';

import { RenderManager } from './RenderManager';
import { ModelNodeAppearance, createPointCloudModel, createLocalPointCloudModel } from '@/experimental';
import { SectorGeometry } from '@/dataModels/cad/sector/types';
import { SectorQuads } from '@/dataModels/cad/rendering/types';
import { SectorCuller, PotreeGroupWrapper, PotreeNodeWrapper } from '@/internal';
import { CadManager } from '@/dataModels/cad/CadManager';
import { MaterialManager } from '@/dataModels/cad/MaterialManager';
import { createThreeJsPointCloudNode } from '@/dataModels/point-cloud/internal/createThreeJsPointCloudNode';

export interface RevealOptions {
  nodeAppearance?: ModelNodeAppearance;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export type OnDataUpdated = () => void;

export class RevealManagerBase<TModelIdentifier> implements RenderManager {
  protected readonly _cadManager: CadManager<TModelIdentifier>;
  protected readonly _materialManager: MaterialManager;

  private _client: CogniteClient;

  constructor(client: CogniteClient, cadManager: CadManager<TModelIdentifier>, materialManager: MaterialManager) {
    // this._budget = (options && options.budget) || createDefaultCadBudget();
    this._client = client;
    this._cadManager = cadManager;
    this._materialManager = materialManager;
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw;
  }

  public async addPointCloudFromCdf(modelRevision: string | number): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
    const modelMetadata = await createPointCloudModel(this._client, this.createModelIdentifier(modelRevision));
    const wrappers = createThreeJsPointCloudNode(modelMetadata);

    return wrappers;
  }

  public async addPointCloudFromUrl(url: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
    const modelMetadata = await createLocalPointCloudModel(url);
    const wrappers = createThreeJsPointCloudNode(modelMetadata);
    return wrappers;
  }

  public update(camera: THREE.PerspectiveCamera) {
    this._cadManager.updateCamera(camera);
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes() {
    return this._materialManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._materialManager.clipIntersection;
  }

  // TODO 22-05-2020 j-bjorne: Remove once PointCloudManager is complete.
  protected createModelIdentifier(id: string | number): IdEither {
    if (typeof id === 'number') {
      return { id };
    }
    return { externalId: id };
  }
}
