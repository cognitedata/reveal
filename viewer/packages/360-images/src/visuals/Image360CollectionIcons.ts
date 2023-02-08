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
  constructor(sceneHandler: SceneHandler) {
    this._sceneHandler = sceneHandler;
  }

  public getImage360Icons(positions: Vector3[]): Image360Icon[] {
    const alphaBuffer = new Uint8ClampedArray(positions.map(_ => 255));
    const geometry = new BufferGeometry();
    geometry.setFromPoints(positions);

    const alphaAttribute = new BufferAttribute(alphaBuffer, 1, true);
    geometry.setAttribute('alpha', alphaAttribute);

    const material = new RawShaderMaterial({
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

    const points = new Points(geometry, material);
    points.renderOrder = 4;
    this._sceneHandler.addCustomObject(points);

    points.onBeforeRender = renderer => {
      renderer.getSize(material.uniforms.renderSize.value);
      material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
    };

    return positions.map((position, index) => {
      const instanceAlphaView = new Uint8ClampedArray(alphaBuffer.buffer, index, 1);
      const alphaAttributeAccessor = new AttributeDataAccessor(instanceAlphaView, alphaAttribute);
      return new Image360Icon(position, this._sceneHandler, alphaAttributeAccessor);
    });
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
