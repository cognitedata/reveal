/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteCadModel, Cognite3DViewer, CogniteModel } from '..';
import * as THREE from 'three';

import { VisualTestFixture } from '../../../visual-tests/test-fixtures/VisualTestFixture';
import { DefaultNodeAppearance } from '@reveal/cad-styling';
import { createCognite3DViewer } from '../../../visual-tests/test-fixtures/utilities/cognite3DViewerHelpers';
import { AxisViewTool } from '../../../packages/tools';

export default class TwoModelsVisualTest implements VisualTestFixture {
  private _viewer!: Cognite3DViewer;
  private readonly _renderer: THREE.WebGLRenderer;

  constructor() {
    this._renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance' });
    this._renderer.setPixelRatio(window.devicePixelRatio);
  }

  public async run(): Promise<void> {
    let totalItemsLoaded = 0;
    let totalItemsRequested = 0;

    this._viewer = await createCognite3DViewer(modelLoadingCallback, this._renderer);

    this.setupDom(this._viewer);

    // Load models SEQUENTIALLY to avoid resource conflicts
    const firstModel = await this._viewer.addCadModel({
      modelId: -1,
      revisionId: -1,
      localPath: `${window.location.origin}/primitives`
    });

    // Wait for first model to fully load before starting second
    await this.waitForModelToLoad();

    const secondModel = await this._viewer.addCadModel({
      modelId: -2, // Different modelId to ensure uniqueness
      revisionId: -2,
      localPath: `${window.location.origin}/primitives`
    });

    // Wait for second model to fully load
    await this.waitForModelToLoad();

    const models = [firstModel, secondModel];

    new AxisViewTool(this._viewer);
    this._viewer.fitCameraToModel(models[0]);

    await this.setup({ viewer: this._viewer, models });

    function modelLoadingCallback(itemsLoaded: number, itemsRequested: number, _: number) {
      totalItemsLoaded = itemsLoaded;
      totalItemsRequested = itemsRequested;
    }
  }

  private async waitForModelToLoad(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 250));
  }

  public async setup({ models }: { viewer: Cognite3DViewer; models: CogniteModel[] }): Promise<void> {
    const model = models[1];

    if (!(model instanceof CogniteCadModel)) {
      return Promise.resolve();
    }

    model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    const translation = new THREE.Matrix4().makeTranslation(0, 5, 0);
    const transform = model.getModelTransformation();
    transform.multiply(translation);
    model.setModelTransformation(transform);
  }

  private setupDom(viewer: Cognite3DViewer) {
    document.body.append(viewer.domElement);
    viewer.domElement.style.height = '100vh';
    document.body.style.margin = '0px 0px 0px 0px';
  }

  public dispose(): void {
    this._renderer.forceContextLoss();
    this._viewer.dispose();
  }
}
