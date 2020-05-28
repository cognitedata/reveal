/*!
 * Copyright 2020 Cognite AS
 */

import { createLocalPointCloudModel, createPointCloudModel } from '@/dataModels/pointCloud';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CadBudget } from '@/dataModels/cad/public/CadBudget';
import { ModelNodeAppearance } from '@/dataModels/cad/internal/ModelNodeAppearance';
import { Sector, SectorQuads } from '@/dataModels/cad/internal/sector/types';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { PotreeGroupWrapper } from '@/dataModels/pointCloud/internal/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/dataModels/pointCloud/internal/PotreeNodeWrapper';
import { SectorCuller } from '@/dataModels/cad/internal/sector/culling/SectorCuller';
import { createThreeJsPointCloudNode } from '@/dataModels/pointCloud/internal/createThreeJsPointCloudNode';
import { CadManager } from '@/dataModels/cad/internal/CadManager';
import { RenderManager } from './RenderManager';

export interface RevealOptions {
  nodeAppearance?: ModelNodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: Sector | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export type OnDataUpdated = () => void;

export class RevealManagerBase<TModelIdentifier> implements RenderManager {
  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
    this._cadManager.updateClippingPlanes(clippingPlanes);
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

  // TODO 22-05-2020 j-bjorne: Remove once PointCloudManager is complete.
  protected createModelIdentifier(id: string | number): IdEither {
    if (typeof id === 'number') {
      return { id };
    }
    return { externalId: id };
  }
}
