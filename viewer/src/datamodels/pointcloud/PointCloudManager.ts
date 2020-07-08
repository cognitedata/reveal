/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PotreeLoadHandler } from './PotreeLoadHandler';
import { Observable } from 'rxjs';

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

  getLoadingStateObserver(): Observable<boolean> {
    return this._potreeLoadHandler.observer();
  }

  updateCamera(_camera: THREE.PerspectiveCamera) {}

  async addModel(modelIdentifier: TModelIdentifier): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);
    const model = this._pointCloudFactory.createModel(metadata);
    if (!this._pointCloudGroupWrapper) {
      this._pointCloudGroupWrapper = new PotreeGroupWrapper();
    }
    this._pointCloudGroupWrapper.addPointCloud(model);
    return [this._pointCloudGroupWrapper, model];
  }
}
