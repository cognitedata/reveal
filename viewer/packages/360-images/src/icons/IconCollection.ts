/*!
 * Copyright 2023 Cognite AS
 */

import {
  CanvasTexture,
  Color,
  Frustum,
  Matrix4,
  PerspectiveCamera,
  Ray,
  Sphere,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { DefaultOverlay3DContentType, IconOctree, Overlay3DIcon, OverlayPointsObject } from '@reveal/3d-overlays';
import clamp from 'lodash/clamp';
import { PointOctant } from 'sparse-octree';
import { HtmlClusterRenderer, HtmlClusterRendererOptions } from './clustering/HtmlClusterRenderer';

export type IconCullingScheme = 'clustered' | 'proximity';

export type IconsOptions = {
  platformMaxPointsSize?: number;
  htmlClusterOptions?: HtmlClusterRendererOptions;
  clusterDistanceThreshold?: number;
  maxOctreeDepth?: number;
  enableHtmlClusters?: boolean;
};

export type ClusteredIcon = {
  icon: Overlay3DIcon;
  isCluster: boolean;
  clusterSize: number;
  clusterPosition: Vector3;
  sizeScale: number;
  clusterIcons?: Overlay3DIcon[];
};

export type ClusterIntersectionData = {
  clusterPosition: Vector3;
  clusterSize: number;
  clusterIcons: Overlay3DIcon[];
  representativeIcon: Overlay3DIcon;
};
export class IconCollection {
  private static readonly MinPixelSize = 16;
  private static readonly DefaultMaxPixelSize = 256;
  private static readonly DefaultProjectionMatrixElement = 1.73; // ~1.73 for 60° FOV
  private static readonly DefaultRenderHeight = 1080;
  private static readonly DefaultProximityPointLimit = 50;
  private static readonly DefaultProximityRadius = Infinity;
  private static readonly DefaultClusterDistanceThreshold = 25;
  private static readonly DefaultMaxOctreeDepth = 3;
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

  private readonly _renderPositions: Vector3[] = [];
  private readonly _renderColors: Color[] = [];
  private readonly _setNeedsRedraw: (() => void) | undefined;

  // Cache for LOD computation to prevent flickering during small camera movements
  private readonly _lastLODCameraPosition: Vector3 = new Vector3();
  // Cluster minimum pixel size (same as in the shader)
  private readonly _minClusterPixelSize = IconCollection.MinPixelSize * 2.5;

  // HTML cluster renderer for high-definition cluster display (only created when enabled)
  private readonly _htmlRenderer: HtmlClusterRenderer | undefined = undefined;
  // Feature flag: enable HTML cluster rendering with count display
  private readonly _enableHtmlClusters: boolean;

  // Store camera projection info for accurate cluster intersection radius calculation
  private _lastProjectionMatrixElement: number = IconCollection.DefaultProjectionMatrixElement;
  private _lastRenderHeight: number = IconCollection.DefaultRenderHeight;
  private _proximityRadius = IconCollection.DefaultProximityRadius;
  private _proximityPointLimit = IconCollection.DefaultProximityPointLimit;

  // Clustering distance threshold - controls when to expand vs cluster based on distance
  private _clusterDistanceThreshold: number = IconCollection.DefaultClusterDistanceThreshold;
  // Maximum octree depth - limits how deep we expand, creating larger clusters
  private _maxOctreeDepth: number | undefined = IconCollection.DefaultMaxOctreeDepth;

  private _activeCullingSchemeEventHandeler: BeforeSceneRenderedDelegate;
  private _iconCullingScheme: IconCullingScheme;

  // Cluster hover state tracking
  private _visibleClusteredIcons: ClusteredIcon[] = [];
  // Store the hovered cluster's representative icon (not index) to handle array changes between frames
  private _hoveredClusterIcon: Overlay3DIcon | undefined = undefined;
  private _cachedClusteredIcons: ClusteredIcon[] = [];

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
        if (this._htmlRenderer) {
          this._htmlRenderer.setVisible(true);
        }
        break;
      }
      case 'proximity': {
        this._activeCullingSchemeEventHandeler = this._computeProximityPointsEventHandler;
        if (this._htmlRenderer) {
          this._htmlRenderer.setVisible(false);
        }
        if (this._setNeedsRedraw) {
          this._setNeedsRedraw();
        }
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

  public getClusterDistanceThreshold(): number {
    return this._clusterDistanceThreshold;
  }

  public setClusterDistanceThreshold(threshold: number): void {
    this._clusterDistanceThreshold = Math.max(0, threshold);
    if (this._setNeedsRedraw) {
      this._setNeedsRedraw();
    }
  }

  public getMaxOctreeDepth(): number | undefined {
    return this._maxOctreeDepth;
  }

  public isHtmlClustersEnabled(): boolean {
    return this._enableHtmlClusters;
  }

  public setMaxOctreeDepth(depth: number | undefined): void {
    this._maxOctreeDepth = depth !== undefined ? Math.max(1, Math.floor(depth)) : undefined;
    if (this._setNeedsRedraw) {
      this._setNeedsRedraw();
    }
  }

  constructor(
    points: Vector3[],
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>,
    iconOptions?: IconsOptions,
    setNeedsRedraw?: () => void
  ) {
    this._setNeedsRedraw = setNeedsRedraw;
    this._enableHtmlClusters = iconOptions?.enableHtmlClusters ?? true;
    this._maxPixelSize = Math.min(
      IconCollection.DefaultMaxPixelSize,
      iconOptions?.platformMaxPointsSize ?? IconCollection.DefaultMaxPixelSize
    );
    this._clusterDistanceThreshold = iconOptions?.clusterDistanceThreshold ?? this._clusterDistanceThreshold;
    this._maxOctreeDepth = iconOptions?.maxOctreeDepth ?? this._maxOctreeDepth;

    const sharedTexture = this.createOuterRingsTexture();

    // Create OverlayPointsObject with sprite texture (used for individual icons in both modes)
    const pointsObjects = new OverlayPointsObject(points.length, {
      spriteTexture: sharedTexture,
      minPixelSize: IconCollection.MinPixelSize,
      maxPixelSize: this._maxPixelSize,
      radius: this._iconRadius,
      maskTexture: sharedTexture
    });

    // Initialize HTML cluster renderer only when enabled
    if (this._enableHtmlClusters) {
      this._htmlRenderer = new HtmlClusterRenderer(iconOptions?.htmlClusterOptions);
    }

    const spriteTexture = this.createHoverIconTexture();
    this._hoverSprite = this.createHoverSprite(spriteTexture);
    this._sharedTexture = sharedTexture;
    this._icons = this.initializeImage360Icons(points, sceneHandler, onBeforeSceneRendered);

    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    const octree = new IconOctree(this._icons, octreeBounds, 2);

    this._iconCullingScheme = 'clustered';
    this._computeClustersEventHandler = this._enableHtmlClusters
      ? this.setIconsByLODWithClustering(octree, pointsObjects)
      : this.setIconsByLOD(octree, pointsObjects);
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

  /**
   * Intersect a ray with visible clusters. Returns cluster data if a cluster is hit.
   * Only works when HTML clusters are enabled.
   * @param ray - Ray in model space (ray.origin is camera position in model space)
   * @returns ClusterIntersectionData if a cluster is hit, undefined otherwise
   */
  public intersectCluster(ray: Ray): ClusterIntersectionData | undefined {
    if (!this._enableHtmlClusters) {
      return undefined;
    }

    const tempSphere = new Sphere();

    let closestDistance = Infinity;
    let closestCluster: ClusterIntersectionData | undefined;

    const cameraPosition = ray.origin;

    const hoverMargin = 1.2;

    for (const element of this._visibleClusteredIcons) {
      const item = element;
      if (!item.isCluster) continue;

      const distanceToCentroid = cameraPosition.distanceTo(item.clusterPosition);

      const worldRadiusFromScale = this._iconRadius * item.sizeScale;
      const unclampedPixelSize =
        (this._lastRenderHeight * this._lastProjectionMatrixElement * worldRadiusFromScale) / distanceToCentroid;

      // The actual pixel size after clamping
      const actualPixelSize = Math.max(unclampedPixelSize, this._minClusterPixelSize);
      // Convert back to world-space radius for intersection
      const visualWorldRadius =
        (actualPixelSize * distanceToCentroid) / (this._lastRenderHeight * this._lastProjectionMatrixElement);

      // Apply hover margin for more forgiving interaction
      const intersectionRadius = visualWorldRadius * hoverMargin;

      tempSphere.set(item.clusterPosition, intersectionRadius);

      const intersection = new Vector3();
      if (ray.intersectSphere(tempSphere, intersection)) {
        const distance = ray.origin.distanceTo(intersection);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCluster = {
            clusterPosition: item.clusterPosition.clone(),
            clusterSize: item.clusterSize,
            clusterIcons: item.clusterIcons ?? [],
            representativeIcon: item.icon
          };
        }
      }
    }

    return closestCluster;
  }

  public setHoveredClusterIcon(icon: Overlay3DIcon | undefined): void {
    if (!this._enableHtmlClusters) return;
    this._hoveredClusterIcon = icon;
    if (this._htmlRenderer) {
      this._htmlRenderer.setHoveredCluster(icon);
    }
  }

  public clearHoveredCluster(): void {
    if (!this._enableHtmlClusters) return;
    const hadHoveredCluster = this._hoveredClusterIcon !== undefined;
    this._hoveredClusterIcon = undefined;
    if (this._htmlRenderer) {
      this._htmlRenderer.setHoveredCluster(undefined);
    }

    // Trigger redraw if we cleared a hover state
    if (hadHoveredCluster && this._setNeedsRedraw) {
      this._setNeedsRedraw();
    }
  }

  /**
   * Get the currently visible clustered icons (for external intersection handling).
   */
  public getVisibleClusteredIcons(): readonly ClusteredIcon[] {
    return this._visibleClusteredIcons;
  }

  /**
   * LOD-based icon filtering with cluster visualization.
   * Shows clusters based on distance/LOD and visualizes them with a count texture.
   * @param octree - The octree to use for clustering
   * @param iconSprites - The icon sprites to use for rendering
   * @returns A BeforeSceneRenderedDelegate function that sets the icons by LOD with cluster visualization
   */
  private setIconsByLODWithClustering(
    octree: IconOctree,
    iconSprites: OverlayPointsObject
  ): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    const frustum = new Frustum();
    const worldTransformInverse = new Matrix4();
    const cameraModelSpacePosition = new Vector3();
    const modelTransform = new Matrix4();
    const clusterIconSizeMultiplier = 5.5;
    const renderSize = new Vector2();

    return ({ camera, renderer }) => {
      camera.updateMatrixWorld();

      this._pointsObject.getTransform(worldTransformInverse);
      modelTransform.copy(worldTransformInverse);
      worldTransformInverse.invert();
      cameraModelSpacePosition.copy(camera.position).applyMatrix4(worldTransformInverse);

      this._lastProjectionMatrixElement = camera.projectionMatrix.elements[5];
      renderer.getSize(renderSize);
      this._lastRenderHeight = renderSize.y;
      this._lastLODCameraPosition.copy(cameraModelSpacePosition);

      const nodesLOD = octree.getLODByDistanceWithClustering(
        cameraModelSpacePosition,
        this._clusterDistanceThreshold,
        this._maxOctreeDepth
      );
      const nodes = [...nodesLOD];

      this._cachedClusteredIcons = this.buildClusteredIconsFromNodes(octree, nodes, clusterIconSizeMultiplier);

      projection
        .copy(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(this._pointsObject.getTransform());
      frustum.setFromProjectionMatrix(projection);

      this._visibleClusteredIcons = this.filterVisibleClusteredIcons(frustum, this._cachedClusteredIcons);

      this.updateClusterRendering(this._visibleClusteredIcons, iconSprites, {
        renderer,
        camera,
        modelTransform,
        hoveredClusterIcon: this._hoveredClusterIcon
      });
    };
  }

  /**
   * LOD-based icon filtering
   * Shows individual icons based on distance/LOD without pure cluster icons visualization.
   * @param octree - The octree to use for clustering
   * @param iconSprites - The icon sprites to use for rendering
   * @returns A BeforeSceneRenderedDelegate function that sets the icons by LOD without cluster visualization
   */
  private setIconsByLOD(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    const frustum = new Frustum();
    const worldTransformInverse = new Matrix4();
    const cameraModelSpacePosition = new Vector3();

    const distanceThreshold = 40; // Icons within this distance from camera are always visible (no clustering)
    const clusteringLevel = 3; // Octree depth for clustering far icons (higher = finer clusters, more icons shown)

    return ({ camera }) => {
      this._pointsObject.getTransform(worldTransformInverse);
      worldTransformInverse.invert();
      cameraModelSpacePosition.copy(camera.position).applyMatrix4(worldTransformInverse);

      const nodesLOD = octree.getLODByDistance(cameraModelSpacePosition, distanceThreshold, clusteringLevel);

      projection
        .copy(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(this._pointsObject.getTransform());
      frustum.setFromProjectionMatrix(projection);

      const nodes = [...nodesLOD];

      const selectedIcons: Overlay3DIcon[] = [];
      for (const node of nodes) {
        const icons =
          node.data === null
            ? octree.getIconsFromClusteredNode(node, cameraModelSpacePosition, distanceThreshold)
            : node.data.data;

        for (const icon of icons) {
          if (frustum.containsPoint(icon.getPosition())) {
            selectedIcons.push(icon);
          }
        }
      }

      this._icons.forEach(icon => (icon.culled = true));
      selectedIcons.forEach(icon => (icon.culled = false));
      const visibleIcons = selectedIcons.filter(icon => icon.getVisible());
      iconSprites.setPoints(
        visibleIcons.map(icon => icon.getPosition()),
        visibleIcons.map(icon => icon.getColor())
      );
    };
  }

  /**
   * Update the cluster rendering.
   * @param visibleClusters - The visible clustered icons
   * @param iconSprites - The icon sprites to use for rendering
   * @param params - The parameters for the rendering
   * @param params.renderer - The WebGL renderer
   * @param params.camera - The perspective camera
   * @param params.modelTransform - The model transform matrix
   * @param params.hoveredClusterIcon - The currently hovered cluster icon, if any
   */
  private updateClusterRendering(
    visibleClusters: ClusteredIcon[],
    iconSprites: OverlayPointsObject,
    params: {
      renderer: WebGLRenderer;
      camera: PerspectiveCamera;
      modelTransform: Matrix4;
      hoveredClusterIcon: Overlay3DIcon | undefined;
    }
  ): void {
    const clusters = visibleClusters.filter(item => item.isCluster);
    const individuals = visibleClusters.filter(item => !item.isCluster);

    if (this._htmlRenderer) {
      this._htmlRenderer.updateClusters(clusters, {
        renderer: params.renderer,
        camera: params.camera,
        modelTransform: params.modelTransform,
        hoveredClusterIcon: params.hoveredClusterIcon
      });
    }
    this.updateIconSpritesRenderData(individuals, iconSprites);
  }

  private calculateCentroid(icons: Overlay3DIcon[]): Vector3 {
    if (icons.length === 0) {
      return new Vector3();
    }

    const centroid = new Vector3();
    for (const icon of icons) {
      centroid.add(icon.getPosition());
    }
    centroid.divideScalar(icons.length);

    return centroid;
  }

  /**
   * Build clustered icons from octree LOD nodes.
   * Processes each node to determine if it should be shown as a cluster or individual icons.
   * @param octree - The octree to use for clustering
   * @param nodes - The nodes to process
   * @param clusterIconSizeMultiplier - The size multiplier for the cluster icons
   * @returns The clustered icons
   */
  private buildClusteredIconsFromNodes(
    octree: IconOctree,
    nodes: PointOctant<Overlay3DIcon<DefaultOverlay3DContentType>>[],
    clusterIconSizeMultiplier: number
  ): ClusteredIcon[] {
    const clusteredIcons: ClusteredIcon[] = [];

    for (const node of nodes) {
      // If node has data (leaf), show the individual icon(s)
      if (node.data !== null) {
        const icons = Array.isArray(node.data.data) ? node.data.data : [node.data.data];
        for (const icon of icons) {
          clusteredIcons.push({
            icon,
            isCluster: false,
            clusterSize: 1,
            clusterPosition: icon.getPosition(),
            sizeScale: 1
          });
        }
      } else {
        // Node is a parent (cluster) - the octree has already decided
        // this node should be clustered, so show the cluster.
        const representativeIcon = octree.getNodeIcon(node);
        if (!representativeIcon) continue;

        // Get all leaf icons under this cluster node
        const clusterIcons = octree.getAllIconsFromNode(node);
        const clusterSize = clusterIcons.length;

        // Show as cluster if we have multiple icons, otherwise show as individual
        if (clusterSize > 1) {
          const centroid = this.calculateCentroid(clusterIcons);

          clusteredIcons.push({
            icon: representativeIcon,
            isCluster: true,
            clusterSize,
            clusterPosition: centroid,
            sizeScale: clusterIconSizeMultiplier,
            clusterIcons: clusterIcons // Store all icons for click expansion
          });
        } else {
          // Only one icon in this "cluster" - show as individual
          for (const icon of clusterIcons) {
            clusteredIcons.push({
              icon,
              isCluster: false,
              clusterSize: 1,
              clusterPosition: icon.getPosition(),
              sizeScale: 1
            });
          }
        }
      }
    }

    return clusteredIcons;
  }

  /**
   * Filter clustered icons by frustum visibility and update culled state.
   * Returns only the visible icons that pass frustum culling and visibility checks.
   * @param frustum - The frustum to use for culling
   * @param clusteredIcons - The clustered icons to filter
   * @returns The visible clustered icons
   */
  private filterVisibleClusteredIcons(frustum: Frustum, clusteredIcons: ClusteredIcon[]): ClusteredIcon[] {
    const frustumVisibleIcons = clusteredIcons.filter(item => frustum.containsPoint(item.clusterPosition));

    this._icons.forEach(icon => (icon.culled = true));
    frustumVisibleIcons.forEach(item => (item.icon.culled = false));

    return frustumVisibleIcons.filter(item => item.icon.getVisible());
  }

  /**
   * Build render data arrays from visible icons and update the icon sprites.
   * Only renders individual icons (non-clusters)
   * @param visibleIcons - The visible icons to render
   * @param iconSprites - The icon sprites to use for rendering
   */
  private updateIconSpritesRenderData(visibleIcons: ClusteredIcon[], iconSprites: OverlayPointsObject): void {
    this._renderPositions.length = 0;
    this._renderColors.length = 0;

    for (const item of visibleIcons) {
      this._renderPositions.push(item.clusterPosition);
      this._renderColors.push(item.icon.getColor());
    }

    iconSprites.setPoints(this._renderPositions, this._renderColors);
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
        .sort((a, b) => {
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

    if (this._enableHtmlClusters && this._htmlRenderer) {
      this._htmlRenderer.dispose();
    }
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
