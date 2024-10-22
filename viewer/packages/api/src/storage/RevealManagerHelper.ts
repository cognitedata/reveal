/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { AddModelOptions } from '../public/migration/types';
import { createCdfRevealManager, createLocalRevealManager, createRevealManager } from '../public/createRevealManager';
import { RevealManager } from '../public/RevealManager';
import { RevealOptions } from '../public/RevealOptions';

import {
  CdfModelIdentifier,
  LocalModelIdentifier,
  DummyPointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { DataSource } from '@reveal/data-source';
import { assertNever, SceneHandler } from '@reveal/utilities';

import { CadNode } from '@reveal/cad-model';
import { CogniteClient } from '@cognite/sdk';
import { PointCloudNode, LocalPointClassificationsProvider } from '@reveal/pointclouds';
import { CameraManager } from '@reveal/camera-manager';

/**
 * Helper for {@link RevealManager} for creating a uniform interface for
 * working with instances that fetch models from CDF or instances that fetch
 * models from local storage (i.e. in development/debugging).
 */
export class RevealManagerHelper {
  private readonly _revealManager: RevealManager;

  addCadModel: (model: AddModelOptions) => Promise<CadNode>;
  addPointCloudModel: (model: AddModelOptions, revisionSpace?: string) => Promise<PointCloudNode>;

  private constructor(type: 'local', manager: RevealManager);
  private constructor(type: 'cdf', manager: RevealManager);
  private constructor(type: 'local' | 'cdf', manager: RevealManager) {
    this._revealManager = manager;

    switch (type) {
      case 'cdf':
        {
          this.addCadModel = model => RevealManagerHelper.addCdfCadModel(model, manager);
          this.addPointCloudModel = (model, revisionSpace) => {
            return RevealManagerHelper.addCdfPointCloudModel(model, manager, revisionSpace ?? '');
          };
        }
        break;
      case 'local':
        {
          this.addCadModel = model => RevealManagerHelper.addLocalCadModel(model as AddModelOptions, manager);
          this.addPointCloudModel = model =>
            RevealManagerHelper.addLocalPointCloudModel(model as AddModelOptions, manager);
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
   * @param sceneHandler
   * @param cameraManager
   * @param revealOptions
   */
  static createLocalHelper(
    renderer: THREE.WebGLRenderer,
    sceneHandler: SceneHandler,
    cameraManager: CameraManager,
    revealOptions: RevealOptions
  ): RevealManagerHelper {
    const revealManager = createLocalRevealManager(renderer, sceneHandler, cameraManager, revealOptions);
    return new RevealManagerHelper('local', revealManager);
  }

  /**
   * Creates a helper for RevealManager that loads models from CDF.
   * @param renderer
   * @param sceneHandler
   * @param cameraManager
   * @param revealOptions
   * @param sdkClient
   */
  static createCdfHelper(
    renderer: THREE.WebGLRenderer,
    sceneHandler: SceneHandler,
    cameraManager: CameraManager,
    revealOptions: RevealOptions,
    sdkClient: CogniteClient
  ): RevealManagerHelper {
    const revealManager = createCdfRevealManager(sdkClient, renderer, sceneHandler, cameraManager, revealOptions);
    return new RevealManagerHelper('cdf', revealManager);
  }

  static createCustomDataSourceHelper(
    renderer: THREE.WebGLRenderer,
    sceneHandler: SceneHandler,
    cameraManager: CameraManager,
    revealOptions: RevealOptions,
    dataSource: DataSource,
    client: CogniteClient | undefined
  ): RevealManagerHelper {
    const revealManager = createRevealManager(
      'custom-datasource',
      'custom-datasource-app',
      dataSource.getModelMetadataProvider(),
      dataSource.getModelDataProvider(),
      new DummyPointCloudStylableObjectProvider(),
      new LocalPointClassificationsProvider(),
      renderer,
      sceneHandler,
      cameraManager,
      revealOptions,
      client
    );
    // Note! We consider custom data sources 'CDF-type' as we use CDF model identifiers
    // for custom data sources too.
    return new RevealManagerHelper('cdf', revealManager);
  }

  get revealManager(): RevealManager {
    return this._revealManager;
  }

  /**
   * Adds a local CAD model.
   * @param model
   * @param revealManager
   */
  private static addLocalCadModel(model: AddModelOptions, revealManager: RevealManager): Promise<CadNode> {
    if (model.localPath === undefined) {
      throw new Error('addLocalCadModel only works with local models');
    }
    const modelIdentifier = new LocalModelIdentifier(model.localPath);
    return revealManager.addModel('cad', modelIdentifier, { geometryFilter: model.geometryFilter });
  }

  /**
   * Adds a CDF hosted CAD model.
   * @param model
   * @param revealManager
   */
  private static addCdfCadModel(model: AddModelOptions, revealManager: RevealManager): Promise<CadNode> {
    if (model.modelId === -1 || model.revisionId === -1) {
      throw new Error('addCdfCadModel only works with CDF hosted models');
    }
    const modelIdentifier = new CdfModelIdentifier(model.modelId, model.revisionId);
    return revealManager.addModel('cad', modelIdentifier, { geometryFilter: model.geometryFilter });
  }

  private static addLocalPointCloudModel(
    model: AddModelOptions,
    revealManager: RevealManager
  ): Promise<PointCloudNode> {
    if (model.localPath === undefined) {
      throw new Error('addLocalPointCloudModel only works with local models');
    }
    const modelIdentifier = new LocalModelIdentifier(model.localPath);
    return revealManager.addModel('pointcloud', modelIdentifier);
  }

  /**
   * Add a CDF hosted point cloud model.
   * @param model
   * @param revealManager
   */
  private static addCdfPointCloudModel(
    model: AddModelOptions,
    revealManager: RevealManager,
    dmSpace: string
  ): Promise<PointCloudNode> {
    if (model.modelId === -1 || model.revisionId === -1) {
      throw new Error('addCdfPointCloudModel only works with CDF hosted models');
    }
    const modelIdentifier = new CdfModelIdentifier(model.modelId, model.revisionId);
    return revealManager.addModel('pointcloud', modelIdentifier, dmSpace);
  }
}
