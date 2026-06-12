/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import {
  CanvasTexture,
  CustomBlending,
  DoubleSide,
  GLSL3,
  Group,
  Mesh,
  OneMinusSrcAlphaFactor,
  PlaneGeometry,
  RawShaderMaterial,
  Raycaster,
  SrcAlphaFactor,
  Vector2,
  Vector3
} from 'three';
import { cloneDeep, merge } from 'lodash-es';

import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import type { AxisBoxConfig, AxisBoxFaceConfig, AbsolutePosition, RelativePosition } from './types';
import { defaultAxisBoxConfig } from './types';
import { MetricsLogger } from '@reveal/metrics';
import type { Cognite3DViewer } from '@reveal/api';

import vertexShader from './shaders/axisTool.vert';
import fragmentShader from './shaders/axisTool.frag';
import { moveCameraTo } from '../utilities/moveCameraTo';
import { Corner } from '../utilities/Corner';

export class AxisViewTool extends Cognite3DViewerToolBase {
  private readonly _layoutConfig: Required<AxisBoxConfig>;

  private readonly _boxFaceGeometry: PlaneGeometry;

  private readonly _viewer: Cognite3DViewer;

  private readonly _axisGroup: Group;

  private readonly _interactiveObjects: Mesh[];
  private readonly _raycaster: Raycaster;

  private readonly _screenPosition: Vector2;

  private readonly _disposeClickDiv: () => void;

  private _dynamicUpdatePosition = () => {};
  private readonly _updateClickDiv = () => {};

  constructor(viewer: Cognite3DViewer, config?: AxisBoxConfig) {
    super();

    this._screenPosition = new Vector2();
    this._boxFaceGeometry = new PlaneGeometry(0.9, 0.9, 1, 1);

    this._raycaster = new Raycaster();
    this._raycaster.layers.enableAll();

    this._viewer = viewer;

    this._layoutConfig = merge(cloneDeep(defaultAxisBoxConfig), config);

    this._axisGroup = new Group();
    this._axisGroup.name = 'Axis View Tool';
    this._axisGroup.renderOrder = 1;
    this._interactiveObjects = this.createAxisCross(this._axisGroup);

    [this._updateClickDiv, this._disposeClickDiv] = this.createClickDiv(viewer);
    this.addAxisBoxToViewer(this._axisGroup, this._layoutConfig.position!);

    MetricsLogger.trackCreateTool('AxisViewTool');
  }

  public dispose(): void {
    super.dispose();
    this._viewer.removeObject3D(this._axisGroup);
    this._disposeClickDiv();
  }

  private createClickDiv(viewer: Cognite3DViewer) {
    const canvasElement = viewer.domElement.querySelector('canvas');
    if (canvasElement === null) {
      throw new Error('Could not find canvas');
    }
    const divElement = document.createElement('div');
    divElement.style.position = 'absolute';
    divElement.style.height = `${this._layoutConfig.size}px`;
    divElement.style.width = `${this._layoutConfig.size}px`;
    divElement.style.zIndex = '1';

    divElement.addEventListener('pointerdown', event => {
      event.stopPropagation();
    });

    divElement.addEventListener('contextmenu', event => event.preventDefault());

    divElement.addEventListener('pointerup', event => {
      const rect = viewer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.handleClick(x, y, rect);
      event.stopPropagation();
    });

    viewer.domElement.appendChild(divElement);

    return [
      () => {
        divElement.style.left = `${this._screenPosition.x}px`;
        divElement.style.bottom = `${this._screenPosition.y}px`;
      },
      () => {
        viewer.domElement.removeChild(divElement);
      }
    ];
  }

  private addAxisBoxToViewer(axisGroup: Group, position: AbsolutePosition | RelativePosition) {
    const size = this._layoutConfig.size;

    if (isAbsolute(position)) {
      this._screenPosition.x = position.xAbsolute;
      this._screenPosition.y = position.yAbsolute;
    } else {
      switch (position.corner) {
        case Corner.BottomRight:
          this._screenPosition.y = position.padding.y;

          this._dynamicUpdatePosition = () => {
            this._screenPosition.x = this._viewer.canvas.clientWidth - position.padding.x - size;
          };
          break;

        case Corner.TopRight:
          this._dynamicUpdatePosition = () => {
            this._screenPosition.x = this._viewer.canvas.clientWidth - position.padding.x - size;
            this._screenPosition.y = this._viewer.canvas.clientHeight - position.padding.y - size;
          };
          break;

        case Corner.TopLeft:
          this._screenPosition.x = position.padding.x;
          this._dynamicUpdatePosition = () => {
            this._screenPosition.y = this._viewer.canvas.clientHeight - position.padding.y - size;
          };
          break;

        case Corner.BottomLeft:
          this._screenPosition.x = position.padding.x;
          this._screenPosition.y = position.padding.y;
          break;
        default:
          throw new Error(`Unknown corner position for Axis Cross: Corner = ${position.corner}`);
      }
      this._dynamicUpdatePosition();
    }

    this._viewer.addObject3D(axisGroup);

    function isAbsolute(position: AbsolutePosition | RelativePosition): position is AbsolutePosition {
      return (
        (position as AbsolutePosition).xAbsolute !== undefined && (position as AbsolutePosition).yAbsolute !== undefined
      );
    }
  }

  private handleClick(xScreenPos: number, yScreenPos: number, boundingRect: DOMRect): boolean {
    const xNdc = (2 * (xScreenPos - this._screenPosition.x)) / this._layoutConfig.size - 1;
    const yNdc = (2 * (boundingRect.height - yScreenPos - this._screenPosition.y)) / this._layoutConfig.size - 1;
    const rayOrigin = new Vector3(xNdc, yNdc, 1);
    const rayDirection = new Vector3(0, 0, -1).normalize();
    this._raycaster.set(rayOrigin, rayDirection);

    const intersects = this._raycaster.intersectObjects(this._interactiveObjects);

    if (!(intersects.length > 0)) return false;

    const targetAxis = intersects[0].object.position.clone().normalize();
    const targetUp = (intersects[0].object.userData.upVector as Vector3).clone();

    moveCameraTo(this._viewer.cameraManager, targetAxis, targetUp, this._layoutConfig.animationSpeed);
    return true;
  }

  private createAxisCross(axisGroup: Group) {
    const compass = this.createCompass();
    axisGroup.add(compass);

    const interactiveObjects = this.createBoxFaces();
    axisGroup.add(...interactiveObjects);

    this.setupTransformOnRender(axisGroup);

    return interactiveObjects;
  }

  private setupTransformOnRender(axisGroup: Group) {
    axisGroup.children[0].onBeforeRender = (renderer: WebGLRenderer) => {
      this._dynamicUpdatePosition();
      axisGroup.quaternion.copy(this._viewer.cameraManager.getCamera().quaternion).invert();
      axisGroup.updateMatrixWorld();
      this._updateClickDiv();

      const cWidth = renderer.domElement.clientWidth;
      const cHeight = renderer.domElement.clientHeight;

      const renderSize = new Vector2();
      renderer.getSize(renderSize);

      const size = this._layoutConfig.size;

      const scale = new Vector2(size / cWidth, size / cHeight);
      const offset = new Vector2(
        (this._screenPosition.x / cWidth) * 2 + size / cWidth,
        (this._screenPosition.y / cHeight) * 2 + size / cHeight
      );

      axisGroup.traverse(node => {
        if (node instanceof Mesh) {
          (node.material as RawShaderMaterial).uniforms.offset.value = offset;
          (node.material as RawShaderMaterial).uniforms.scale.value = scale;
          (node.material as RawShaderMaterial).uniformsNeedUpdate = true;
        }
      });
    };
  }

  private createBoxFaces() {
    const facesConfig = this._layoutConfig.faces;

    const posXFace = this.createBoxFace(new Vector3(1, 0, 0), facesConfig.xPositiveFace!);
    const negXFace = this.createBoxFace(new Vector3(-1, 0, 0), facesConfig.xNegativeFace!);

    const posYFace = this.createBoxFace(new Vector3(0, 1, 0), facesConfig.yPositiveFace!, new Vector3(0, 0, -1));
    const negYFace = this.createBoxFace(new Vector3(0, -1, 0), facesConfig.yNegativeFace!, new Vector3(0, 0, 1));

    const posZFace = this.createBoxFace(new Vector3(0, 0, 1), facesConfig.zPositiveFace!);
    const negZFace = this.createBoxFace(new Vector3(0, 0, -1), facesConfig.zNegativeFace!);

    return [posXFace, negXFace, posYFace, negYFace, posZFace, negZFace];
  }

  private createCompass() {
    const compassPlaneGeometry = new PlaneGeometry(2, 2, 1, 1);
    const compass = new Mesh(
      compassPlaneGeometry,
      new RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          offset: { value: new Vector2() },
          scale: { value: new Vector2() },
          tex: { value: this.createCompassTexture() }
        },
        side: DoubleSide,
        glslVersion: GLSL3,
        depthTest: false,
        blending: CustomBlending,
        blendDst: OneMinusSrcAlphaFactor,
        blendSrc: SrcAlphaFactor
      })
    );

    compass.frustumCulled = false;
    compass.renderOrder = 1;

    const x = Math.sin(this._layoutConfig.compass.labelDelta!);
    const z = Math.cos(this._layoutConfig.compass.labelDelta!);

    compass.position.y = -0.45;
    compass.up.copy(new Vector3(x, 0, z));
    compass.lookAt(0, 0, 0);

    return compass;
  }

  private createCompassTexture() {
    const compassLayout = this._layoutConfig.compass;
    const textureSize = this._layoutConfig.size;

    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d')!;

    const halfSize = textureSize / 2;
    const radius = halfSize - halfSize / 4;

    const tickWidth = textureSize / 32;
    const tickSpace = textureSize / 8;

    context.strokeStyle = compassLayout.tickColor!.getStyle();
    context.lineWidth = textureSize / 16;
    context.setLineDash([tickWidth, tickSpace]);
    context.beginPath();
    context.arc(halfSize, halfSize, radius, 0, 2 * Math.PI);
    context.stroke();

    if (compassLayout.ringLabel && compassLayout.ringLabel.length > 0) {
      const fontSize = compassLayout.fontSize ?? textureSize / 5;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = compassLayout.fontColor!.getStyle();
      context.fillText(compassLayout.ringLabel, halfSize, halfSize * (1 / 4) + fontSize / 3);
    }
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.anisotropy = 8;
    return canvasTexture;
  }

  private getFaceTexture(faceConfig: AxisBoxFaceConfig, size: number) {
    const textureSize = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    context.fillStyle = faceConfig.outlineColor!.getStyle();
    context.fillRect(0, 0, textureSize, textureSize);
    context.fillStyle = faceConfig.faceColor!.getStyle();

    const outlineSize = faceConfig.outlineSize ?? textureSize / 32;
    context.fillRect(outlineSize, outlineSize, textureSize - outlineSize * 2, textureSize - outlineSize * 2);
    context.fill();

    if (faceConfig.label !== '') {
      const fontSize = faceConfig.fontSize ?? textureSize / 3;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = faceConfig.fontColor!.getStyle();
      context.fillText(faceConfig.label!, textureSize / 2, textureSize / 2 + fontSize / 3);
    }
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.anisotropy = 8;
    return canvasTexture;
  }

  private createBoxFace(position: Vector3, faceConfig: AxisBoxFaceConfig, upVector = new Vector3(0, 1, 0)) {
    const face = new Mesh(
      this._boxFaceGeometry,
      new RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          offset: { value: new Vector2() },
          scale: { value: new Vector2() },
          tex: { value: this.getFaceTexture(faceConfig, this._layoutConfig.size) }
        },
        depthTest: false,
        glslVersion: GLSL3,
        // Even if this isn't transparent, we want ThreeJS to draw the object
        // after transparent objects so its correctly blended
        transparent: true
      })
    );

    face.frustumCulled = false;
    face.renderOrder = 1000; // Draw last (i.e. on top)

    face.position.copy(position.multiplyScalar(0.5 * this._boxFaceGeometry.parameters.width));
    face.lookAt(position.multiplyScalar(2));

    face.userData.upVector = upVector;

    return face;
  }
}
