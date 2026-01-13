/*!
 * Copyright 2023 Cognite AS
 */

import {
  CanvasTexture,
  Color,
  Frustum,
  Matrix4,
  Ray,
  Sphere,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector2,
  Vector3
} from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { DefaultOverlay3DContentType, IconOctree, Overlay3DIcon, OverlayPointsObject } from '@reveal/3d-overlays';
import clamp from 'lodash/clamp';
import { PointOctant } from 'sparse-octree';

export type IconCullingScheme = 'clustered' | 'proximity';

export type IconsOptions = {
  platformMaxPointsSize?: number;
};

export type ClusteredIcon = {
  icon: Overlay3DIcon;
  isCluster: boolean;
  clusterSize: number;
  clusterPosition: Vector3;
  sizeScale: number;
  clusterIcons?: Overlay3DIcon[]; // All icons in this cluster (for click expansion)
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
  private readonly _maxPixelSize: number;
  private readonly _sceneHandler: SceneHandler;
  private readonly _sharedTexture: Texture;
  private readonly _clusterTexture: Texture;
  private readonly _numberTexture: Texture;
  private readonly _hoverSprite: Sprite;
  private readonly _icons: Overlay3DIcon[];
  private readonly _pointsObject: OverlayPointsObject;
  private readonly _computeClustersEventHandler: BeforeSceneRenderedDelegate;
  private readonly _computeProximityPointsEventHandler: BeforeSceneRenderedDelegate;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private readonly _iconRadius = 0.3;

  // Cache for LOD computation to prevent flickering during small camera movements
  private readonly _lastLODCameraPosition: Vector3 = new Vector3();

  // Cluster minimum pixel size (same as in the shader)
  private readonly _minClusterPixelSize = IconCollection.MinPixelSize * 2.5;
  private readonly _setNeedsRedraw: (() => void) | undefined;

  private _activeCullingSchemeEventHandeler: BeforeSceneRenderedDelegate;
  private _iconCullingScheme: IconCullingScheme;
  private _proximityRadius = Infinity;
  private _proximityPointLimit = 50;

  // Cluster hover state tracking
  private _visibleClusteredIcons: ClusteredIcon[] = [];
  // Store the hovered cluster's representative icon (not index) to handle array changes between frames
  private _hoveredClusterIcon: Overlay3DIcon | null = null;

  // Store camera projection info for accurate cluster intersection radius calculation
  private _lastProjectionMatrixElement: number = 1.73; // ~1.73 for 60° FOV
  private _lastRenderHeight: number = 1080;

  // Cache for clustered icons to avoid recomputation
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
    iconOptions?: IconsOptions,
    setNeedsRedraw?: () => void
  ) {
    this._setNeedsRedraw = setNeedsRedraw;
    this._maxPixelSize = Math.min(
      IconCollection.DefaultMaxPixelSize,
      iconOptions?.platformMaxPointsSize ?? IconCollection.DefaultMaxPixelSize
    );

    const sharedTexture = this.createOuterRingsTexture();
    const clusterTexture = this.createClusterTexture();
    const iconAtlasTexture = this.createIconAtlasTexture(sharedTexture, clusterTexture);
    const numberTexture = this.createNumberTexture();

    const pointsObjects = new OverlayPointsObject(points.length, {
      iconAtlasTexture: iconAtlasTexture,
      numberTexture: numberTexture,
      minPixelSize: IconCollection.MinPixelSize,
      maxPixelSize: this._maxPixelSize,
      radius: this._iconRadius,
      maskTexture: sharedTexture
    });

    const spriteTexture = this.createHoverIconTexture();
    this._hoverSprite = this.createHoverSprite(spriteTexture);
    this._sharedTexture = sharedTexture;
    this._clusterTexture = clusterTexture;
    this._numberTexture = numberTexture;
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

  /**
   * Intersect a ray with visible clusters. Returns cluster data if a cluster is hit.
   * @param ray - Ray in model space (ray.origin is camera position in model space)
   * @returns ClusterIntersectionData if a cluster is hit, undefined otherwise
   */
  public intersectCluster(ray: Ray): ClusterIntersectionData | undefined {
    const tempSphere = new Sphere();

    let closestDistance = Infinity;
    let closestCluster: ClusterIntersectionData | undefined;
    let newHoveredIcon: Overlay3DIcon | null = null;

    const cameraPosition = ray.origin;

    const hoverMargin = 1.2;

    for (let i = 0; i < this._visibleClusteredIcons.length; i++) {
      const item = this._visibleClusteredIcons[i];
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
          newHoveredIcon = item.icon;
        }
      }
    }

    // Check if hover state changed and trigger redraw if needed
    const hoverStateChanged = this._hoveredClusterIcon !== newHoveredIcon;
    this._hoveredClusterIcon = newHoveredIcon;

    if (hoverStateChanged && this._setNeedsRedraw) {
      this._setNeedsRedraw();
    }

    return closestCluster;
  }

  public setHoveredClusterIcon(icon: Overlay3DIcon | null): void {
    this._hoveredClusterIcon = icon;
  }

  public clearHoveredCluster(): void {
    const hadHoveredCluster = this._hoveredClusterIcon !== null;
    this._hoveredClusterIcon = null;

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
   * Distance-based clustering approach:
   * - Uses camera distance to decide when to show clusters vs individual icons
   * - When camera is far (> clusterDistanceThreshold), show cluster icons at centroids
   * - When camera is close (< clusterDistanceThreshold), show individual icons
   * - Cluster icons are rendered with a different texture and show the count
   * @param octree - Octree containing the icons
   * @param iconSprites - OverlayPointsObject to update icon rendering
   * @returns BeforeSceneRenderedDelegate to be called
   */
  private setIconClustersByLOD(octree: IconOctree, iconSprites: OverlayPointsObject): BeforeSceneRenderedDelegate {
    const projection = new Matrix4();
    const frustum = new Frustum();
    const worldTransformInverse = new Matrix4();
    const cameraModelSpacePosition = new Vector3();

    // Distance-based clustering parameters
    const clusterDistanceThreshold = 50; // Distance beyond which clustering is applied
    const clusteringLevel = 3; // Octree depth for clustering (higher = finer clusters)
    const clusterIconSizeMultiplier = 5.5; // How much bigger clustered points appear

    const renderSize = new Vector2();

    return ({ camera, renderer }) => {
      this._pointsObject.getTransform(worldTransformInverse);
      worldTransformInverse.invert();
      cameraModelSpacePosition.copy(camera.position).applyMatrix4(worldTransformInverse);

      // Store camera projection info for accurate cluster intersection radius calculation
      this._lastProjectionMatrixElement = camera.projectionMatrix.elements[5];
      renderer.getSize(renderSize);
      this._lastRenderHeight = renderSize.y;
      this._lastLODCameraPosition.copy(cameraModelSpacePosition);

      const nodesLOD = octree.getLODByDistance(cameraModelSpacePosition, clusterDistanceThreshold, clusteringLevel);
      const nodes = [...nodesLOD];

      this._cachedClusteredIcons = this.buildClusteredIconsFromNodes(octree, nodes, clusterIconSizeMultiplier);

      projection
        .copy(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(this._pointsObject.getTransform());
      frustum.setFromProjectionMatrix(projection);

      this._visibleClusteredIcons = this.filterVisibleClusteredIcons(frustum, this._cachedClusteredIcons);

      this.updateIconSpritesRenderData(this._visibleClusteredIcons, iconSprites);
    };
  }

  /**
   * Calculate the 3D centroid of a group of icons
   */
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
   */
  private filterVisibleClusteredIcons(frustum: Frustum, clusteredIcons: ClusteredIcon[]): ClusteredIcon[] {
    const frustumVisibleIcons = clusteredIcons.filter(item => frustum.containsPoint(item.clusterPosition));

    this._icons.forEach(icon => (icon.culled = true));
    frustumVisibleIcons.forEach(item => (item.icon.culled = false));

    return frustumVisibleIcons.filter(item => item.icon.getVisible());
  }

  /**
   * Build render data arrays from visible icons and update the icon sprites.
   */
  private updateIconSpritesRenderData(visibleIcons: ClusteredIcon[], iconSprites: OverlayPointsObject): void {
    const renderPositions: Vector3[] = [];
    const renderColors: Color[] = [];
    const renderSizeScales: number[] = [];
    const renderIsClusterFlags: boolean[] = [];
    const renderClusterSizes: number[] = [];
    const renderIsHoveredFlags: boolean[] = [];

    for (const item of visibleIcons) {
      // Use cluster position (centroid for clusters, original position for individuals)
      renderPositions.push(item.clusterPosition);

      // Use icon color (clusters use gray texture, hover tinting is done in shader)
      renderColors.push(item.icon.getColor());

      renderSizeScales.push(item.sizeScale);
      renderIsClusterFlags.push(item.isCluster);
      renderClusterSizes.push(item.clusterSize);
      // Compare by icon reference (not index) for stable hover across frame changes
      renderIsHoveredFlags.push(item.isCluster && item.icon === this._hoveredClusterIcon);
    }

    iconSprites.setPoints(
      renderPositions,
      renderColors,
      renderSizeScales,
      renderIsClusterFlags,
      renderClusterSizes,
      renderIsHoveredFlags
    );
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
    this._clusterTexture.dispose();
    this._numberTexture.dispose();
  }

  private createHoverSprite(hoverIconTexture: CanvasTexture): Sprite {
    const spriteMaterial = new SpriteMaterial({ map: hoverIconTexture, depthTest: false });
    const sprite = new Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.visible = false;
    sprite.renderOrder = 5;
    return sprite;
  }

  private createIconAtlasTexture(regularTexture: CanvasTexture, clusterTexture: CanvasTexture): CanvasTexture {
    const textureSize = this._maxPixelSize;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize * 2; // Double width for side-by-side atlas: left = regular icon, right = cluster icon
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;

    // Draw regular icon on left half (from regularTexture's canvas)
    if (regularTexture.image instanceof HTMLCanvasElement) {
      context.drawImage(regularTexture.image, 0, 0, textureSize, textureSize);
    }

    // Draw cluster icon on right half (from clusterTexture's canvas)
    if (clusterTexture.image instanceof HTMLCanvasElement) {
      context.drawImage(clusterTexture.image, textureSize, 0, textureSize, textureSize);
    }

    return new CanvasTexture(canvas);
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

  /**
   * Create a cluster texture
   */
  private createClusterTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const textureSize = this._maxPixelSize;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const halfTextureSize = textureSize * 0.5;
    const context = canvas.getContext('2d')!;

    // Clear canvas to transparent
    context.clearRect(0, 0, textureSize, textureSize);

    const outerRadius = halfTextureSize * 0.98;

    // Ring thicknesses
    const transparentOuterGap = halfTextureSize * 0.1; // Transparent outermost gap
    const whiteOuterRingThickness = halfTextureSize * 0.06; // White ring
    const transparentMiddleGap = halfTextureSize * 0.1; // Transparent gap
    const whiteInnerRingThickness = halfTextureSize * 0.05; // White ring (inner)
    const grayRingThickness = halfTextureSize * 0.22; // Gray middle ring

    // Calculate radii for each ring center (for stroke-based drawing)
    const whiteOuterRingRadius = outerRadius - transparentOuterGap - whiteOuterRingThickness / 2;
    const whiteInnerRingRadius =
      outerRadius - transparentOuterGap - whiteOuterRingThickness - transparentMiddleGap - whiteInnerRingThickness / 2;
    const grayRingOuterRadius =
      outerRadius - transparentOuterGap - whiteOuterRingThickness - transparentMiddleGap - whiteInnerRingThickness;

    // Draw white outer ring using stroke
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = whiteOuterRingThickness;
    context.beginPath();
    context.arc(halfTextureSize, halfTextureSize, whiteOuterRingRadius, 0, 2 * Math.PI);
    context.stroke();

    // Draw white inner ring using stroke
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = whiteInnerRingThickness;
    context.beginPath();
    context.arc(halfTextureSize, halfTextureSize, whiteInnerRingRadius, 0, 2 * Math.PI);
    context.stroke();

    // Draw gray ring using stroke
    context.strokeStyle = '#a0a0a0';
    context.lineWidth = grayRingThickness;
    context.beginPath();
    context.arc(halfTextureSize, halfTextureSize, grayRingOuterRadius - grayRingThickness / 2, 0, 2 * Math.PI);
    context.stroke();

    return new CanvasTexture(canvas);
  }

  /**
   * Create a number texture atlas (digits 0-9 plus "+" symbol)
   */
  private createNumberTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    const charCount = 11; // 0-9 plus "+"
    // Higher resolution for better quality when scaled down
    const charWidth = 128;
    const charHeight = 192;
    canvas.width = charWidth * charCount;
    canvas.height = charHeight;

    const context = canvas.getContext('2d')!;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Larger font for higher resolution texture
    context.font = '160px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw digits 0-9
    for (let i = 0; i < 10; i++) {
      const x = charWidth * i + charWidth / 2;
      const y = charHeight / 2;

      context.strokeStyle = '#000000';
      context.lineWidth = 3;
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeText(i.toString(), x, y);

      context.fillStyle = '#FFFFFF';
      context.fillText(i.toString(), x, y);
    }

    // Draw "+" symbol at index 10
    const plusX = charWidth * 10 + charWidth / 2;
    const plusY = charHeight / 2;

    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeText('+', plusX, plusY);

    context.fillStyle = '#FFFFFF';
    context.fillText('+', plusX, plusY);

    const texture = new CanvasTexture(canvas);
    // Enable mipmaps for better quality when scaled down
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    return texture;
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
