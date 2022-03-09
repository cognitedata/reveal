/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadScene: THREE.Scene;

  constructor(materialManager: CadMaterialManager, scene: THREE.Scene) {
    this._materialManager = materialManager;
    this._cadScene = scene;
  }

  *pipeline(): Generator<RenderPass> {
    this._materialManager.setRenderMode(RenderMode.Color);
    const geometryPass = new GeometryPass(this._cadScene);
    yield geometryPass;
  }
}
