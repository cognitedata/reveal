/*!
 * Copyright 2023 Cognite AS
 */

import image360IconVert from './image360Icon.vert';
import image360IconFrag from './image360Icon.frag';

import { BufferAttribute, BufferGeometry, CanvasTexture, GLSL3, Points, RawShaderMaterial, Vector3 } from 'three';
import glsl from 'glslify';
import { SceneHandler } from '@reveal/utilities';

export class Image360CollectionIcons {
  constructor(positions: Vector3[], sceneHandler: SceneHandler) {
    const vertexBuffer = new Float32Array(positions.length * 3);
    positions.forEach((position, index) => position.toArray(vertexBuffer, index * 3));
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(vertexBuffer, 3));

    const material = new RawShaderMaterial({
      uniforms: {
        map: { value: this.createOuterRingsTexture() }
      },
      vertexShader: glsl(image360IconVert),
      fragmentShader: glsl(image360IconFrag),
      depthTest: false,
      glslVersion: GLSL3,
      transparent: true
    });
    const points = new Points(geometry, material);
    sceneHandler.addCustomObject(points);
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
