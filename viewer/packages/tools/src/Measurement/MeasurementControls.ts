/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { InputHandler } from '@reveal/utilities';
import * as THREE from 'three';
const MAX_POINTS: number = 2;

export class MeasurementControls {
  private readonly _domElement: HTMLElement;
  private readonly _viewer: Cognite3DViewer;
  private readonly _inputHandler: InputHandler;
  private isDragging: boolean;
  private measurementLine: THREE.Line | undefined;
  private position: Float32Array;
  private label: THREE.Sprite;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._domElement = viewer.domElement;
    this._inputHandler = viewer.inputHandler;
    this.isDragging = false;
    this.position = new Float32Array(MAX_POINTS * 3); // 3 vertices per point

    this.setupInputHandling();
  }

  private setupInputHandling() {
    this._inputHandler.on('click', this._handleonPointerClick);
  }

  private removeInputHandling() {
    this._domElement.removeEventListener('click', this._handleonPointerClick);
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionFromPixel(pointer.x, pointer.y);

    if (intersection) {
      const mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.01),
        new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true })
      );
      mesh.position.copy(intersection.point);

      this._viewer.addObject3D(mesh);
      this.isDragging = !this.isDragging;

      if (this.measurementLine === undefined) {
        this.position[0] = this.position[3] = intersection.point.x;
        this.position[1] = this.position[4] = intersection.point.y;
        this.position[2] = this.position[5] = intersection.point.z;

        this._domElement.addEventListener('mousemove', this._handleonPointerMove);
      } else {
        this.position[3] = intersection.point.x;
        this.position[4] = intersection.point.y;
        this.position[5] = intersection.point.z;

        this.measurementLine.geometry.setDrawRange(0, 2);
        this.measurementLine.geometry.attributes.position.needsUpdate = true;
        this.updateDistanceUI(
          new THREE.Vector3(this.position[0], this.position[1], this.position[2]),
          new THREE.Vector3(this.position[3], this.position[4], this.position[5])
        );

        this._viewer.requestRedraw();
        this.measurementLine = undefined;
        this._domElement.removeEventListener('mousemove', this._handleonPointerMove);
      }
    }
  }

  private getOverlayTexture(distance: string, size: number) {
    const borderSize = 24;
    const baseWidth = 64;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = `${64}px bold sans-serif`;
    ctx.font = font;

    const textWidth = ctx.measureText(distance).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize + 10;
    const height = size + doubleBorderSize - 5;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1.0, width / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(distance, 0, 0);

    const texture = new THREE.CanvasTexture(ctx.canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  private async onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    if (this.isDragging) {
      const intersection = await this._viewer.getIntersectionPixelFromBuffer(pointer.x, pointer.y);

      if (intersection) {
        this.position[3] = intersection.x + 0.0001;
        this.position[4] = intersection.y + 0.0001;
        this.position[5] = intersection.z + 0.0001;

        if (this.measurementLine === undefined) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
          geometry.setDrawRange(0, 2);

          const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 100 });

          this.measurementLine = new THREE.Line(geometry, material);
          this.measurementLine.geometry.setDrawRange(0, 2);
          this.measurementLine.geometry.attributes.position.needsUpdate = true;

          const texture = this.getOverlayTexture('0 m', 96);
          const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
          this.label = new THREE.Sprite(labelMaterial);
          this.label.scale.set(0.3, 0.2, 1);
          const labelPosition = new THREE.Vector3(
            (this.position[0] + this.position[3]) / 2,
            (this.position[1] + this.position[4]) / 2,
            (this.position[2] + this.position[5]) / 2
          );
          this.label.position.set(labelPosition.x, labelPosition.y + 0.125, labelPosition.z);

          this._viewer.addObject3D(this.label);
          this._viewer.addObject3D(this.measurementLine);
          this._viewer.requestRedraw();
        } else {
          this.position[3] = intersection.x + 0.0001;
          this.position[4] = intersection.y + 0.0001;
          this.position[5] = intersection.z + 0.0001;
          this.measurementLine.geometry.setDrawRange(0, 2);
          this.measurementLine.geometry.attributes.position.needsUpdate = true;

          const startPoint = new THREE.Vector3(this.position[0], this.position[1], this.position[2]);
          const endPoint = new THREE.Vector3(this.position[3], this.position[4], this.position[5]);

          const distance = endPoint.distanceTo(startPoint);
          // if (this.initialDistance === 0) {
          //   this.initialDistance = distance;
          // }

          const distanceValue = distance.toFixed(3).toString() + ' m';
          const texture = this.getOverlayTexture(distanceValue, 64);
          this.label.material.map = texture;

          // let direction = endPoint.clone().sub(startPoint);
          // const length = direction.length();
          // direction = direction.normalize().multiplyScalar(length * 0.5);
          // const midPoint = startPoint.clone().add(direction);
          // const sp = new THREE.Vector3(this.position[0], this.position[1], this.position[2]);
          // const ep = new THREE.Vector3(this.position[3], this.position[4], this.position[5]);
          this.updateDistanceUI(startPoint, endPoint);
          // this.label.position.copy(midPoint);

          this._viewer.requestRedraw();
        }
      }
    }
  }

  private updateDistanceUI(startPosition: THREE.Vector3, endPosition: THREE.Vector3) {
    if (this.label != undefined) {
      const x = (endPosition.x - startPosition.x) * 0.5;
      const y = (endPosition.y - startPosition.y) * 0.5;
      const z = (endPosition.z - startPosition.z) * 0.5;
      startPosition.x = startPosition.x + x;
      startPosition.y = startPosition.y + y + 0.125;
      startPosition.z = startPosition.z + z;
      this.label.position.copy(startPosition);
    }
  }

  public dispose(): void {
    this.removeInputHandling();
  }
}
