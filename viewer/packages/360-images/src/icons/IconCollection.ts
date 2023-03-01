/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Matrix4, Texture, Vector3 } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360Icon } from './Image360Icon';
import { InstancedIconSprite } from './InstancedIconSprite';
import { IconOctree } from './IconOctree';

export class IconCollection {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _sceneHandler: SceneHandler;
  private readonly _hoverIconTexture: CanvasTexture;
  private readonly _sharedTexture: Texture;
  private readonly _icons: Image360Icon[];
  private readonly _iconsSprite: InstancedIconSprite;
  private readonly _clusterSprites: InstancedIconSprite;
  private readonly _computeClustersEventHandler: BeforeSceneRenderedDelegate;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;

  get icons(): Image360Icon[] {
    return this._icons;
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
    const octree = new IconOctree(this._icons, octreeBounds, 4);

    const clusterSpriteRadius = 2.0;
    const clusterSprites = new InstancedIconSprite(
      points.length,
      this.createClusterTexture(),
      this.MIN_PIXEL_SIZE * 2,
      this.MAX_PIXEL_SIZE,
      clusterSpriteRadius
    );

    this._computeClustersEventHandler = this.computeClusters(octree, iconsSprites, clusterSprites);
    onBeforeSceneRendered.subscribe(this._computeClustersEventHandler);

    this._sceneHandler = sceneHandler;
    this._iconsSprite = iconsSprites;
    this._clusterSprites = clusterSprites;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    sceneHandler.addCustomObject(iconsSprites);
    sceneHandler.addCustomObject(clusterSprites);
  }

  private computeClusters(
    octree: IconOctree,
    iconSprites: InstancedIconSprite,
    clusterSprites: InstancedIconSprite
  ): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    return ({ camera }) => {
      const nodesLOD = octree.getLODByScreenArea(
        0.005,
        projection.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
      );

      const nodes = [...nodesLOD];
      const clusterPoints = nodes.filter(p => p.data === null).map(p => octree.getPointCenterOfNode(p)!);
      clusterSprites.setPoints(clusterPoints);
      const leafData = nodes.filter(p => p.data !== null).flatMap(p => p.data.data);
      this._icons.forEach(p => (p.visible = false));
      leafData.forEach(p => (p.visible = true));
      iconSprites.setPoints(leafData.map(p => p.position));
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
    this._onBeforeSceneRenderedEvent.unsubscribe(this._computeClustersEventHandler);
    this._sceneHandler.removeCustomObject(this._clusterSprites);
    this._sceneHandler.removeCustomObject(this._iconsSprite);
    this._clusterSprites.dispose();
    this._iconsSprite.dispose();
    this._sharedTexture.dispose();
  }

  private createClusterTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const lineWidth = textureSize / 22;
    const halfTextureSize = textureSize * 0.5;

    const context = canvas.getContext('2d')!;
    drawClusterRings();
    drawInnerCircle();
    drawOuterCircle();

    return new CanvasTexture(canvas);

    function drawClusterRings() {
      context.beginPath();
      context.lineWidth = lineWidth;
      context.strokeStyle = '#FFFFFF';
      context.arc(halfTextureSize, halfTextureSize, (halfTextureSize * 36) / 44, 0, 2 * Math.PI);
      context.stroke();

      context.beginPath();
      context.lineWidth = lineWidth;
      context.strokeStyle = '#FFFFFF';
      context.arc(halfTextureSize, halfTextureSize, halfTextureSize - context.lineWidth / 2, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawOuterCircle() {
      context.beginPath();
      context.lineWidth = lineWidth;
      context.strokeStyle = '#FFFFFF';
      context.arc(halfTextureSize, halfTextureSize, (halfTextureSize * 30) / 44, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawInnerCircle() {
      context.beginPath();
      context.lineWidth = lineWidth * 2;
      context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      context.arc(halfTextureSize, halfTextureSize, (halfTextureSize * 24) / 44, 0, 2 * Math.PI);
      context.shadowColor = 'red';
      context.stroke();
    }
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
