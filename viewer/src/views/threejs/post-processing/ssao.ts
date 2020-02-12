/*!
 * Copyright 2020 Cognite AS
 */

import glsl from 'glslify';
import * as THREE from 'three';
import { RenderMode } from '../materials';
import { CadNode } from '../cad/CadNode';

const vertexShaderAntialias = glsl(require('../../../glsl/post-processing/fxaa.vert').default);
const fragmentShaderAntialias = glsl(require('../../../glsl/post-processing/fxaa.frag').default);
const passThroughVertexShader = glsl(require('../../../glsl/post-processing/passthrough.vert').default);
const ssaoShader = glsl(require('../../../glsl/post-processing/ssao.frag').default);
const ssaoFinalShader = glsl(require('../../../glsl/post-processing/ssao-final.frag').default);

interface Uniforms {
  [uniform: string]: THREE.IUniform;
}

function setupRenderingPass(options: {
  uniforms: Uniforms;
  vertexShader: string;
  fragmentShader: string;
}): THREE.Scene {
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
  uniforms: Uniforms;
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
  render: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    pass?: SsaoPassType
  ) => void;
  uniforms: Uniforms;
}

function lerp(value1: number, value2: number, amount: number) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
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

  const size = width * height;
  const data = new Float32Array(size * 4);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;

    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;

    data[stride] = x;
    data[stride + 1] = y;
    data[stride + 2] = z;
    data[stride + 3] = 1;
  }

  const result = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  result.wrapS = THREE.RepeatWrapping;
  result.wrapT = THREE.RepeatWrapping;
  return result;
}

export enum SsaoPassType {
  Regular = 'Regular',
  Ssao = 'Ssao',
  SsaoFinal = 'SsaoFinal',
  Antialias = 'Antialias'
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
    resolution: { value: new THREE.Vector2() },
    kernel: { value: kernel },
    kernelRadius: { value: 1.0 },
    minDistance: { value: 0.0001 },
    maxDistance: { value: 0.1 },
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

  const setSize = (width: number, height: number) => {
    modelTarget.setSize(width, height);

    normalTarget.setSize(width, height);

    antiAliasUniforms.resolution.value.set(width, height);

    ssaoTarget.setSize(width, height);
    ssaoUniforms.resolution.value.set(width, height);

    ssaoFinalTarget.setSize(width, height);
    ssaoFinalUniforms.size.value.set(width, height);
  };

  const rendererSize = new THREE.Vector2();

  const render = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    pass?: SsaoPassType
  ) => {
    renderer.getSize(rendererSize);
    if (modelTarget.width !== rendererSize.x || modelTarget.height !== rendererSize.y) {
      setSize(rendererSize.x, rendererSize.y);
    }

    pass = pass || SsaoPassType.Antialias;
    {
      // Regular pass
      renderer.setClearColor(new THREE.Color(0x7777ff), 0.0);
      renderer.setRenderTarget(modelTarget);
      // TODO ordering
      renderer.clear(true, true, false);
      if (pass === SsaoPassType.Regular) {
        renderer.setRenderTarget(null);
      }
      scene.traverseVisible(object => {
        if (object.type !== 'CadNode') {
          return;
        }
        const cadNode = object as CadNode;
        cadNode.renderMode = RenderMode.PackColorAndNormal;
      });
      renderer.render(scene, camera);
      scene.traverseVisible(object => {
        if (object.type !== 'CadNode') {
          return;
        }
        const cadNode = object as CadNode;
        cadNode.renderMode = RenderMode.Color;
      });
      if (pass === SsaoPassType.Regular) {
        return;
      }
    }

    {
      // SSAO pass
      ssaoUniforms.cameraNear.value = camera.near;
      ssaoUniforms.cameraFar.value = camera.far;
      ssaoUniforms.cameraProjectionMatrix.value = camera.projectionMatrix;
      ssaoUniforms.cameraInverseProjectionMatrix.value = camera.projectionMatrixInverse;
      renderer.setRenderTarget(ssaoTarget);
      if (pass === SsaoPassType.Ssao) {
        renderer.setRenderTarget(null);
      }
      renderer.render(ssaoScene, quadCamera);
      if (pass === SsaoPassType.Ssao) {
        return;
      }
    }

    {
      // SSAO final pass
      renderer.setRenderTarget(ssaoFinalTarget);
      if (pass === SsaoPassType.SsaoFinal) {
        renderer.setRenderTarget(null);
      }
      renderer.render(ssaoFinalScene, quadCamera);
      if (pass === SsaoPassType.SsaoFinal) {
        return;
      }
    }

    {
      // FXAA pass
      renderer.setRenderTarget(null);
      renderer.render(antiAliasScene, quadCamera);
    }
  };

  return {
    render,
    uniforms: ssaoUniforms
  };
}

export class SsaoEffect {
  private readonly _ssaoPass: Pass;

  constructor() {
    this._ssaoPass = createSsaoPass();
  }

  get kernelRadius() {
    return this._ssaoPass.uniforms.kernelRadius.value;
  }

  set kernelRadius(value: number) {
    this._ssaoPass.uniforms.kernelRadius.value = value;
  }

  get minDistance() {
    return this._ssaoPass.uniforms.minDistance.value;
  }

  set minDistance(value: number) {
    this._ssaoPass.uniforms.minDistance.value = value;
  }

  get maxDistance() {
    return this._ssaoPass.uniforms.maxDistance.value;
  }

  set maxDistance(value: number) {
    this._ssaoPass.uniforms.maxDistance.value = value;
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, pass?: SsaoPassType) {
    this._ssaoPass.render(renderer, scene, camera, pass);
  }
}
