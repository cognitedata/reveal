/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMaterial } from '@reveal/pointclouds/src/potree-three-loader';
import { SceneHandler, WebGLRendererStateHelper } from '@reveal/utilities';
import * as THREE from 'three';
import { RenderPass } from '../RenderPass';
import { getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import { PointCloudPassParameters } from './types';

export class PointCloudEffectsPass implements RenderPass {
  private readonly _viewerScene: THREE.Object3D;
  private readonly _sceneHandler: SceneHandler;
  private readonly _passMaterialParameters: PointCloudPassParameters;

  constructor(sceneHandler: SceneHandler, materialParameters?: PointCloudPassParameters) {
    this._viewerScene = sceneHandler.scene;
    this._sceneHandler = sceneHandler;
    this._passMaterialParameters = materialParameters ?? {};
}

    public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
        const currentCameraMask = camera.layers.mask;
        const rendererStateHelper = new WebGLRendererStateHelper(renderer);
        try {
            camera.layers.mask = getLayerMask(RenderLayer.PointCloud);

            this._sceneHandler.pointCloudModels.forEach(model =>
                this.setMaterialParameters(model.object.pointCloudNode.potreeNode.octree.material));
                
            this.setRendererParameters(rendererStateHelper);

            renderer.render(this._viewerScene, camera);
        } finally {
            rendererStateHelper.resetState();

            camera.layers.mask = currentCameraMask;
        }
    }

    private setMaterialParameters(material: PointCloudMaterial): void {
        const parameters = this._passMaterialParameters?.material;
        if (parameters) {
            for (const prop of Object.entries(parameters)) {
                try {
                    //@ts-expect-error
                    material[prop[0]] = prop[1];
                } catch {
                    console.error(`Undefined point cloud material property: ${prop[0]}`);
                }
            }
        }
    }

    private setRendererParameters(rendererHelper: WebGLRendererStateHelper): void {
        const parameters = this._passMaterialParameters?.renderer;
        if (parameters) {
            for (const prop of Object.entries(parameters)) {
                try {
                    //@ts-expect-error
                    rendererHelper[prop[0]] = prop[1];
                } catch {
                    console.error(`Undefined WebGLRendererStateHelper property: ${prop[0]}`);
                }
            }
        }
    }
}
