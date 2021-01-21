/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';

import { Observable } from 'rxjs';
import { LoadingState } from '../../utilities';
import { PointCloudNode } from './PointCloudNode';

export class PointCloudManager<TModelIdentifier> {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository<TModelIdentifier>;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _pointCloudGroupWrapper: PotreeGroupWrapper;

  constructor(metadataRepository: PointCloudMetadataRepository<TModelIdentifier>, modelFactory: PointCloudFactory) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._pointCloudGroupWrapper = new PotreeGroupWrapper();
  }

  requestRedraw(): void {
    this._pointCloudGroupWrapper.requestRedraw();
  }

  resetRedraw(): void {
    this._pointCloudGroupWrapper.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._pointCloudGroupWrapper.needsRedraw;
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._pointCloudGroupWrapper.getLoadingStateObserver();
  }

  updateCamera(_camera: THREE.PerspectiveCamera) {}

  async addModel(modelIdentifier: TModelIdentifier): Promise<PointCloudNode> {
    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);
    const nodeWrapper = this._pointCloudFactory.createModel(metadata);
    this._pointCloudGroupWrapper.addPointCloud(nodeWrapper);
    const node = new PointCloudNode(this._pointCloudGroupWrapper, nodeWrapper, metadata.cameraConfiguration);
    node.setModelTransformation(metadata.modelMatrix);
    return node;
  }

  removeModel(node: PointCloudNode): void {
    if (!this._pointCloudGroupWrapper) {
      this._pointCloudGroupWrapper = new PotreeGroupWrapper();
    }
    this._pointCloudGroupWrapper.removePointCloud(node.potreeNode);
  }
}
