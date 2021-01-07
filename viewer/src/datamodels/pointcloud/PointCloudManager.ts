/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeLoadHandler } from './PotreeLoadHandler';
import { Observable } from 'rxjs';
import { LoadingState } from '../../utilities';
import { PointCloudNode } from './PointCloudNode';

export class PointCloudManager<TModelIdentifier> {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository<TModelIdentifier>;
  private readonly _pointCloudFactory: PointCloudFactory;

  private _pointCloudGroupWrapper?: PotreeGroupWrapper;
  private _potreeLoadHandler: PotreeLoadHandler;

  constructor(metadataRepository: PointCloudMetadataRepository<TModelIdentifier>, modelFactory: PointCloudFactory) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._potreeLoadHandler = new PotreeLoadHandler();
  }

  requestRedraw(): void {
    if (this._pointCloudGroupWrapper) {
      this._pointCloudGroupWrapper.requestRedraw();
    }
  }

  get needsRedraw(): boolean {
    return this._pointCloudGroupWrapper ? this._pointCloudGroupWrapper.needsRedraw : false;
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._potreeLoadHandler.observer();
  }

  updateCamera(_camera: THREE.PerspectiveCamera) {}

  async addModel(modelIdentifier: TModelIdentifier): Promise<PointCloudNode> {
    if (!this._pointCloudGroupWrapper) {
      this._pointCloudGroupWrapper = new PotreeGroupWrapper();
    }

    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);
    const nodeWrapper = this._pointCloudFactory.createModel(metadata);
    this._pointCloudGroupWrapper.addPointCloud(nodeWrapper);
    const node = new PointCloudNode(this._pointCloudGroupWrapper, nodeWrapper, metadata.cameraConfiguration);
    node.setModelTransformation(metadata.modelMatrix);
    return node;
  }
}
