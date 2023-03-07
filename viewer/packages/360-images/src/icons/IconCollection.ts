/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Frustum, Matrix4, Texture, Vector3 } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360Icon } from './Image360Icon';
import { InstancedIconSprite } from './InstancedIconSprite';
import { IconOctree } from './IconOctree';

export enum IconCullingStrategy {
  Clustered,
  Proximity
}

export class IconCollection {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 256;
  private readonly _sceneHandler: SceneHandler;
  private readonly _hoverIconTexture: CanvasTexture;
  private readonly _sharedTexture: Texture;
  private readonly _icons: Image360Icon[];
  private readonly _iconsSprite: InstancedIconSprite;
  private readonly _computeClustersEventHandler: BeforeSceneRenderedDelegate;
  private readonly _computeProximityPointsEventHandler: BeforeSceneRenderedDelegate;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private _activeIconVisualizationEventHandeler: BeforeSceneRenderedDelegate;
  private _iconCullingStrategy: IconCullingStrategy;
  private _proximityRadius = 30;
  private _proximityLimit = 20;

  get icons(): Image360Icon[] {
    return this._icons;
  }

  public setCullingStrategy(mode: IconCullingStrategy): void {
    if (this._iconCullingStrategy !== mode) {
      this._iconCullingStrategy = mode;
      this._onBeforeSceneRenderedEvent.unsubscribe(this._activeIconVisualizationEventHandeler);

      switch (this._iconCullingStrategy) {
        case IconCullingStrategy.Clustered: {
          this._activeIconVisualizationEventHandeler = this._computeClustersEventHandler;
          break;
        }
        case IconCullingStrategy.Proximity: {
          this._activeIconVisualizationEventHandeler = this._computeProximityPointsEventHandler;
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

  public set360ProximityLimits(radius: number, limit: number): void {
    this._proximityRadius = radius;
    this._proximityLimit = limit;
  }

  constructor(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ) {
    const sharedTexture = this.createOuterRingsTexture();
    const iconSpriteRadius = 0.5;
    const iconsSprites = new InstancedIconSprite(
      points.length,
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

    this._computeClustersEventHandler = this.setIconClustersByLOD(octree, iconsSprites);
    this._computeProximityPointsEventHandler = this.computeProximityPoints(octree, iconsSprites);

    this._iconCullingStrategy = IconCullingStrategy.Clustered;
    this._activeIconVisualizationEventHandeler = this._computeClustersEventHandler;

    onBeforeSceneRendered.subscribe(this._computeClustersEventHandler);

    this._sceneHandler = sceneHandler;
    this._iconsSprite = iconsSprites;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    sceneHandler.addCustomObject(iconsSprites);
  }

  private setIconClustersByLOD(octree: IconOctree, iconSprites: InstancedIconSprite): BeforeSceneRenderedDelegate {
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
            return octree.getNodeIcon(node)!;
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
    return ({ camera }) => {
      const points = octree
        .findPoints(camera.position, this._proximityRadius)
        .sort((a, b) => {
          return a.data.position.distanceTo(camera.position) - b.data.position.distanceTo(camera.position);
        })
        .slice(0, this._proximityLimit);

      this._icons.forEach(p => (p.visible = false));
      points.forEach(p => (p.data.visible = true));
      iconSprites.setPoints(points.reverse().map(p => p.data.position));
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
