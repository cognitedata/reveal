/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { createRenderTriangle } from '@reveal/utilities';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { CogniteColors, IdentifiedModel, RevealColors } from './types';
import { BlendOptions, BlitEffect, BlitOptions, ThreeUniforms } from '../render-passes/types';
import { blitShaders } from '../rendering/shaders';
import { NodeOutlineColor } from '@reveal/cad-styling';

export const unitOrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

export function createFullScreenTriangleMesh(shaderMaterial: THREE.RawShaderMaterial): THREE.Mesh {
  const renderTriangle = createRenderTriangle();
  const mesh = new THREE.Mesh(renderTriangle, shaderMaterial);
  mesh.frustumCulled = false;
  return mesh;
}

export function createRenderTarget(width = 1, height = 1, multiSampleCount = 1): THREE.WebGLRenderTarget {
  const renderTarget = new THREE.WebGLRenderTarget(width, height);
  renderTarget.samples = multiSampleCount > 1 ? multiSampleCount : 0;

  renderTarget.depthTexture = new THREE.DepthTexture(width, height);
  renderTarget.depthTexture.format = THREE.DepthFormat;
  renderTarget.depthTexture.type = THREE.UnsignedIntType;

  return renderTarget;
}

export function getBlitMaterial(options: BlitOptions): THREE.RawShaderMaterial {
  const { texture, effect, depthTexture, blendOptions, overrideAlpha, ssaoTexture, writeColor, edges, outline } =
    options;

  const uniforms = {
    tDiffuse: { value: texture }
  };

  const defines = {};
  const depthTest = setDepthTestOptions(depthTexture, uniforms, defines);
  setAlphaOverride(overrideAlpha, uniforms, defines);
  setBlitEffect(effect, defines);

  if (edges ?? false) {
    defines['EDGES'] = true;
  }

  if (outline ?? false) {
    defines['OUTLINE'] = true;
    uniforms['tOutlineColors'] = { value: createOutlineColorTexture() };
  }

  if (ssaoTexture) {
    defines['SSAO_BLUR'] = true;
    uniforms['tSsao'] = { value: ssaoTexture };
  }

  const initializedBlendOptions = initializeBlendingOptions(blendOptions); // Uses blendDst value if null

  return new THREE.RawShaderMaterial({
    vertexShader: blitShaders.vertex,
    fragmentShader: blitShaders.fragment,
    uniforms,
    glslVersion: THREE.GLSL3,
    defines,
    depthTest,
    colorWrite: writeColor ?? true,
    ...initializedBlendOptions
  });
}

function createOutlineColorTexture(): THREE.DataTexture {
  const outlineColorBuffer = new Uint8Array(8 * 4);
  const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Black, CogniteColors.Black);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.White, CogniteColors.White);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Cyan, CogniteColors.Cyan);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Blue, CogniteColors.Blue);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Green, RevealColors.Green);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Red, RevealColors.Red);
  setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Orange, CogniteColors.Orange);
  outlineColorTexture.needsUpdate = true;
  return outlineColorTexture;
}

function setOutlineColor(outlineTextureData: Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
}

function setDepthTestOptions(depthTexture: THREE.DepthTexture, uniforms: ThreeUniforms, defines: any) {
  if (depthTexture === undefined) {
    return false;
  }

  uniforms['tDepth'] = { value: depthTexture };
  defines['DEPTH_WRITE'] = true;

  return true;
}

function setAlphaOverride(overrideAlpha: number, uniforms: ThreeUniforms, defines: any) {
  if (overrideAlpha === undefined) {
    return;
  }
  uniforms['alpha'] = { value: overrideAlpha };
  defines['ALPHA'] = true;
}

function setBlitEffect(effect: BlitEffect, defines: any) {
  const blitEffect = effect ?? BlitEffect.None;
  if (blitEffect === BlitEffect.GaussianBlur) {
    defines['GAUSSIAN_BLUR'] = true;
  } else if (blitEffect === BlitEffect.Fxaa) {
    defines['FXAA'] = true;
  }
}

function initializeBlendingOptions(blendOptions: BlendOptions) {
  const blending = blendOptions !== undefined ? THREE.CustomBlending : THREE.NormalBlending;
  const blendDst = blendOptions?.blendDestination ?? THREE.OneMinusSrcAlphaFactor;
  const blendSrc = blendOptions?.blendSource ?? THREE.SrcAlphaFactor;
  const blendSrcAlpha = blendOptions?.blendSourceAlpha ?? null; // Uses blendSrc value if null
  const blendDstAlpha = blendOptions?.blendDestinationAlpha ?? null; // Uses blendDst value if null
  return { blending, blendDst, blendSrc, blendSrcAlpha, blendDstAlpha };
}

export enum RenderLayer {
  Back = RenderMode.Color,
  InFront = RenderMode.Effects,
  Ghost = RenderMode.Ghost
}

export function setupCadModelsGeometryLayers(
  materialManager: CadMaterialManager,
  identifiedModels?: IdentifiedModel[]
): void {
  identifiedModels?.forEach(identifiedModel => setModelRenderLayers(identifiedModel, materialManager));
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
