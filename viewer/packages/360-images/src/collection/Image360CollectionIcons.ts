/*!
 * Copyright 2023 Cognite AS
 */

import image360IconVert from './image360Icon.vert';
import image360IconFrag from './image360Icon.frag';

import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  CanvasTexture,
  Color,
  GLSL3,
  Matrix4,
  Points,
  RawShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import glsl from 'glslify';
import { AttributeDataAccessor, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360Icon } from '../entity/Image360Icon';

export class Image360CollectionIcons {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _sceneHandler: SceneHandler;
  private readonly _geometry: BufferGeometry;
  private readonly _material: RawShaderMaterial;
  private readonly _points: Points;
  private readonly _hoverIconTexture: CanvasTexture;
  private readonly _onRenderTrigger: EventTrigger<(renderer: WebGLRenderer, camera: Camera) => void>;

  constructor(sceneHandler: SceneHandler) {
    const geometry = new BufferGeometry();
    const material = this.initializeIconsMaterial();
    const points = this.initializePoints(geometry, material);
    const hoverIconTexture = this.createHoverIconTexture();

    this._onRenderTrigger = new EventTrigger();
    this._geometry = geometry;
    this._material = material;
    this._points = points;
    this._sceneHandler = sceneHandler;
    this._hoverIconTexture = hoverIconTexture;
  }

  public initializeImage360Icons(transforms: Matrix4[]): Image360Icon[] {
    const positions = transforms.map(transform => new Vector3().setFromMatrixPosition(transform));
    const alphaBuffer = new Uint8ClampedArray(positions.map(_ => 255));
    this._geometry.setFromPoints(positions);

    const alphaAttribute = new BufferAttribute(alphaBuffer, 1, true);
    this._geometry.setAttribute('alpha', alphaAttribute);

    this._sceneHandler.addCustomObject(this._points);

    return positions.map((position, index) => {
      const instanceAlphaView = new Uint8ClampedArray(alphaBuffer.buffer, index, 1);
      const alphaAttributeAccessor = new AttributeDataAccessor(instanceAlphaView, alphaAttribute);
      return new Image360Icon(
        position,
        this._hoverIconTexture,
        this._sceneHandler,
        alphaAttributeAccessor,
        this.MIN_PIXEL_SIZE,
        this.MAX_PIXEL_SIZE,
        this._onRenderTrigger
      );
    });
  }

  public dispose(): void {
    this._onRenderTrigger.unsubscribeAll();
    this._sceneHandler.removeCustomObject(this._points);
    this._geometry.dispose();
    this._material.uniforms.map.value.dispose();
    this._material.dispose();
  }

  private initializeIconsMaterial(): RawShaderMaterial {
    return new RawShaderMaterial({
      uniforms: {
        map: { value: this.createOuterRingsTexture() },
        colorTint: { value: new Color(1, 1, 1) },
        renderSize: { value: new Vector2(1, 1) },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(this.MIN_PIXEL_SIZE, this.MAX_PIXEL_SIZE) }
      },
      vertexShader: glsl(image360IconVert),
      fragmentShader: glsl(image360IconFrag),
      depthTest: false,
      glslVersion: GLSL3,
      transparent: true
    });
  }

  private initializePoints(geometry: BufferGeometry, material: RawShaderMaterial): Points {
    const points = new Points(geometry, material);
    points.renderOrder = 4;
    points.onBeforeRender = (renderer, _, camera) => {
      renderer.getSize(material.uniforms.renderSize.value);
      material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
      this._onRenderTrigger.fire(renderer, camera);
    };
    return points;
  }

  private createOuterRingsTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = 256;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawInnerCircle();
    drawOuterCircle();

    return new CanvasTexture(canvas);

    function drawOuterCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 16;
      context.strokeStyle = '#FFFFFF';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth / 2 - 2, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawInnerCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 8;
      context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
      context.shadowColor = 'red';
      context.stroke();
    }
  }

  private createHoverIconTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawHoverSelector();

    return new CanvasTexture(canvas);

    function drawHoverSelector() {
      const outerCircleLineWidth = textureSize / 16;
      const innerCircleLineWidth = textureSize / 8;
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(
        textureSize / 2,
        textureSize / 2,
        textureSize / 2 - outerCircleLineWidth - 2 * innerCircleLineWidth,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }
}
