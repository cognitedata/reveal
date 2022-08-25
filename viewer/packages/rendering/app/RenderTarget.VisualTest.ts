/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { DefaultRenderPipelineProvider } from '../src/render-pipeline-providers/DefaultRenderPipelineProvider';
import { defaultRenderOptions } from '../src/rendering/types';

// Sanity test for loading model
export default class CadClippingVisualTest extends StreamingVisualTestFixture {
  private readonly _orthographicCamera: THREE.OrthographicCamera;
  private readonly _testScene: THREE.Scene;
  private _glRenderer!: THREE.WebGLRenderer;

  constructor() {
    super();
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._testScene = new THREE.Scene();
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cadMaterialManager, sceneHandler, renderer } = testFixtureComponents;

    this._glRenderer = renderer;

    const renderTarget = new THREE.WebGLRenderTarget(300, 300);
    renderTarget.depthTexture = new THREE.DepthTexture(300, 300);
    renderTarget.depthTexture.format = THREE.DepthFormat;
    renderTarget.depthTexture.type = THREE.UnsignedIntType;

    this.pipelineProvider = new DefaultRenderPipelineProvider(cadMaterialManager, sceneHandler, defaultRenderOptions, {
      target: renderTarget,
      autoSize: true
    });

    const vShader = `
      uniform mat4 modelMatrix;

      in vec3 position;
      in vec2 uv;
      
      out vec2 vUv;
      
      const mat4 unitOrthographicProjection = mat4(1., 0., 0., 0., 0., 1., 0., 0., 0., 0., -1., 0., 0., 0., 0., 1.);
      
      void main() {
          vUv = uv;
          gl_Position = unitOrthographicProjection * modelMatrix * vec4(position, 1.0);
      }
    `;

    const fShader = `
      precision highp float;

      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;

      in vec2 vUv; 

      out vec4 color;

      void main() {
        if(vUv.x > 0.5){
          color = texture(tDiffuse, vUv);
        } else {
          float d = texture(tDepth, vUv).r;
          color = vec4(vec3(1.0 - pow(d, 20.0)), 1.0);
        }
      }
    `;

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const shaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        tDepth: { value: renderTarget.depthTexture }
      },
      glslVersion: THREE.GLSL3,
      depthTest: true
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    this._testScene.add(mesh);

    return Promise.resolve();
  }

  public render(): void {
    super.render();
    this._glRenderer.setRenderTarget(null);
    this._glRenderer.render(this._testScene, this._orthographicCamera);
  }
}
