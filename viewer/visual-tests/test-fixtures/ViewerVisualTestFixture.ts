/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer, Cognite3DModel } from '../../packages/api';
import { VisualTestFixture } from './VisualTestFixture';
import { addModel, createCognite3DViewer } from './utilities/cognite3DViewerHelpers';
import { DeferredPromise } from '../../packages/utilities';
import { CognitePointCloudModel } from '../../packages/pointclouds';
import { AxisViewTool } from '../../packages/tools';

export abstract class ViewerVisualTestFixture implements VisualTestFixture {
  private readonly _localModelUrl: string | undefined;

  constructor(localModelUrl?: string) {
    console.log('asd');
    this._localModelUrl = localModelUrl;
  }

  public async run(): Promise<void> {
    const modelLoadedPromise = new DeferredPromise<void>();
    const viewer = await createCognite3DViewer(modelLoadingCallback);

    this.setupDom(viewer);

    const model = await addModel(viewer, this._localModelUrl);
    new AxisViewTool(viewer);

    viewer.fitCameraToModel(model);

    await this.modelLoaded(model, modelLoadedPromise);

    await this.setup();

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

  public abstract setup(): Promise<void>;
}
