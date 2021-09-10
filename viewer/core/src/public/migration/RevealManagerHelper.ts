/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';
import { AddModelOptions } from './types';
import { RevealManager } from '../RevealManager';
import { createCdfRevealManager, createLocalRevealManager } from '../createRevealManager';
import { assertNever } from '../../utilities';
import { CdfModelIdentifier, LocalModelIdentifier } from '../../utilities/networking/types';
import { RevealOptions } from '../..';
import { CadNode } from '../../datamodels/cad';
import { PointCloudNode } from '../../datamodels/pointcloud/PointCloudNode';

/**
 * Helper for {@link RevealManager} for creating a uniform interface for
 * working with instances that fetch models from CDF or instances that fetch
 * models from local storage (i.e. in development/debugging).
 */
export class RevealManagerHelper {
  private readonly _revealManager: RevealManager<LocalModelIdentifier> | RevealManager<CdfModelIdentifier>;

  addCadModel: (model: AddModelOptions) => Promise<CadNode>;
  addPointCloudModel: (model: AddModelOptions) => Promise<PointCloudNode>;

  private constructor(type: 'local', manager: RevealManager<LocalModelIdentifier>);
  private constructor(type: 'cdf', manager: RevealManager<CdfModelIdentifier>);
  private constructor(
    type: 'local' | 'cdf',
    manager: RevealManager<LocalModelIdentifier> | RevealManager<CdfModelIdentifier>
  ) {
    switch (type) {
      case 'cdf':
        {
          const revealManager = manager as RevealManager<CdfModelIdentifier>;
          this.addCadModel = model => RevealManagerHelper.addCdfCadModel(model, revealManager);
          this.addPointCloudModel = model => RevealManagerHelper.addCdfPointCloudModel(model, revealManager);
          this._revealManager = revealManager;
        }
        break;
      case 'local':
        {
          const revealManager = manager as RevealManager<LocalModelIdentifier>;
          this.addCadModel = model => RevealManagerHelper.addLocalCadModel(model, revealManager);
          this.addPointCloudModel = () => {
            throw new Error('Local point cloud models are not supported');
          };
          this._revealManager = revealManager;
        }
        break;
      default:
        assertNever(type);
    }
  }

  /**
   * Create helper for RevealManager that loads models from local storage. This is only
   * meant for use in debugging and development.
   * @param renderer
   * @param scene
   * @param revealOptions
   */
  static createLocalHelper(renderer: THREE.WebGLRenderer, scene: THREE.Scene, revealOptions: RevealOptions) {
    const revealManager = createLocalRevealManager(renderer, scene, revealOptions);
    return new RevealManagerHelper('local', revealManager);
  }

  /**
   * Creates a helper for RevealManager that loads models from CDF.
   * @param renderer
   * @param scene
   * @param revealOptions
   * @param sdkClient
   */
  static createCdfHelper(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    revealOptions: RevealOptions,
    sdkClient: CogniteClient
  ) {
    const revealManager = createCdfRevealManager(sdkClient, renderer, scene, revealOptions);
    return new RevealManagerHelper('cdf', revealManager);
  }

  get revealManager(): RevealManager<LocalModelIdentifier> | RevealManager<CdfModelIdentifier> {
    return this._revealManager;
  }

  /**
   * Adds a local CAD model.
   * @param model
   * @param revealManager
   */
  private static addLocalCadModel(
    model: AddModelOptions,
    revealManager: RevealManager<LocalModelIdentifier>
  ): Promise<CadNode> {
    if (model.localPath === undefined) {
      throw new Error('addLocalCadModel only works with local models');
    }
    return revealManager.addModel('cad', { fileName: model.localPath }, { geometryFilter: model.geometryFilter });
  }

  /**
   * Adds a CDF hosted CAD model.
   * @param model
   * @param revealManager
   */
  private static addCdfCadModel(
    model: AddModelOptions,
    revealManager: RevealManager<CdfModelIdentifier>
  ): Promise<CadNode> {
    if (model.modelId === -1 || model.revisionId === -1) {
      throw new Error('addCdfCadModel only works with local models');
    }
    return revealManager.addModel(
      'cad',
      { modelId: model.modelId, revisionId: model.revisionId },
      { geometryFilter: model.geometryFilter }
    );
  }

  /**
   * Add a CDF hosted point cloud model.
   * @param model
   * @param revealManager
   */
  private static addCdfPointCloudModel(
    model: AddModelOptions,
    revealManager: RevealManager<CdfModelIdentifier>
  ): Promise<PointCloudNode> {
    if (model.modelId === -1 || model.revisionId === -1) {
      throw new Error('addCdfPointCloudModel only works with local models');
    }
    return revealManager.addModel('pointcloud', { modelId: model.modelId, revisionId: model.revisionId });
  }
}
