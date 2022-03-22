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
  let renderTarget: THREE.WebGLRenderTarget;

  if (multiSampleCount > 1) {
    const multiSampleTarget = new THREE.WebGLMultisampleRenderTarget(width, height, { ignoreDepth: false } as any);
    multiSampleTarget.samples = 10;
    renderTarget = multiSampleTarget;
  } else {
    renderTarget = new THREE.WebGLRenderTarget(width, height);
  }

  setDepthTexture(renderTarget, width, height);

  return renderTarget;
}

function setDepthTexture(renderTarget: THREE.WebGLRenderTarget, width: number, height: number): void {
  renderTarget.depthTexture = new THREE.DepthTexture(width, height);
  renderTarget.depthTexture.format = THREE.DepthFormat;
  renderTarget.depthTexture.type = THREE.UnsignedIntType;
}

export enum RenderLayer {
  Back = RenderMode.Color,
  InFront = RenderMode.Effects,
  Ghost = RenderMode.Ghost,
  CustomNormal,
  CustomDeferred
}

export function setupGeometryLayers(
  identifiedModels: IdentifiedModel[],
  customObjects: THREE.Group,
  materialManager: CadMaterialManager
): void {
  identifiedModels.forEach(identifiedModel => setModelRenderLayers(identifiedModel, materialManager));

  customObjects.traverse(node => {
    const customRenderOrder = node.renderOrder > 0 ? RenderLayer.CustomDeferred : RenderLayer.CustomNormal;
    node.layers.set(customRenderOrder);
  });
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
