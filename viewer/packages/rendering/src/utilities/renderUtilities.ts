/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { createRenderTriangle, WebGLRendererStateHelper, createUint8View } from '@reveal/utilities';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { CogniteColors, RevealColors, StyledTreeIndexSets } from './types';
import {
  BlendOptions,
  BlitEffect,
  BlitOptions,
  DepthBlendBlitOptions,
  PointCloudPassParameters,
  PointCloudPostProcessingOptions,
  ThreeUniforms
} from '../render-passes/types';
import { blitShaders, depthBlendBlitShaders, pointCloudShaders } from '../rendering/shaders';
import { NodeOutlineColor } from '@reveal/cad-styling';
import { DEFAULT_EDL_NEIGHBOURS_COUNT } from '../pointcloud-rendering/constants';
import { shouldApplyEdl } from '../render-pipeline-providers/pointCloudParameterUtils';

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

export function getDepthBlendBlitMaterial(options: DepthBlendBlitOptions): THREE.RawShaderMaterial {
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

  return new THREE.RawShaderMaterial({
    vertexShader: depthBlendBlitShaders.vertex,
    fragmentShader: depthBlendBlitShaders.fragment,
    uniforms,
    glslVersion: THREE.GLSL3,
    defines,
    depthFunc: THREE.AlwaysDepth
  });
}

export function getBlitMaterial(options: BlitOptions): THREE.RawShaderMaterial {
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

  return new THREE.RawShaderMaterial({
    vertexShader: blitShaders.vertex,
    fragmentShader: blitShaders.fragment,
    uniforms,
    glslVersion: THREE.GLSL3,
    defines,
    depthTest,
    ...initializedBlendOptions
  });
}

export function getPointCloudPostProcessingMaterial(options: PointCloudPostProcessingOptions): THREE.RawShaderMaterial {
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

  return new THREE.RawShaderMaterial({
    vertexShader: pointCloudShaders.normalize.vertex,
    fragmentShader: pointCloudShaders.normalize.fragment,
    uniforms,
    defines,
    glslVersion: THREE.GLSL3
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

function createOutlineColorTexture(): THREE.DataTexture {
  const outlineColorBuffer = new Uint8Array(8 * 4);
  const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
  const colorTextureView = createUint8View(outlineColorTexture.image.data);
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

function setOutlineColor(outlineTextureData: Uint8Array | Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
}

function setDepthTestOptions(depthTexture: THREE.DepthTexture | null, uniforms: ThreeUniforms, defines: any) {
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
  const blending = blendOptions !== undefined ? THREE.CustomBlending : THREE.NormalBlending;
  const blendDst = blendOptions?.blendDestination ?? THREE.OneMinusSrcAlphaFactor;
  const blendSrc = blendOptions?.blendSource ?? THREE.SrcAlphaFactor;
  const blendSrcAlpha = blendOptions?.blendSourceAlpha ?? null; // Uses blendSrc value if undefined
  const blendDstAlpha = blendOptions?.blendDestinationAlpha ?? null; // Uses blendDst value if undefined
  return {
    blending,
    blendDst,
    blendSrc,
    // TODO 2022-05-28 larsmoa: @types/three@0.140.0 wrongly defines these as type 'number | undefined', while
    // the correct type is 'number | null' (https://threejs.org/docs/index.html?q=Material#api/en/materials/Material.blendSrcAlpha)
    blendSrcAlpha: blendSrcAlpha as number | undefined,
    blendDstAlpha: blendDstAlpha as number | undefined
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
  modelIdentifiers: string[],
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

export function setModelRenderLayers(rootNode: THREE.Object3D, stylingSets: StyledTreeIndexSets): void {
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
