/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { BasicPipelineExecutor, EffectRenderManager, GeometryDepthRenderPipeline } from '@reveal/rendering';
import { LevelOfDetail, SectorNode } from '@reveal/cad-parsers';

export class RenderAlreadyLoadedGeometryProvider {
  private readonly _renderManager: EffectRenderManager;
  private readonly _depthOnlyRenderPipeline: GeometryDepthRenderPipeline;
  private readonly _basicPipelineExecutor: BasicPipelineExecutor;

  constructor(
    renderManager: EffectRenderManager,
    renderer: THREE.WebGLRenderer,
    depthOnlyRenderPipeline: GeometryDepthRenderPipeline
  ) {
    this._renderManager = renderManager;
    this._basicPipelineExecutor = new BasicPipelineExecutor(renderer);
    this._depthOnlyRenderPipeline = depthOnlyRenderPipeline;
  }

  async renderOccludingGeometry(
    target: THREE.WebGLRenderTarget | null,
    camera: THREE.PerspectiveCamera
  ): Promise<void> {
    // const original = {
    //   renderTarget: this._renderManager.getRenderTarget(),
    //   autoSize: this._renderManager.getRenderTargetAutoSize()
    // };
    // try {
    //   this._renderManager.setRenderTarget(target);
    //   this._renderManager.renderDetailedToDepthOnly(camera);
    // } finally {
    //   this._renderManager.setRenderTarget(original.renderTarget);
    //   this._renderManager.setRenderTargetAutoSize(original.autoSize);
    // }

    const scene = this._depthOnlyRenderPipeline.scene;

    scene.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === LevelOfDetail.Simple) {
        x.visible = false;
      }
    });

    this._depthOnlyRenderPipeline.outputRenderTarget = target;
    await this._basicPipelineExecutor.render(this._depthOnlyRenderPipeline, camera);

    scene.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === LevelOfDetail.Simple) {
        x.visible = true;
      }
    });
  }
}
