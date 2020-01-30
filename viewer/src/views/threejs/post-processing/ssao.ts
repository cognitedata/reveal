/*!
 * Copyright 2020 Cognite AS
 */

import glsl from 'glslify';
import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';
import { RenderType } from '../materials';

const vertexShaderAntialias = glsl(require('../../../glsl/post-processing/fxaa.vert').default);
const fragmentShaderAntialias = glsl(require('../../../glsl/post-processing/fxaa.frag').default);
const passThroughVertexShader = glsl(require('../../../glsl/post-processing/passthrough.vert').default);
const ssaoShader = glsl(require('../../../glsl/post-processing/ssao.frag').default);
const ssaoFinalShader = glsl(require('../../../glsl/post-processing/ssao-blur.frag').default);

function setupRenderingPass(options: { uniforms: any; vertexShader: string; fragmentShader: string }): THREE.Scene {
  const scene = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    uniforms: options.uniforms,
    vertexShader: options.vertexShader,
    fragmentShader: options.fragmentShader,
    depthWrite: false
  });
  const quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  return scene;
}

interface SceneInfo {
  scene: THREE.Scene;
  uniforms: any;
}

function createSSAOFinalScene(diffuseTexture: THREE.Texture, ssaoTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    ssaoTexture: { value: ssaoTexture },
    size: { value: new THREE.Vector2() }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: passThroughVertexShader,
    fragmentShader: ssaoFinalShader
  });
  return { scene, uniforms };
}

function createAntialiasScene(diffuseTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    resolution: { value: new THREE.Vector2() }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: vertexShaderAntialias,
    fragmentShader: fragmentShaderAntialias
  });
  return { scene, uniforms };
}

const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export interface Pass {
  render: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;
  setSize: (width: number, height: number) => void;
}

function lerp(value1: number, value2: number, amount: number) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}

function traverseShaderMaterials(rootNode: THREE.Object3D, callback: (material: THREE.ShaderMaterial) => void) {
  rootNode.traverseVisible(obj => {
    // NOTE we cannot rely on instanceof here because THREE is not necessarily the same library
    if (obj.type !== 'Mesh') {
      return;
    }
    const mesh = obj as THREE.Mesh;
    if (mesh.material == null || Array.isArray(mesh.material) || mesh.material.type !== 'ShaderMaterial') {
      return;
    }
    const material = mesh.material as THREE.ShaderMaterial;

    callback(material);
  });
}

function createKernel() {
  const kernelSize = 32;
  const result = [];

  for (let i = 0; i < kernelSize; i++) {
    const sample = new THREE.Vector3();

    while (sample.length() < 0.5) {
      // Ensure some distance in samples
      sample.x = Math.random() * 2 - 1;
      sample.y = Math.random() * 2 - 1;
      sample.z = Math.random();
    }

    sample.normalize();

    let scale = i / kernelSize;
    scale = lerp(0.1, 1, scale * scale);
    sample.multiplyScalar(scale);

    result.push(sample);
  }

  return result;
}

function createNoiseTexture() {
  const width = 128;
  const height = 128;

  const simplex = new SimplexNoise();

  const size = width * height;
  const data = new Float32Array(size * 4);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;

    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = 0;

    const noise = simplex.noise3d(x, y, z);

    data[stride] = noise;
    data[stride + 1] = noise;
    data[stride + 2] = noise;
    data[stride + 3] = 1;
  }

  const result = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  result.wrapS = THREE.RepeatWrapping;
  result.wrapT = THREE.RepeatWrapping;
  return result;
}

export function createSsaoPass(): Pass {
  const modelTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  modelTarget.depthBuffer = true;
  modelTarget.depthTexture = new THREE.DepthTexture(0, 0); // size will be set by the first render
  modelTarget.depthTexture.type = THREE.UnsignedIntType;

  const ssaoTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  ssaoTarget.depthBuffer = false;
  ssaoTarget.stencilBuffer = false;

  const ssaoFinalTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  ssaoFinalTarget.depthBuffer = false;
  ssaoFinalTarget.stencilBuffer = false;

  const normalTarget = new THREE.WebGLRenderTarget(0, 0, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false
  });

  const kernel = createKernel();
  const noiseTexture = createNoiseTexture();

  const ssaoUniforms = {
    tDiffuse: { value: modelTarget.texture },
    tDepth: { value: modelTarget.depthTexture },
    tNoise: { value: noiseTexture },
    tNormal: { value: normalTarget.texture },
    resolution: { value: new THREE.Vector2() },
    kernel: { value: kernel },
    kernelRadius: { value: 1.0 },
    minDistance: { value: 0.00001 },
    maxDistance: { value: 0.001 },
    cameraNear: { value: 0.0 }, // set during rendering
    cameraFar: { value: 0.0 }, // set during rendering
    cameraProjectionMatrix: { value: new THREE.Matrix4() },
    cameraInverseProjectionMatrix: { value: new THREE.Matrix4() }
  };
  const ssaoScene = setupRenderingPass({
    uniforms: ssaoUniforms,
    vertexShader: passThroughVertexShader,
    fragmentShader: ssaoShader
  });

  const { scene: ssaoFinalScene, uniforms: ssaoFinalUniforms } = createSSAOFinalScene(
    modelTarget.texture,
    ssaoTarget.texture
  );

  const { scene: antiAliasScene, uniforms: antiAliasUniforms } = createAntialiasScene(ssaoFinalTarget.texture);

  /////////

  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const setSize = (width: number, height: number) => {
    modelTarget.setSize(width, height);

    normalTarget.setSize(width, height);

    antiAliasUniforms.resolution.value.set(width, height);

    ssaoTarget.setSize(width, height);
    ssaoUniforms.resolution.value.set(width, height);

    ssaoFinalTarget.setSize(width, height);
    ssaoFinalUniforms.size.value.set(width, height);
  };

  const render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    {
      // Regular pass
      renderer.clear(true, true, false);
      // renderer.setRenderTarget(null);
      renderer.setRenderTarget(modelTarget);
      renderer.render(scene, camera);
      // return;
    }

    {
      // Normal pass
      traverseShaderMaterials(scene.children[0], material => {
        material.uniforms.renderType = { value: RenderType.Normal };
      });

      const previousClearAlpha = renderer.getClearAlpha();
      const previousClearColor = renderer.getClearColor().clone();

      renderer.setClearColor(new THREE.Color(0x7777ff), 1.0);
      // renderer.setRenderTarget(null);
      renderer.setRenderTarget(normalTarget);
      renderer.clear(true, false, false);
      renderer.render(scene, camera);
      // return;

      renderer.setClearColor(previousClearColor);
      renderer.setClearAlpha(previousClearAlpha);

      traverseShaderMaterials(scene.children[0], material => {
        material.uniforms.renderType = { value: RenderType.Color };
      });
    }

    {
      // SSAO pass
      ssaoUniforms.cameraNear.value = camera.near;
      ssaoUniforms.cameraFar.value = camera.far;
      ssaoUniforms.cameraProjectionMatrix.value = camera.projectionMatrix;
      ssaoUniforms.cameraInverseProjectionMatrix.value = camera.projectionMatrixInverse;
      renderer.setRenderTarget(ssaoTarget);
      //renderer.setRenderTarget(null);
      renderer.render(ssaoScene, quadCamera);
    }
    //return;

    {
      // SSAO final pass
      renderer.setRenderTarget(ssaoFinalTarget);
      //renderer.setRenderTarget(null);
      renderer.render(ssaoFinalScene, quadCamera);
    }
    //return;

    {
      // FXAA pass
      renderer.setRenderTarget(null);
      renderer.render(antiAliasScene, quadCamera);
    }
  };

  return {
    render,
    setSize
  };
}

export class SsaoEffect {
  private _ssaoPass: Pass;

  constructor() {
    this._ssaoPass = createSsaoPass();
  }

  setSize(width: number, height: number) {
    this._ssaoPass.setSize(width, height);
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this._ssaoPass.render(renderer, scene, camera);
  }
}
