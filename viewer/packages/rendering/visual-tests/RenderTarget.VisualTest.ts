/*!
 * Copyright 2022 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import {
  BufferAttribute,
  BufferGeometry,
  DepthFormat,
  DepthTexture,
  GLSL3,
  Mesh,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  UnsignedIntType,
  WebGLRenderTarget
} from 'three';

import type { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { DefaultRenderPipelineProvider } from '../src/render-pipeline-providers/DefaultRenderPipelineProvider';
import { defaultRenderOptions } from '../src/rendering/types';

export default class RenderTargetVisualTest extends StreamingVisualTestFixture {
  private readonly _orthographicCamera: OrthographicCamera;
  private readonly _testScene: Scene;
  private _glRenderer!: WebGLRenderer;

  constructor() {
    super();
    this._orthographicCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._testScene = new Scene();
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cadMaterialManager, pcMaterialManager, sceneHandler, renderer } = testFixtureComponents;

    this._glRenderer = renderer;

    const renderTarget = new WebGLRenderTarget(300, 300);
    renderTarget.depthTexture = new DepthTexture(300, 300);
    renderTarget.depthTexture.format = DepthFormat;
    renderTarget.depthTexture.type = UnsignedIntType;

    this.pipelineProvider = new DefaultRenderPipelineProvider(
      cadMaterialManager,
      pcMaterialManager,
      sceneHandler,
      defaultRenderOptions,
      {
        target: renderTarget,
        autoSize: true
      }
    );

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

    const geometry = new BufferGeometry();
    const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));

    const shaderMaterial = new RawShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        tDepth: { value: renderTarget.depthTexture }
      },
      glslVersion: GLSL3,
      depthTest: true
    });

    const mesh = new Mesh(geometry, shaderMaterial);
    this._testScene.add(mesh);

    return Promise.resolve();
  }

  public render(): void {
    super.render();
    if (this._glRenderer) {
      this._glRenderer.setRenderTarget(null);
      this._glRenderer.render(this._testScene, this._orthographicCamera);
    }
  }
}
