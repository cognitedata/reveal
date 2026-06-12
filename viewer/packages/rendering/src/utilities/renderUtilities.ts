/*!
 * Copyright 2022 Cognite AS
 */

import type { Color, Object3D } from 'three';
import {
  AlwaysDepth,
  CustomBlending,
  DataTexture,
  DepthFormat,
  DepthTexture,
  GLSL3,
  Mesh,
  NormalBlending,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  RawShaderMaterial,
  SrcAlphaFactor,
  UnsignedIntType,
  WebGLRenderTarget
} from 'three';
import type { WebGLRendererStateHelper } from '@reveal/utilities';
import { createRenderTriangle, createUint8View } from '@reveal/utilities';
import type { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import type { StyledTreeIndexSets } from './types';
import { CogniteColors, RevealColors } from './types';
import type {
  BlendOptions,
  BlitOptions,
  DepthBlendBlitOptions,
  PointCloudPassParameters,
  PointCloudPostProcessingOptions,
  ThreeUniforms
} from '../render-passes/types';
import { BlitEffect } from '../render-passes/types';
import { blitShaders, depthBlendBlitShaders, pointCloudShaders } from '../rendering/shaders';
import { NodeOutlineColor } from '@reveal/cad-styling';
import { DEFAULT_EDL_NEIGHBOURS_COUNT } from '../pointcloud-rendering/constants';
import { shouldApplyEdl } from '../render-pipeline-providers/pointCloudParameterUtils';

export const unitOrthographicCamera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);

export function createFullScreenTriangleMesh(shaderMaterial: RawShaderMaterial): Mesh {
  const renderTriangle = createRenderTriangle();
  const mesh = new Mesh(renderTriangle, shaderMaterial);
  mesh.frustumCulled = false;
  return mesh;
}

export function createRenderTarget(width = 1, height = 1, multiSampleCount = 1): WebGLRenderTarget {
  const renderTarget = new WebGLRenderTarget(width, height);
  renderTarget.samples = multiSampleCount > 1 ? multiSampleCount : 0;

  renderTarget.depthTexture = new DepthTexture(width, height);
  renderTarget.depthTexture.format = DepthFormat;
  renderTarget.depthTexture.type = UnsignedIntType;

  return renderTarget;
}

export function getDepthBlendBlitMaterial(options: DepthBlendBlitOptions): RawShaderMaterial {
  const { texture, depthTexture, blendTexture, blendDepthTexture, blendFactor, outline, overrideAlpha } = options;

  const uniforms: ThreeUniforms = {
    tDiffuse: { value: texture },
    tDepth: { value: depthTexture },
    tBlendDiffuse: { value: blendTexture },
    tBlendDepth: { value: blendDepthTexture },
    blendFactor: { value: blendFactor }
  };

  const defines: Record<string, boolean> = {};
  setAlphaOverride(overrideAlpha, uniforms, defines);

  if (outline ?? false) {
    defines['OUTLINE'] = true;
    uniforms['tOutlineColors'] = { value: createOutlineColorTexture() };
  }

  return new RawShaderMaterial({
    vertexShader: depthBlendBlitShaders.vertex,
    fragmentShader: depthBlendBlitShaders.fragment,
    uniforms,
    glslVersion: GLSL3,
    defines,
    depthFunc: AlwaysDepth
  });
}

export function getBlitMaterial(options: BlitOptions): RawShaderMaterial {
  const { texture, effect, depthTexture, blendOptions, overrideAlpha, ssaoTexture, edges, outline } = options;

  const uniforms: ThreeUniforms = {
    tDiffuse: { value: texture }
  };

  const defines: Record<string, boolean> = {};
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

  return new RawShaderMaterial({
    vertexShader: blitShaders.vertex,
    fragmentShader: blitShaders.fragment,
    uniforms,
    glslVersion: GLSL3,
    defines,
    depthTest,
    ...initializedBlendOptions
  });
}

export function getPointCloudPostProcessingMaterial(options: PointCloudPostProcessingOptions): RawShaderMaterial {
  const { logDepthTexture, texture, depthTexture, pointBlending, edlOptions } = options;

  let uniforms: ThreeUniforms = {
    tLogDepth: { value: logDepthTexture },
    tDiffuse: { value: texture },
    tDepth: { value: depthTexture }
  };

  const defines: Record<string, boolean | number> = {};

  if (pointBlending) {
    defines['points_blend'] = true;
  }

  if (shouldApplyEdl(edlOptions)) {
    defines['use_edl'] = true;
    defines['NEIGHBOUR_COUNT'] = DEFAULT_EDL_NEIGHBOURS_COUNT;

    uniforms = {
      ...uniforms,
      radius: { value: edlOptions.radius },
      edlStrength: { value: edlOptions.strength },
      screenWidth: { value: 1 },
      screeHeight: { value: 1 },
      neighbours: { value: getEDLNeighbourPoints(DEFAULT_EDL_NEIGHBOURS_COUNT) }
    };
  }

  return new RawShaderMaterial({
    vertexShader: pointCloudShaders.normalize.vertex,
    fragmentShader: pointCloudShaders.normalize.fragment,
    uniforms,
    defines,
    glslVersion: GLSL3
  });
}

function getEDLNeighbourPoints(neighbourCount: number): Float32Array {
  const neighbours = new Float32Array(neighbourCount * 2);
  for (let neighbourIndex = 0; neighbourIndex < neighbourCount; neighbourIndex++) {
    neighbours[2 * neighbourIndex + 0] = Math.cos((2 * neighbourIndex * Math.PI) / neighbourCount);
    neighbours[2 * neighbourIndex + 1] = Math.sin((2 * neighbourIndex * Math.PI) / neighbourCount);
  }
  return neighbours;
}

function createOutlineColorTexture(): DataTexture {
  const outlineColorBuffer = new Uint8Array(8 * 4);
  const outlineColorTexture = new DataTexture(outlineColorBuffer, 8, 1);
  const rawData = outlineColorTexture.image.data;
  if (!rawData) return outlineColorTexture;
  const colorTextureView = createUint8View(rawData);
  setOutlineColor(colorTextureView, NodeOutlineColor.Black, CogniteColors.Black);
  setOutlineColor(colorTextureView, NodeOutlineColor.White, CogniteColors.White);
  setOutlineColor(colorTextureView, NodeOutlineColor.Cyan, CogniteColors.Cyan);
  setOutlineColor(colorTextureView, NodeOutlineColor.Blue, CogniteColors.Blue);
  setOutlineColor(colorTextureView, NodeOutlineColor.Green, RevealColors.Green);
  setOutlineColor(colorTextureView, NodeOutlineColor.Red, RevealColors.Red);
  setOutlineColor(colorTextureView, NodeOutlineColor.Orange, CogniteColors.Orange);
  outlineColorTexture.needsUpdate = true;
  return outlineColorTexture;
}

function setOutlineColor(outlineTextureData: Uint8Array | Uint8ClampedArray, colorIndex: number, color: Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
}

function setDepthTestOptions(depthTexture: DepthTexture | null, uniforms: ThreeUniforms, defines: any) {
  if (depthTexture === null) {
    return false;
  }

  uniforms['tDepth'] = { value: depthTexture };
  defines['DEPTH_WRITE'] = true;

  return true;
}

function setAlphaOverride(overrideAlpha: number | undefined, uniforms: ThreeUniforms, defines: any) {
  if (overrideAlpha === undefined) {
    return;
  }
  uniforms['alpha'] = { value: overrideAlpha };
  defines['ALPHA'] = true;
}

function setBlitEffect(effect: BlitEffect | undefined, defines: any) {
  const blitEffect = effect ?? BlitEffect.None;
  if (blitEffect === BlitEffect.GaussianBlur) {
    defines['GAUSSIAN_BLUR'] = true;
  } else if (blitEffect === BlitEffect.Fxaa) {
    defines['FXAA'] = true;
  }
}

function initializeBlendingOptions(blendOptions: BlendOptions | undefined) {
  const blending = blendOptions !== undefined ? CustomBlending : NormalBlending;
  const blendDst = blendOptions?.blendDestination ?? OneMinusSrcAlphaFactor;
  const blendSrc = blendOptions?.blendSource ?? SrcAlphaFactor;
  const blendSrcAlpha = blendOptions?.blendSourceAlpha ?? null; // Uses blendSrc value if undefined
  const blendDstAlpha = blendOptions?.blendDestinationAlpha ?? null; // Uses blendDst value if undefined
  return {
    blending,
    blendDst,
    blendSrc,
    blendSrcAlpha: blendSrcAlpha,
    blendDstAlpha: blendDstAlpha
  };
}

export enum RenderLayer {
  Back = RenderMode.Color,
  InFront = RenderMode.Effects,
  Ghost = RenderMode.Ghost,
  PointCloud,
  Default = 0
}

export function getLayerMask(renderLayer: number): number {
  return ((1 << renderLayer) | 0) >>> 0;
}

export function hasStyledNodes(
  modelIdentifiers: symbol[],
  materialManager: CadMaterialManager
): { back: boolean; inFront: boolean; ghost: boolean } {
  const totalBackIndices = modelIdentifiers.reduce(
    (sum, modelIdentifier) => sum + materialManager.getModelBackTreeIndices(modelIdentifier).count,
    0
  );

  const totalInFrontIndices = modelIdentifiers.reduce(
    (sum, modelIdentifier) => sum + materialManager.getModelInFrontTreeIndices(modelIdentifier).count,
    0
  );

  const totalGhostIndices = modelIdentifiers.reduce(
    (sum, modelIdentifier) => sum + materialManager.getModelGhostedTreeIndices(modelIdentifier).count,
    0
  );

  return { back: totalBackIndices > 0, ghost: totalGhostIndices > 0, inFront: totalInFrontIndices > 0 };
}

export function setModelRenderLayers(rootNode: Object3D, stylingSets: StyledTreeIndexSets): void {
  const { back, ghost, inFront, visible } = stylingSets;
  rootNode.traverse(node => {
    node.layers.disableAll();
    const objectTreeIndices = node.userData?.treeIndices as Map<number, number> | undefined;
    if (objectTreeIndices === undefined) {
      return;
    }

    if (visible.hasIntersectionWithMap(objectTreeIndices)) {
      if (back.hasIntersectionWithMap(objectTreeIndices)) {
        node.layers.enable(RenderLayer.Back);
      }
      if (ghost.hasIntersectionWithMap(objectTreeIndices)) {
        node.layers.enable(RenderLayer.Ghost);
      }
      if (inFront.hasIntersectionWithMap(objectTreeIndices)) {
        node.layers.enable(RenderLayer.InFront);
      }
    }
  });
}

export function setRendererParameters(
  rendererHelper: WebGLRendererStateHelper,
  parameters: PointCloudPassParameters
): void {
  if (parameters?.renderer) {
    for (const prop of Object.entries(parameters.renderer)) {
      try {
        //@ts-expect-error
        rendererHelper[prop[0]] = prop[1];
      } catch {
        console.error(`Undefined WebGLRendererStateHelper property: ${prop[0]}`);
      }
    }
  }
}
