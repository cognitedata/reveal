/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { createRenderTriangle } from '@reveal/utilities';
import { blitShaders } from '../rendering/shaders';

export const unitOrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

export function createFullscreenTextureObject(
  diffuseTexture: THREE.Texture,
  depthTexture?: THREE.Texture,
  transparent = false
): THREE.Mesh {
  const renderTriangle = createRenderTriangle();

  const uniforms = {
    tDiffuse: { value: diffuseTexture }
  };

  const defines = {};

  let depthTest = false;

  if (depthTexture !== undefined) {
    uniforms['tDepth'] = { value: depthTexture };
    defines['DEPTH_WRITE'] = true;
    depthTest = true;
  }

  const blitShaderMaterial = new THREE.RawShaderMaterial({
    vertexShader: blitShaders.vertex,
    fragmentShader: blitShaders.fragment,
    uniforms,
    glslVersion: THREE.GLSL3,
    transparent: transparent,
    defines,
    depthTest
  });

  return new THREE.Mesh(renderTriangle, blitShaderMaterial);
}

export function createRenderTargetWithDepth(width = 1, heigth = 1): THREE.WebGLRenderTarget {
  const renderTarget = new THREE.WebGLRenderTarget(width, heigth);
  renderTarget.depthTexture = new THREE.DepthTexture(width, heigth);
  renderTarget.depthTexture.format = THREE.DepthFormat;
  renderTarget.depthTexture.type = THREE.UnsignedIntType;

  return renderTarget;
}
