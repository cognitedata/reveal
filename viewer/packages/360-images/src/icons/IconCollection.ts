/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Frustum, Matrix4, Texture, Vector3 } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360Icon } from './Image360Icon';
import { InstancedIconSprite } from './InstancedIconSprite';
import { IconOctree } from './IconOctree';

export enum IconVisualizationMode {
  Clustered,
  Proximity,
  FromCamera
}

export class IconCollection {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _sceneHandler: SceneHandler;
  private readonly _hoverIconTexture: CanvasTexture;
  private readonly _sharedTexture: Texture;
  private readonly _icons: Image360Icon[];
  private readonly _iconsSprite: InstancedIconSprite;
  private readonly _computeClustersEventHandler: BeforeSceneRenderedDelegate;
  private readonly _computeProximityPointsEventHandler: BeforeSceneRenderedDelegate;
  private readonly _computePointsInCameraViewEventHandler: BeforeSceneRenderedDelegate;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private _activeIconVisualizationEventHandeler: BeforeSceneRenderedDelegate;
  private _iconVisualizationMode: IconVisualizationMode;

  get icons(): Image360Icon[] {
    return this._icons;
  }

  public setVisualizationMode(mode: IconVisualizationMode): void {
    if (this._iconVisualizationMode !== mode) {
      this._iconVisualizationMode = mode;
      this._onBeforeSceneRenderedEvent.unsubscribe(this._activeIconVisualizationEventHandeler);

      switch (this._iconVisualizationMode) {
        case IconVisualizationMode.Clustered: {
          this._activeIconVisualizationEventHandeler = this._computeClustersEventHandler;
          break;
        }
        case IconVisualizationMode.Proximity: {
          this._activeIconVisualizationEventHandeler = this._computeProximityPointsEventHandler;
          break;
        }
        case IconVisualizationMode.FromCamera: {
          this._activeIconVisualizationEventHandeler = this._computePointsInCameraViewEventHandler;
          break;
        }
        default: {
          //error?
          break;
        }
      }

      this._onBeforeSceneRenderedEvent.subscribe(this._activeIconVisualizationEventHandeler);
    }
  }

  constructor(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ) {
    const sharedTexture = this.createOuterRingsTexture();
    const iconSpriteRadius = 0.5;
    const iconsSprites = new InstancedIconSprite(
      points.length * 2,
      sharedTexture,
      this.MIN_PIXEL_SIZE,
      this.MAX_PIXEL_SIZE,
      iconSpriteRadius
    );
    iconsSprites.setPoints(points);

    this._hoverIconTexture = this.createHoverIconTexture();
    this._sharedTexture = sharedTexture;
    this._icons = this.initializeImage360Icons(points, sceneHandler, onBeforeSceneRendered);

    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    const octree = new IconOctree(this._icons, octreeBounds, 2);

    this._computeClustersEventHandler = this.computeClusters(octree, iconsSprites);
    this._computeProximityPointsEventHandler = this.computeProximityPoints(octree, iconsSprites);
    this._computePointsInCameraViewEventHandler = this.computePointsInCameraView(iconsSprites);

    onBeforeSceneRendered.subscribe(this._computeClustersEventHandler);

    this._sceneHandler = sceneHandler;
    this._iconsSprite = iconsSprites;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    sceneHandler.addCustomObject(iconsSprites);
  }

  private computeClusters(octree: IconOctree, iconSprites: InstancedIconSprite): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    const frustum = new Frustum();
    const screenSpaceAreaThreshold = 0.04;
    const minimumLevel = 3;
    return ({ camera }) => {
      projection.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse);
      const nodesLOD = octree.getLODByScreenArea(screenSpaceAreaThreshold, projection, minimumLevel);

      frustum.setFromProjectionMatrix(projection);

      const nodes = [...nodesLOD];

      const selectedIcons = nodes
        .flatMap(node => {
          if (node.data === null) {
            return octree.getNodeMedianIcon(node)!;
          }

          return node.data.data;
        })
        .filter(point => frustum.containsPoint(point.position));

      this._icons.forEach(icon => (icon.visible = false));
      selectedIcons.forEach(icon => (icon.visible = true));
      iconSprites.setPoints(selectedIcons.map(icon => icon.position));
    };
  }

  private computeProximityPoints(octree: IconOctree, iconSprites: InstancedIconSprite): BeforeSceneRenderedDelegate {
    const radius = 20;
    return ({ camera }) => {
      const points = octree.findPoints(camera.position, radius);

      this._icons.forEach(p => (p.visible = false));
      points.forEach(p => (p.data.visible = true));
      iconSprites.setPoints(points.map(p => p.data.position));
    };
  }

  private computePointsInCameraView(iconSprites: InstancedIconSprite): BeforeSceneRenderedDelegate {
    const closestPointLimit = 20;
    const frustum = new Frustum();
    return ({ camera }) => {
      const startTime = performance.now();
      const matrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);

      const visiblePoints = this._icons
        .reduce((result, icon) => {
          if (frustum.containsPoint(icon.position)) {
            result.push(icon);
          }
          return result;
        }, new Array<Image360Icon>())
        .sort((a, b) => {
          return a.position.distanceTo(camera.position) - b.position.distanceTo(camera.position);
        })
        .slice(0, closestPointLimit);

      this._icons.forEach(p => (p.visible = false));
      visiblePoints.forEach(p => (p.visible = true));
      iconSprites.setPoints(visiblePoints.map(p => p.position));

      const endTime = performance.now();
      console.warn('Time: ' + (endTime - startTime));
    };
  }

  private initializeImage360Icons(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ): Image360Icon[] {
    return points.map(
      point =>
        new Image360Icon(
          point,
          this._hoverIconTexture,
          sceneHandler,
          this.MIN_PIXEL_SIZE,
          this.MAX_PIXEL_SIZE,
          onBeforeSceneRendered
        )
    );
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._activeIconVisualizationEventHandeler);
    this._sceneHandler.removeCustomObject(this._iconsSprite);
    this._iconsSprite.dispose();
    this._sharedTexture.dispose();
  }

  private createOuterRingsTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const halfTextureSize = textureSize * 0.5;

    const context = canvas.getContext('2d')!;
    drawInnerCircle();
    drawOuterCircle();

    return new CanvasTexture(canvas);

    function drawOuterCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 16;
      context.strokeStyle = '#FFFFFF';
      context.arc(halfTextureSize, halfTextureSize, halfTextureSize - context.lineWidth / 2 - 2, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawInnerCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 8;
      context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      context.arc(halfTextureSize, halfTextureSize, halfTextureSize - context.lineWidth, 0, 2 * Math.PI);
      context.shadowColor = 'red';
      context.stroke();
    }
  }

  private createHoverIconTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const halfTextureSize = textureSize * 0.5;

    const context = canvas.getContext('2d')!;
    drawHoverSelector();

    return new CanvasTexture(canvas);

    function drawHoverSelector() {
      const outerCircleLineWidth = textureSize / 16;
      const innerCircleLineWidth = textureSize / 8;
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(
        halfTextureSize,
        halfTextureSize,
        halfTextureSize - outerCircleLineWidth - 2 * innerCircleLineWidth,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }
}
