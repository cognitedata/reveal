/*!
 * Copyright 2025 Cognite AS
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

  private _modelLoadingResolve: (() => void) | null = null;
  private _itemsLoaded = 0;
  private _itemsRequested = 0;

  constructor() {
    this._renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance' });
    this._renderer.setPixelRatio(window.devicePixelRatio);
  }

  public async run(): Promise<void> {
    const modelLoadingCallback = this.onModelLoading.bind(this);

    this._viewer = await createCognite3DViewer(modelLoadingCallback, this._renderer);

    this.setupDom(this._viewer);

    // Load first model and wait for it to finish
    const firstModel = await this._viewer.addCadModel({
      modelId: -1,
      revisionId: -1,
      localPath: `${window.location.origin}/primitives`
    });
    await this.waitForModelToLoad();

    // Load second model and wait for it
    const secondModel = await this._viewer.addCadModel({
      modelId: -2,
      revisionId: -2,
      localPath: `${window.location.origin}/primitives`
    });
    await this.waitForModelToLoad();

    const models = [firstModel, secondModel];

    new AxisViewTool(this._viewer);
    this._viewer.fitCameraToModel(models[0]);

    await this.setup({ viewer: this._viewer, models });
  }

  private onModelLoading(itemsLoaded: number, itemsRequested: number, _: number) {
    this._itemsLoaded = itemsLoaded;
    this._itemsRequested = itemsRequested;

    // If a promise is waiting, check if loading is done
    if (this._modelLoadingResolve && this._itemsLoaded === this._itemsRequested && this._itemsRequested > 0) {
      this._modelLoadingResolve();
      this._modelLoadingResolve = null;
    }
  }

  private async waitForModelToLoad(): Promise<void> {
    // Reset counters for the new model load
    this._itemsLoaded = 0;
    this._itemsRequested = 0;

    return new Promise(resolve => {
      // The callback might have already fired before we even started waiting.
      if (this._itemsLoaded === this._itemsRequested && this._itemsRequested > 0) {
        resolve();
      } else {
        // Otherwise, store the 'resolve' function so the callback can call it
        this._modelLoadingResolve = resolve;
      }
    });
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
