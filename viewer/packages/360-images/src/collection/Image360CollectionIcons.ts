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
  DepthModes,
  GLSL3,
  GreaterDepth,
  LessEqualDepth,
  Matrix4,
  Points,
  RawShaderMaterial,
  ShaderMaterial,
  Texture,
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
  private readonly _backMaterial: ShaderMaterial;
  private readonly _frontMaterial: ShaderMaterial;
  private readonly _frontPoints: Points;
  private readonly _backPoints: Points;
  private readonly _hoverIconTexture: CanvasTexture;
  private readonly _onRenderTrigger: EventTrigger<(renderer: WebGLRenderer, camera: Camera) => void>;
  private readonly _sharedTexture: Texture;

  constructor(sceneHandler: SceneHandler) {
    const geometry = new BufferGeometry();
    const [sharedRingTexture, frontMaterial, backMaterial] = this.initializeIconsMaterials();
    const [frontPoints, backPoints] = this.initializePoints(geometry, frontMaterial, backMaterial);
    const hoverIconTexture = this.createHoverIconTexture();

    this._onRenderTrigger = new EventTrigger();
    this._geometry = geometry;
    this._frontMaterial = frontMaterial;
    this._backMaterial = backMaterial;
    this._frontPoints = frontPoints;
    this._backPoints = backPoints;
    this._sharedTexture = sharedRingTexture;
    this._sceneHandler = sceneHandler;
    this._hoverIconTexture = hoverIconTexture;
  }

  public initializeImage360Icons(transforms: Matrix4[]): Image360Icon[] {
    const positions = transforms.map(transform => new Vector3().setFromMatrixPosition(transform));
    const alphaBuffer = new Uint8ClampedArray(positions.map(_ => 255));
    this._geometry.setFromPoints(positions);

    const alphaAttribute = new BufferAttribute(alphaBuffer, 1, true);
    this._geometry.setAttribute('alpha', alphaAttribute);

    this._sceneHandler.addCustomObject(this._frontPoints);
    this._sceneHandler.addCustomObject(this._backPoints);

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
    this._sceneHandler.removeCustomObject(this._frontPoints);
    this._geometry.dispose();
    this._sharedTexture.dispose();
    this._backMaterial.dispose();
    this._frontMaterial.dispose();
  }

  private initializeIconsMaterials(): [Texture, ShaderMaterial, ShaderMaterial] {
    const ringTexture = this.createOuterRingsTexture();
    const frontMaterial = this.createIconsMaterial(ringTexture, 1, LessEqualDepth);
    const backMaterial = this.createIconsMaterial(ringTexture, 0.5, GreaterDepth);
    return [ringTexture, frontMaterial, backMaterial];
  }

  private createIconsMaterial(
    texture: Texture,
    collectionOpacity: number,
    depthFunction: DepthModes
  ): RawShaderMaterial {
    return new RawShaderMaterial({
      uniforms: {
        map: { value: texture },
        colorTint: { value: new Color(1, 1, 1) },
        renderSize: { value: new Vector2(1, 1) },
        collectionOpacity: { value: collectionOpacity },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(this.MIN_PIXEL_SIZE, this.MAX_PIXEL_SIZE) }
      },
      vertexShader: glsl(image360IconVert),
      fragmentShader: glsl(image360IconFrag),
      depthTest: true,
      depthWrite: false,
      depthFunc: depthFunction,
      glslVersion: GLSL3,
      transparent: true
    });
  }

  private initializePoints(
    geometry: BufferGeometry,
    frontMaterial: ShaderMaterial,
    backMaterial: ShaderMaterial
  ): [Points, Points] {
    const frontPoints = new Points(geometry, frontMaterial);
    frontPoints.renderOrder = 4;
    frontPoints.onBeforeRender = (renderer, _, camera) => {
      renderer.getSize(frontMaterial.uniforms.renderSize.value);
      frontMaterial.uniforms.renderDownScale.value =
        frontMaterial.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
      this._onRenderTrigger.fire(renderer, camera);
    };

    const backPoints = new Points(geometry, backMaterial);
    backPoints.renderOrder = 4;
    backPoints.onBeforeRender = (renderer, _, camera) => {
      renderer.getSize(backMaterial.uniforms.renderSize.value);
      backMaterial.uniforms.renderDownScale.value =
        backMaterial.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
      this._onRenderTrigger.fire(renderer, camera);
    };

    return [frontPoints, backPoints];
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
