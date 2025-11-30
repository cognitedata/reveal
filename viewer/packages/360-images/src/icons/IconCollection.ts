/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Frustum, Matrix4, Sprite, SpriteMaterial, Texture, Vector2, Vector3 } from 'three';
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

    const pointsObjects = new OverlayPointsObject(points.length, {
      spriteTexture: sharedTexture,
      minPixelSize: IconCollection.MinPixelSize,
      maxPixelSize: this._maxPixelSize,
      radius: this._iconRadius,
      maskTexture: sharedTexture
    });

    const spriteTexture = this.createHoverIconTexture();
    this._hoverSprite = this.createHoverSprite(spriteTexture);
    this._sharedTexture = sharedTexture;
    this._icons = this.initializeImage360Icons(points, sceneHandler, onBeforeSceneRendered);

    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    const octree = new IconOctree(this._icons, octreeBounds, 2);

    this._iconCullingScheme = 'clustered';
    this._computeClustersEventHandler = this.setIconClustersByLOD(octree, pointsObjects);
    this._computeProximityPointsEventHandler = this.computeProximityPoints(octree, pointsObjects);
    this._activeCullingSchemeEventHandeler = this._computeClustersEventHandler;
    onBeforeSceneRendered.subscribe(this._activeCullingSchemeEventHandeler);

    this._sceneHandler = sceneHandler;
    this._pointsObject = pointsObjects;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    sceneHandler.addObject3D(pointsObjects);
  }

  public setTransform(transform: Matrix4): void {
    this._pointsObject.setTransform(transform);
    this._icons.forEach(icon => icon.setWorldTransform(transform));
  }

  public getTransform(out?: Matrix4): Matrix4 {
    return this._pointsObject.getTransform(out);
  }

  private setIconClustersByLOD(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    const frustum = new Frustum();
    const screenSpaceAreaThreshold = 0.04;
    const minimumLevel = 4;
    const cameraModelSpacePosition = new Vector3();
    const worldTransform = new Matrix4();

    // Clustering parameters
    const clusterDistanceThreshold = 50; // Distance beyond which clustering is applied
    const clusterSizeMultiplier = 10.5; // How much bigger clustered points appear

    return ({ camera }) => {
      projection
        .copy(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(this._pointsObject.getTransform());
      const nodesLOD = octree.getLODByScreenArea(screenSpaceAreaThreshold, projection, minimumLevel);

      frustum.setFromProjectionMatrix(projection);

      // Calculate camera position in model space
      this._pointsObject.getTransform(worldTransform);
      worldTransform.invert();
      cameraModelSpacePosition.copy(camera.position).applyMatrix4(worldTransform);

      const nodes = [...nodesLOD];

      // Clustering logic: determine which nodes to show as clusters vs individual points
      type ClusteredIcon = {
        icon: Overlay3DIcon;
        isCluster: boolean;
        clusterSize: number;
        clusterPosition: Vector3;
        sizeScale: number;
      };

      const clusteredIcons: ClusteredIcon[] = [];

      nodes.forEach(node => {
        // If node has data (leaf), show the individual icon(s)
        if (node.data !== null) {
          const icons = Array.isArray(node.data.data) ? node.data.data : [node.data.data];
          icons.forEach(icon => {
            clusteredIcons.push({
              icon,
              isCluster: false,
              clusterSize: 1,
              clusterPosition: icon.getPosition(),
              sizeScale: 1
            });
          });
        } else {
          // Node is a parent (cluster) - check distance to camera
          const representativeIcon = octree.getNodeIcon(node);
          if (!representativeIcon) return;

          const distanceToCamera = representativeIcon.getPosition().distanceTo(cameraModelSpacePosition);

          // Get all leaf icons under this cluster node
          const clusterIcons = this.getNodeLeafIcons(node);
          const clusterSize = clusterIcons.length;

          // If camera is far enough, show as cluster; otherwise show individual points
          if (distanceToCamera > clusterDistanceThreshold && clusterSize > 1) {
            // Calculate the 3D centroid (center) of all icons in this cluster
            const centroid = this.calculateCentroid(clusterIcons);

            // Show as cluster - single icon at centroid position with scaled size
            clusteredIcons.push({
              icon: representativeIcon,
              isCluster: true,
              clusterSize,
              clusterPosition: centroid,
              sizeScale: clusterSizeMultiplier
            });
          } else {
            // Camera is close - show individual points
            clusterIcons.forEach(icon => {
              clusteredIcons.push({
                icon,
                isCluster: false,
                clusterSize: 1,
                clusterPosition: icon.getPosition(),
                sizeScale: 1
              });
            });
          }
        }
      });

      // Filter by frustum - use cluster position for frustum test
      const visibleClusteredIcons = clusteredIcons.filter(item => frustum.containsPoint(item.clusterPosition));

      // Update culling state
      this._icons.forEach(icon => (icon.culled = true));
      visibleClusteredIcons.forEach(item => (item.icon.culled = false));

      // Prepare rendering data with size scaling for clusters
      const visibleIcons = visibleClusteredIcons.filter(item => item.icon.getVisible());

      // For rendering, we need positions, colors, and size scales
      const renderPositions: Vector3[] = [];
      const renderColors: Color[] = [];
      const renderSizeScales: number[] = [];

      visibleIcons.forEach(item => {
        // Use cluster position (centroid for clusters, original position for individuals)
        renderPositions.push(item.clusterPosition);

        // For clusters, make them visually distinct with brighter/blue-tinted color
        if (item.isCluster) {
          const baseColor = item.icon.getColor();
          // Make cluster icons brighter and blue-tinted to indicate grouping
          const clusterColor = new Color(
            Math.min(baseColor.r * 1.5, 1),
            Math.min(baseColor.g * 1.5, 1),
            Math.min(baseColor.b * 1.5 + 0.3, 1)
          );
          renderColors.push(clusterColor);
        } else {
          renderColors.push(item.icon.getColor());
        }

        // Add size scale
        renderSizeScales.push(item.sizeScale);
      });

      console.log('TEST Visible icons count:', visibleIcons.length, ' out of ', this._icons.length);
      console.log('TEST Clusters:', visibleIcons.filter(v => v.isCluster).length);
      console.log('TEST Individual points:', visibleIcons.filter(v => !v.isCluster).length);

      iconSprites.setPoints(renderPositions, renderColors, renderSizeScales);
    };
  }

  // Helper method to recursively get all leaf icons under a node
  private getNodeLeafIcons(node: any): Overlay3DIcon[] {
    const leafIcons: Overlay3DIcon[] = [];

    if (node.data !== null) {
      // This is a leaf with actual data
      const icons = Array.isArray(node.data.data) ? node.data.data : [node.data.data];
      return icons;
    }

    // Recursively traverse children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        leafIcons.push(...this.getNodeLeafIcons(child));
      });
    }

    return leafIcons;
  }

  // Helper method to calculate the 3D centroid (center) of a group of icons
  private calculateCentroid(icons: Overlay3DIcon[]): Vector3 {
    if (icons.length === 0) {
      return new Vector3();
    }

    const centroid = new Vector3();
    icons.forEach(icon => {
      centroid.add(icon.getPosition());
    });
    centroid.divideScalar(icons.length);

    return centroid;
  }

  private computeProximityPoints(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
    const cameraModelSpacePosition = new Vector3();
    const worldTransform = new Matrix4();
    return ({ camera }) => {
      this._pointsObject.getTransform(worldTransform);
      worldTransform.invert();
      cameraModelSpacePosition.copy(camera.position).applyMatrix4(worldTransform);

      const points =
        this._proximityRadius === Infinity
          ? this._icons
          : octree
              .findPoints(cameraModelSpacePosition, this._proximityRadius)
              .map(pointContainer => {
                return pointContainer.data;
              })
              .filter((point): point is Overlay3DIcon => point !== null);

      const closestPoints = points
        .toSorted((a, b) => {
          return (
            a.getPosition().distanceToSquared(cameraModelSpacePosition) -
            b.getPosition().distanceToSquared(cameraModelSpacePosition)
          );
        })
        .slice(0, this._proximityPointLimit + 1); //Add 1 to account for self.

      this._icons.forEach(icon => (icon.culled = true));
      closestPoints.forEach(icon => (icon.culled = false));

      const closestVisibleReversedPoints = closestPoints.filter(icon => icon.getVisible()).reverse();

      iconSprites.setPoints(
        closestVisibleReversedPoints.map(p => p.getPosition()),
        closestVisibleReversedPoints.map(p => p.getColor())
      );
    };
  }

  private initializeImage360Icons(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ): Overlay3DIcon[] {
    sceneHandler.addObject3D(this._hoverSprite);

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
        this._hoverSprite.position.copy(icon.getPosition().clone().applyMatrix4(this.getTransform()));
        this._hoverSprite.scale.set(icon.adaptiveScale * 2, icon.adaptiveScale * 2, 1);
      })
    );

    return icons;
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._activeCullingSchemeEventHandeler);
    this._sceneHandler.removeObject3D(this._pointsObject);
    this._icons.forEach(icon => icon.dispose());
    this._icons.splice(0, this._icons.length);
    this._pointsObject.dispose();
    this._sharedTexture.dispose();
  }

  private createHoverSprite(hoverIconTexture: CanvasTexture): Sprite {
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

  //================================================
  // INSTANCE METHODS: Setter and getters
  //================================================

  public getOpacity(): number {
    return this._pointsObject.getOpacity();
  }

  public setOpacity(value: number): void {
    this._pointsObject.setOpacity(value);
  }

  public isOccludedVisible(): boolean {
    return this._pointsObject.isBackPointsVisible();
  }

  public setOccludedVisible(value: boolean): void {
    this._pointsObject.setBackPointsVisible(value);
  }
}
