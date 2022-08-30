/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer, Cognite3DModel } from '../../packages/api';
import { VisualTestFixture } from './VisualTestFixture';
import { addModels, createCognite3DViewer } from './utilities/cognite3DViewerHelpers';
import { DeferredPromise } from '../../packages/utilities';
import { CognitePointCloudModel } from '../../packages/pointclouds';
import { AxisViewTool } from '../../packages/tools';

export type ViewerTestFixtureComponents = {
  viewer: Cognite3DViewer;
  models: (Cognite3DModel | CognitePointCloudModel)[];
};

export abstract class ViewerVisualTestFixture implements VisualTestFixture {
  private readonly _localModelUrls: string[];
  private _viewer!: Cognite3DViewer;

  constructor(...localModelUrls: string[]) {
    this._localModelUrls = localModelUrls.length > 0 ? localModelUrls : ['primitives'];
  }

  public async run(): Promise<void> {
    const modelLoadedPromise = new DeferredPromise<void>();
    this._viewer = await createCognite3DViewer(modelLoadingCallback);

    this.setupDom(this._viewer);

    const models = await addModels(this._viewer, this._localModelUrls);
    new AxisViewTool(this._viewer);

    this._viewer.fitCameraToModel(models[0]);

    await this.modelLoaded(models[0], modelLoadedPromise);

    await this.setup({ viewer: this._viewer, models });

    function modelLoadingCallback(itemsLoaded: number, itemsRequested: number, _: number) {
      if (itemsRequested > 0 && itemsLoaded === itemsRequested) {
        modelLoadedPromise.resolve();
      }
    }
  }
  private modelLoaded(
    model: Cognite3DModel | CognitePointCloudModel,
    modelLoadedPromise: DeferredPromise<void>
  ): Promise<void> {
    // Model loading callback does not work as expected for Point clouds
    if (model instanceof CognitePointCloudModel) {
      return new Promise<void>(resolve => setTimeout(resolve, 5000));
    }

    return modelLoadedPromise;
  }

  private setupDom(viewer: Cognite3DViewer) {
    document.body.append(viewer.domElement);
    viewer.domElement.style.height = '100vh';
    document.body.style.margin = '0px 0px 0px 0px';
  }

  public abstract setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void>;

  public dispose(): void {
    this._viewer.renderer.forceContextLoss();
    this._viewer.dispose();
  }
}
