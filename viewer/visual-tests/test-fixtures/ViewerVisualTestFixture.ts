/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer, CogniteModel } from '../../packages/api';
import { VisualTestFixture } from './VisualTestFixture';
import { addModels, createCognite3DViewer } from './utilities/cognite3DViewerHelpers';
import { CognitePointCloudModel } from '../../packages/pointclouds';
import { AxisViewTool } from '../../packages/tools';
import * as THREE from 'three';

export type ViewerTestFixtureComponents = {
  viewer: Cognite3DViewer;
  models: CogniteModel[];
};

export abstract class ViewerVisualTestFixture implements VisualTestFixture {
  private readonly _localModelUrls: string[];
  private _viewer!: Cognite3DViewer;
  private readonly _renderer: THREE.WebGLRenderer;

  constructor(...localModelUrls: string[]) {
    this._localModelUrls = localModelUrls.length > 0 ? localModelUrls : ['primitives'];
    this._renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance' });
    this._renderer.setPixelRatio(window.devicePixelRatio);
  }

  public async run(): Promise<void> {
    let totalItemsRequested = 0;
    let totalItemsLoaded = 0;
    const loadingCompleteResolve: ((value: void | PromiseLike<void>) => void) | null = null;

    this._viewer = await createCognite3DViewer(modelLoadingCallback, this._renderer);

    this.setupDom(this._viewer);

    const models = await addModels(this._viewer, this._localModelUrls);
    new AxisViewTool(this._viewer);

    this._viewer.fitCameraToModel(models[0]);

    // Wait for all models to complete loading
    await this.waitForAllModelsToLoad(models);

    await this.setup({ viewer: this._viewer, models });

    function modelLoadingCallback(itemsLoaded: number, itemsRequested: number, _: number) {
      totalItemsLoaded = itemsLoaded;
      totalItemsRequested = itemsRequested;

      if (itemsRequested > 0 && itemsLoaded === itemsRequested && loadingCompleteResolve) {
        loadingCompleteResolve();
      }
    }
  }
  private async waitForAllModelsToLoad(models: CogniteModel[]): Promise<void> {
    // For point cloud models, the loading callback doesn't work correctly, so use timeout
    const hasPointCloudModel = models.some(model => model instanceof CognitePointCloudModel);
    if (hasPointCloudModel) {
      return new Promise<void>(resolve => setTimeout(resolve, 5000));
    }

    // For multiple CAD models, we need to wait longer to ensure both models fully load
    // The global loading callback resolves too early when the first model finishes
    if (models.length > 1) {
      // Wait longer for multiple models to allow both to finish loading
      return new Promise<void>(resolve => setTimeout(resolve, 3000));
    }

    // For single CAD model, use the original approach
    return new Promise<void>(resolve => setTimeout(resolve, 1000));
  }

  private setupDom(viewer: Cognite3DViewer) {
    document.body.append(viewer.domElement);
    viewer.domElement.style.height = '100vh';
    document.body.style.margin = '0px 0px 0px 0px';
  }

  public abstract setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void>;

  public dispose(): void {
    this._renderer.forceContextLoss();
    this._viewer.dispose();
  }
}
