/*!
 * Copyright 2023 Cognite AS
 */

import image360IconVert from './image360Icon.vert';
import image360IconFrag from './image360Icon.frag';

import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  GLSL3,
  Points,
  RawShaderMaterial,
  Vector2,
  Vector3
} from 'three';
import glsl from 'glslify';
import { AttributeDataAccessor, SceneHandler } from '@reveal/utilities';
import { Image360Icon } from '../Image360Icon';

export class Image360CollectionIcons {
  private readonly _sceneHandler: SceneHandler;
  private readonly _geometry: BufferGeometry;
  private readonly _material: RawShaderMaterial;
  private readonly _points: Points;

  constructor(sceneHandler: SceneHandler) {
    const geometry = new BufferGeometry();
    const material = this.initializeIconsMaterial();
    const points = this.initializePoints(geometry, material);

    this._geometry = geometry;
    this._material = material;
    this._points = points;
    this._sceneHandler = sceneHandler;
  }

  public initializeImage360Icons(positions: Vector3[]): Image360Icon[] {
    const alphaBuffer = new Uint8ClampedArray(positions.map(_ => 255));
    this._geometry.setFromPoints(positions);

    const alphaAttribute = new BufferAttribute(alphaBuffer, 1, true);
    this._geometry.setAttribute('alpha', alphaAttribute);

    this._sceneHandler.addCustomObject(this._points);

    return positions.map((position, index) => {
      const instanceAlphaView = new Uint8ClampedArray(alphaBuffer.buffer, index, 1);
      const alphaAttributeAccessor = new AttributeDataAccessor(instanceAlphaView, alphaAttribute);
      return new Image360Icon(position, this._sceneHandler, alphaAttributeAccessor);
    });
  }

  public dispose(): void {
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
        renderDownScale: { value: 1 }
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
    points.onBeforeRender = renderer => {
      renderer.getSize(material.uniforms.renderSize.value);
      material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
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
}
