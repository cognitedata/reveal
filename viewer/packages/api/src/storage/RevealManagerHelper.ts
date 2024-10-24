/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { createCdfRevealManager, createLocalRevealManager, createRevealManager } from '../public/createRevealManager';
import { RevealManager } from '../public/RevealManager';
import { RevealOptions } from '../public/RevealOptions';

import {
  DummyPointCloudStylableObjectProvider,
  DummyPointCloudDMStylableObjectProvider,
  InternalDataSourceType,
  LocalDataSourceType,
  DataSourceType
} from '@reveal/data-providers';
import { DataSource } from '@reveal/data-source';
import { SceneHandler } from '@reveal/utilities';

import { CadNode } from '@reveal/cad-model';
import { CogniteClient } from '@cognite/sdk';
import { PointCloudNode, LocalPointClassificationsProvider } from '@reveal/pointclouds';
import { CameraManager } from '@reveal/camera-manager';
import {
  AddModelOptionsWithModelRevisionId,
  LocalAddModelOptions
} from '../../../data-providers/src/utilities/internalAddModelOptions';

/**
 * Helper for {@link RevealManager} for creating a uniform interface for
 * working with instances that fetch models from CDF or instances that fetch
 * models from local storage (i.e. in development/debugging).
 */
export class RevealManagerHelper {
  private readonly _revealManager: RevealManager;

  addPointCloudModel<T extends DataSourceType>(
    model: AddModelOptionsWithModelRevisionId<T>
  ): Promise<PointCloudNode<T>> {
    if (this._type === 'cdf') {
      return RevealManagerHelper.addCdfPointCloudModel<T>(model, this._revealManager);
    } else {
      return RevealManagerHelper.addLocalPointCloudModel<T>(
        model as LocalAddModelOptions & AddModelOptionsWithModelRevisionId<T>,
        this._revealManager
      );
    }
  }

  addCadModel<T extends InternalDataSourceType>(model: AddModelOptionsWithModelRevisionId<T>): Promise<CadNode> {
    if (this._type === 'cdf') {
      return RevealManagerHelper.addCdfCadModel(model, this._revealManager);
    } else {
      return RevealManagerHelper.addLocalCadModel(
        model as AddModelOptionsWithModelRevisionId<LocalDataSourceType>,
        this._revealManager
      );
    }
  }

  private readonly _type: 'local' | 'cdf';

  private constructor(type: 'local', manager: RevealManager);
  private constructor(type: 'cdf', manager: RevealManager);
  private constructor(type: 'local' | 'cdf', manager: RevealManager) {
    this._revealManager = manager;
    this._type = type;
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
    dataSource: DataSource
  ): RevealManagerHelper {
    const revealManager = createRevealManager(
      'custom-datasource',
      'custom-datasource-app',
      dataSource.getModelMetadataProvider(),
      dataSource.getModelDataProvider(),
      new DummyPointCloudStylableObjectProvider(),
      new DummyPointCloudDMStylableObjectProvider(),
      new LocalPointClassificationsProvider(),
      renderer,
      sceneHandler,
      cameraManager,
      revealOptions
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
  private static addLocalCadModel(
    model: AddModelOptionsWithModelRevisionId<LocalDataSourceType>,
    revealManager: RevealManager
  ): Promise<CadNode> {
    return revealManager.addModel('cad', model, { geometryFilter: model.geometryFilter });
  }

  /**
   * Adds a CDF hosted CAD model.
   * @param model
   * @param revealManager
   */
  private static addCdfCadModel<T extends InternalDataSourceType>(
    model: AddModelOptionsWithModelRevisionId<T>,
    revealManager: RevealManager
  ): Promise<CadNode> {
    return revealManager.addModel('cad', model, { geometryFilter: model.geometryFilter });
  }

  private static addLocalPointCloudModel<T extends DataSourceType>(
    model: LocalAddModelOptions & AddModelOptionsWithModelRevisionId<T>,
    revealManager: RevealManager
  ): Promise<PointCloudNode<T>> {
    if (model.localPath === undefined) {
      throw new Error('addLocalPointCloudModel only works with local models');
    }
    return revealManager.addModel<T>('pointcloud', model);
  }

  /**
   * Add a CDF hosted point cloud model.
   * @param identifier
   * @param revealManager
   */
  private static addCdfPointCloudModel<T extends DataSourceType>(
    identifier: AddModelOptionsWithModelRevisionId<T>,
    revealManager: RevealManager
  ): Promise<PointCloudNode<T>> {
    return revealManager.addModel<T>('pointcloud', identifier);
  }
}
