/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { createRenderTriangle } from '@reveal/utilities';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { IdentifiedModel } from './types';

export const unitOrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

export function createFullScreenTriangleMesh(shaderMaterial: THREE.RawShaderMaterial): THREE.Mesh {
  const renderTriangle = createRenderTriangle();
  return new THREE.Mesh(renderTriangle, shaderMaterial);
}

export function createRenderTarget(width = 1, height = 1, multiSampleCount = 1): THREE.WebGLRenderTarget {
  const renderTarget = new THREE.WebGLRenderTarget(width, height);
  renderTarget.samples = multiSampleCount > 1 ? multiSampleCount : 0;

  renderTarget.depthTexture = new THREE.DepthTexture(width, height);
  renderTarget.depthTexture.format = THREE.DepthFormat;
  renderTarget.depthTexture.type = THREE.UnsignedIntType;

  return renderTarget;
}

export enum RenderLayer {
  Back = RenderMode.Color,
  InFront = RenderMode.Effects,
  Ghost = RenderMode.Ghost,
  CustomNormal,
  CustomDeferred
}

export function setupGeometryLayers(
  materialManager: CadMaterialManager,
  identifiedModels?: IdentifiedModel[],
  customObjects?: THREE.Object3D[]
): void {
  identifiedModels?.forEach(identifiedModel => setModelRenderLayers(identifiedModel, materialManager));

  customObjects?.forEach(customObject => {
    customObject.traverse(node => {
      const customRenderOrder = node.renderOrder > 0 ? RenderLayer.CustomDeferred : RenderLayer.CustomNormal;
      node.layers.set(customRenderOrder);
    });
  });
}

export function getLayerMask(renderLayer: number): number {
  return ((1 << renderLayer) | 0) >>> 0;
}

function setModelRenderLayers(identifiedModel: IdentifiedModel, materialManager: CadMaterialManager) {
  const { model, modelIdentifier } = identifiedModel;

  const backSet = materialManager.getModelBackTreeIndices(modelIdentifier);
  const ghostSet = materialManager.getModelGhostedTreeIndices(modelIdentifier);
  const inFrontSet = materialManager.getModelInFrontTreeIndices(modelIdentifier);

  model.traverse(node => {
    node.layers.disableAll();
    const objectTreeIndices = node.userData?.treeIndices as Map<number, number> | undefined;
    if (objectTreeIndices === undefined) {
      return;
    }
    if (backSet.hasIntersectionWith(objectTreeIndices)) {
      node.layers.enable(RenderLayer.Back);
    }
    if (ghostSet.hasIntersectionWith(objectTreeIndices)) {
      node.layers.enable(RenderLayer.Ghost);
    }
    if (inFrontSet.hasIntersectionWith(objectTreeIndices)) {
      node.layers.enable(RenderLayer.InFront);
    }
  });
}
