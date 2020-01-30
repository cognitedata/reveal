/*!
 * Copyright 2020 Cognite AS
 */

import glsl from 'glslify';
import * as THREE from 'three';

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

function createSSAOScene(diffuseTexture: THREE.Texture, depthTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    tDepth: { value: depthTexture },
    size: { value: new THREE.Vector2() },
    cameraNear: { value: 0 }, // set during rendering
    cameraFar: { value: 0 }, // set during rendering
    radius: { value: 6 },
    onlyAO: { value: true },
    aoClamp: { value: 0.25 },
    lumInfluence: { value: 0.7 }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: passThroughVertexShader,
    fragmentShader: ssaoShader
  });
  return { scene, uniforms };
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

interface Pass {
  render: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;
  setSize: (width: number, height: number) => void;
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

  const { scene: ssaoScene, uniforms: ssaoUniforms } = createSSAOScene(modelTarget.texture, modelTarget.depthTexture);

  const { scene: ssaoFinalScene, uniforms: ssaoFinalUniforms } = createSSAOFinalScene(
    modelTarget.texture,
    ssaoTarget.texture
  );

  const { scene: antiAliasScene, uniforms: antiAliasUniforms } = createAntialiasScene(ssaoFinalTarget.texture);

  /////////

  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const setSize = (width: number, height: number) => {
    modelTarget.setSize(width, height);

    antiAliasUniforms.resolution.value.set(width, height);

    ssaoTarget.setSize(width, height);
    ssaoUniforms.size.value.set(width, height);

    ssaoFinalTarget.setSize(width, height);
    ssaoFinalUniforms.size.value.set(width, height);
  };

  const render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    renderer.setRenderTarget(modelTarget);
    renderer.render(scene, camera);

    ssaoUniforms.cameraNear.value = camera.near;
    ssaoUniforms.cameraFar.value = camera.far;
    renderer.setRenderTarget(ssaoTarget);
    renderer.render(ssaoScene, quadCamera);

    renderer.setRenderTarget(ssaoFinalTarget);
    renderer.render(ssaoFinalScene, quadCamera);

    renderer.setRenderTarget(null);
    renderer.render(antiAliasScene, quadCamera);
  };

  return {
    render,
    setSize
  };
}

export class SsaoRenderer extends THREE.WebGLRenderer {
  private _pass: Pass;

  constructor() {
    super();
    this._pass = createSsaoPass();
  }

  setSizeX(width: number, height: number, updateStyle?: boolean) {
    this.setSize(width, height, updateStyle);
    this._pass.setSize(width, height);
  }

  renderEffect(scene: THREE.Scene, camera: THREE.Camera) {
    if (camera.type !== 'PerspectiveCamera') {
      throw new Error('SsaoRenderer: Camera must be a THREE.PerspectiveCamera');
    }
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    this._pass.render(this, scene, perspectiveCamera);
  }
}
