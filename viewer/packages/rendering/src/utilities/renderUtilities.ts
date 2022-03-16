/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { createRenderTriangle } from '@reveal/utilities';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';

export const unitOrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

export function createFullScreenTriangleMesh(shaderMaterial: THREE.RawShaderMaterial): THREE.Mesh {
  const renderTriangle = createRenderTriangle();
  return new THREE.Mesh(renderTriangle, shaderMaterial);
}

export function createRenderTargetWithDepth(width = 1, heigth = 1): THREE.WebGLRenderTarget {
  const renderTarget = new THREE.WebGLRenderTarget(width, heigth);
  renderTarget.depthTexture = new THREE.DepthTexture(width, heigth);
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
  cadModels: THREE.Group,
  customObjects: THREE.Group,
  materialManager: CadMaterialManager
): void {
  const backSet = materialManager.getModelBackTreeIndices('0');
  const ghostSet = materialManager.getModelGhostedTreeIndices('0');
  const inFrontSet = materialManager.getModelInFrontTreeIndices('0');

  cadModels.traverse(node => {
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

  customObjects.traverse(node => {
    const customRenderOrder = node.renderOrder > 0 ? RenderLayer.CustomDeferred : RenderLayer.CustomNormal;
    node.layers.set(customRenderOrder);
  });
}
