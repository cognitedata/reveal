/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Frustum, Matrix4, Sprite, SpriteMaterial, Texture, Vector2, Vector3 } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { IconOctree, Overlay3DIcon, OverlayPointsObject } from '@reveal/3d-overlays';
import clamp from 'lodash/clamp';

export type IconCullingScheme = 'clustered' | 'proximity';

export type IconsOptions = {
  platformMaxPointsSize?: number;
};

export class IconCollection {
  private static readonly MinPixelSize = 16;
  private static readonly DefaultMaxPixelSize = 256;
  private readonly _maxPixelSize: number;
  private readonly _sceneHandler: SceneHandler;
  private readonly _sharedTexture: Texture;
  private readonly _hoverSprite: Sprite;
  private readonly _icons: Overlay3DIcon[];
  private readonly _pointsObject: OverlayPointsObject;
  private readonly _computeClustersEventHandler: BeforeSceneRenderedDelegate;
  private readonly _computeProximityPointsEventHandler: BeforeSceneRenderedDelegate;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private readonly _iconRadius = 0.3;

  private _activeCullingSchemeEventHandeler: BeforeSceneRenderedDelegate;
  private _iconCullingScheme: IconCullingScheme;
  private _proximityRadius = Infinity;
  private _proximityPointLimit = 50;

  get icons(): Overlay3DIcon[] {
    return this._icons;
  }

  set hoverSpriteVisibility(value: boolean) {
    this._hoverSprite.visible = value;
  }

  public setCullingScheme(scheme: IconCullingScheme): void {
    if (this._iconCullingScheme === scheme) return;

    this._iconCullingScheme = scheme;
    this._onBeforeSceneRenderedEvent.unsubscribe(this._activeCullingSchemeEventHandeler);

    switch (this._iconCullingScheme) {
      case 'clustered': {
        this._activeCullingSchemeEventHandeler = this._computeClustersEventHandler;
        break;
      }
      case 'proximity': {
        this._activeCullingSchemeEventHandeler = this._computeProximityPointsEventHandler;
        break;
      }
      default:
        break;
    }
    this._onBeforeSceneRenderedEvent.subscribe(this._activeCullingSchemeEventHandeler);
  }

  public set360IconCullingRestrictions(radius: number, pointLimit: number): void {
    this._proximityRadius = Math.max(0, radius);
    this._proximityPointLimit = clamp(pointLimit, 0, this.icons.length);
  }

  constructor(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>,
    iconOptions?: IconsOptions
  ) {
    this._maxPixelSize = Math.min(
      IconCollection.DefaultMaxPixelSize,
      iconOptions?.platformMaxPointsSize ?? IconCollection.DefaultMaxPixelSize
    );

    const sharedTexture = this.createOuterRingsTexture();

    const iconsSprites = new OverlayPointsObject(points.length, {
      spriteTexture: sharedTexture,
      minPixelSize: IconCollection.MinPixelSize,
      maxPixelSize: this._maxPixelSize,
      radius: this._iconRadius
    });
    iconsSprites.setPoints(points);

    const spriteTexture = this.createHoverIconTexture();
    this._hoverSprite = this.createHoverSprite(spriteTexture);
    this._sharedTexture = sharedTexture;
    this._icons = this.initializeImage360Icons(points, sceneHandler, onBeforeSceneRendered);

    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    const octree = new IconOctree(this._icons, octreeBounds, 2);

    this._iconCullingScheme = 'clustered';
    this._computeClustersEventHandler = this.setIconClustersByLOD(octree, iconsSprites);
    this._computeProximityPointsEventHandler = this.computeProximityPoints(octree, iconsSprites);
    this._activeCullingSchemeEventHandeler = this._computeClustersEventHandler;
    onBeforeSceneRendered.subscribe(this._activeCullingSchemeEventHandeler);

    this._sceneHandler = sceneHandler;
    this._pointsObject = iconsSprites;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    sceneHandler.addCustomObject(iconsSprites);
  }

  private setIconClustersByLOD(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
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
        .filter(icon => frustum.containsPoint(icon.getPosition()));

      this._icons.forEach(icon => (icon.culled = true));
      selectedIcons.forEach(icon => (icon.culled = false));
      iconSprites.setPoints(selectedIcons.filter(icon => icon.getVisible()).map(icon => icon.getPosition()));
    };
  }

  private computeProximityPoints(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
    return ({ camera }) => {
      const points =
        this._proximityRadius === Infinity
          ? this._icons
          : octree
              .findPoints(camera.position, this._proximityRadius)
              .map(pointContainer => {
                return pointContainer.data;
              })
              .filter((point): point is Overlay3DIcon => point !== null);

      const closestPoints = points
        .sort((a, b) => {
          return (
            a.getPosition().distanceToSquared(camera.position) - b.getPosition().distanceToSquared(camera.position)
          );
        })
        .slice(0, this._proximityPointLimit + 1); //Add 1 to account for self.

      this._icons.forEach(icon => (icon.culled = true));
      closestPoints.forEach(icon => (icon.culled = false));
      iconSprites.setPoints(
        closestPoints
          .filter(icon => icon.getVisible())
          .reverse()
          .map(p => p.getPosition())
      );
    };
  }

  private initializeImage360Icons(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ): Overlay3DIcon[] {
    sceneHandler.addCustomObject(this._hoverSprite);

    const icons = points.map(
      point =>
        new Overlay3DIcon(
          {
            position: point,
            minPixelSize: IconCollection.MinPixelSize,
            maxPixelSize: this._maxPixelSize,
            iconRadius: this._iconRadius,
            hoverSprite: this._hoverSprite
          },
          {}
        )
    );

    const renderSize = new Vector2();

    onBeforeSceneRendered.subscribe(({ renderer, camera }) =>
      icons.forEach(icon =>
        icon.updateAdaptiveScale({ camera, renderSize: renderer.getSize(renderSize), domElement: renderer.domElement })
      )
    );

    icons.forEach(icon =>
      icon.on('selected', () => {
        this._hoverSprite.position.copy(icon.getPosition());
        this._hoverSprite.scale.set(icon.adaptiveScale * 2, icon.adaptiveScale * 2, 1);
      })
    );

    return icons;
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._activeCullingSchemeEventHandeler);
    this._sceneHandler.removeCustomObject(this._pointsObject);
    this._icons.forEach(icon => icon.dispose());
    this._icons.splice(0, this._icons.length);
    this._pointsObject.dispose();
    this._sharedTexture.dispose();
  }

  private createHoverSprite(hoverIconTexture: THREE.CanvasTexture): THREE.Sprite {
    const spriteMaterial = new SpriteMaterial({ map: hoverIconTexture, depthTest: false });
    const sprite = new Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.visible = false;
    sprite.renderOrder = 5;
    return sprite;
  }

  private createOuterRingsTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this._maxPixelSize;
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
    const textureSize = this._maxPixelSize;
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
