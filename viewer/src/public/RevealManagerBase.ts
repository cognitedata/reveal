/*!
 * Copyright 2020 Cognite AS
 */

import { createLocalPointCloudModel, createPointCloudModel } from '@/dataModels/pointCloud';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CadNode } from '@/dataModels/cad/internal/CadNode';
import { CadBudget } from '@/dataModels/cad/public/CadBudget';
import { ModelNodeAppearance } from '@/dataModels/cad/internal/ModelNodeAppearance';
import { Sector, SectorQuads } from '@/dataModels/cad/internal/sector/types';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { PotreeGroupWrapper } from '@/dataModels/pointCloud/internal/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/dataModels/pointCloud/internal/PotreeNodeWrapper';
import { SectorCuller } from '@/dataModels/cad/internal/sector/culling/SectorCuller';
import { createThreeJsPointCloudNode } from '@/dataModels/pointCloud/internal/createThreeJsPointCloudNode';
import { CadManager } from '@/dataModels/cad/internal/CadManager';

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

export class RevealManagerBase<Params> {
  protected readonly _cadManager: CadManager<Params>;
  protected readonly _materialManager: MaterialManager;

  private _client: CogniteClient;

  constructor(client: CogniteClient, cadManager: CadManager<Params>, materialManager: MaterialManager) {
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

  public addModelFromUrl(_modelUrl: string, _modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode> {
    throw new Error('Deprecated');
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

  public addModel(type: 'cad', params: Params, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode>;
  public addModel(type: 'pointcloud', params: Params): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    params: Params,
    modelNodeAppearance?: ModelNodeAppearance
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel(params, modelNodeAppearance);
      case 'pointcloud':
        throw new Error('Not yet implemented');
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }

  protected addCadModel(params: Params, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode> {
    const promise = this._cadManager.addModel(params, modelNodeAppearance);
    return promise;
  }

  protected createModelIdentifier(id: string | number): IdEither {
    if (typeof id === 'number') {
      return { id };
    }
    return { externalId: id };
  }
}
