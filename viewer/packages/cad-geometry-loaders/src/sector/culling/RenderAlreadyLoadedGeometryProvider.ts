/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { BasicPipelineExecutor, CadGeometryRenderModePipelineProvider } from '@reveal/rendering';
import { LevelOfDetail, SectorNode } from '@reveal/cad-parsers';

export class RenderAlreadyLoadedGeometryProvider {
  private readonly _depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _basicPipelineExecutor: BasicPipelineExecutor;

  constructor(renderer: THREE.WebGLRenderer, depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider) {
    this._basicPipelineExecutor = new BasicPipelineExecutor(renderer);
    this._depthOnlyRenderPipeline = depthOnlyRenderPipeline;
  }

  renderOccludingGeometry(target: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void {
    const scene = this._depthOnlyRenderPipeline.scene;

    scene?.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === LevelOfDetail.Simple) {
        x.visible = false;
      }
    });

    this._depthOnlyRenderPipeline.setOutputRenderTarget(target);
    this._basicPipelineExecutor.render(this._depthOnlyRenderPipeline, camera);

    scene?.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === LevelOfDetail.Simple) {
        x.visible = true;
      }
    });
  }
}
