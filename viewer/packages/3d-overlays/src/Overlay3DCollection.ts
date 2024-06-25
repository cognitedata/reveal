/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Texture, Object3D, Camera, Vector2, Raycaster, WebGLRenderer, Scene } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { Overlay3D } from './Overlay3D';
import { OverlayPointsObject } from './OverlayPointsObject';
import { IconOctree } from './IconOctree';
import { DefaultOverlay3DContentType, OverlayCollection, OverlayInfo } from './OverlayCollection';
import minBy from 'lodash/minBy';
import { CameraChangeThrottler } from './CameraChangeThrottler';

/**
 * Constructor options for the Overlay3DCollection
 */
export type Overlay3DCollectionOptions = {
  /**
   * The texture to display as icons in this collection
   */
  overlayTexture?: Texture;
  /**
   * A texture mask for marking what pixels are transparent in the supplied overlayTexture
   */
  overlayTextureMask?: Texture;
  /**
   * The maximum display size of each icon in pixels
   */
  maxPointSize?: number;
  /**
   * The default color to apply to overlay icons without a color on their own
   */
  defaultOverlayColor?: Color;
};

/**
 * A collection of overlay icons with associated data
 */
export class Overlay3DCollection<MetadataType = DefaultOverlay3DContentType>
  extends Object3D
  implements OverlayCollection<MetadataType>
{
  private readonly MinPixelSize = 16;
  private readonly MaxPixelSize = 64;
  private readonly DefaultMaxPoints = 100000;
  private readonly defaultOverlayColor = new Color('white');

  private readonly _sharedTextures: {
    color: Texture;
    mask: Texture | undefined;
  };
  private readonly _overlayPoints: OverlayPointsObject;
  private readonly _iconRadius = 0.4;
  private _overlays: Overlay3DIcon<MetadataType>[];
  //@ts-ignore Will be removed when clustering is added.
  private _octree: IconOctree<MetadataType>;
  private readonly _rayCaster = new Raycaster();
  private readonly _cameraChangeDebouncer = new CameraChangeThrottler();

  /**
   * Construct a collection of 3D overlay icons
   *
   * @param overlayInfos Initializes the collection with the list of overlays. The length
   * of the list will be the maximum allowed number of icons in this collection, unless it's empty,
   * in which case a default maximum limit will be used instead
   * @param options Additional options for this overlay collection
   */
  constructor(overlayInfos: OverlayInfo<MetadataType>[], options?: Overlay3DCollectionOptions) {
    super();

    this.defaultOverlayColor = options?.defaultOverlayColor ?? this.defaultOverlayColor;

    const defaultOverlayTextures = this.createCircleTextures();
    this._sharedTextures = {
      color: options?.overlayTexture ?? defaultOverlayTextures.color,
      mask: options?.overlayTextureMask ?? (options?.overlayTexture ? undefined : defaultOverlayTextures.mask)
    };

    this._overlayPoints = new OverlayPointsObject(
      overlayInfos.length > 0 ? overlayInfos.length : this.DefaultMaxPoints,
      {
        spriteTexture: this._sharedTextures.color,
        maskTexture: this._sharedTextures.mask,
        minPixelSize: this.MinPixelSize,
        maxPixelSize: options?.maxPointSize ?? this.MaxPixelSize,
        radius: this._iconRadius
      },
      (...args) => this.onBeforeRenderDelegate(...args)
    );

    this._overlays = this.initializeOverlay3DIcons(overlayInfos);
    this.add(this._overlayPoints);
    this.updatePointsObject();

    this._octree = this.rebuildOctree();
  }

  /**
   * Set whether this collection is visible or not
   */
  setVisibility(visibility: boolean): void {
    this._overlayPoints.visible = visibility;
  }

  /**
   * Get the overlay icons contained in this collection
   */
  getOverlays(): Overlay3D<MetadataType>[] {
    return this._overlays;
  }

  /**
   * Add more overlays into this collection
   */
  public addOverlays(overlayInfos: OverlayInfo<MetadataType>[]): Overlay3D<MetadataType>[] {
    if (overlayInfos.length + this._overlays.length > this.DefaultMaxPoints)
      throw new Error('Cannot add more than ' + this.DefaultMaxPoints + ' points');

    const newIcons = this.initializeOverlay3DIcons(overlayInfos);
    this._overlays.push(...newIcons);

    this.updatePointsObject();
    this._octree = this.rebuildOctree();

    return newIcons;
  }

  private readonly onBeforeRenderDelegate: Object3D['onBeforeRender'] = (
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: Camera
  ) => {
    this._cameraChangeDebouncer.call(camera, () => this.sortOverlaysRelativeToCamera(camera));
  };

  private sortOverlaysRelativeToCamera(camera: Camera): void {
    this._overlays = this._overlays.sort((a, b) => {
      return b.getPosition().distanceToSquared(camera.position) - a.getPosition().distanceToSquared(camera.position);
    });
    this.updatePointsObject();
  }

  /**
   * Remove the listed overlays from this collection
   */
  public removeOverlays(overlays: Overlay3D<MetadataType>[]): void {
    this._overlays = this._overlays.filter(overlay => !overlays.includes(overlay));

    this.updatePointsObject();
    this._octree = this.rebuildOctree();
  }

  /**
   * Clean up all icons in this collection
   */
  public removeAllOverlays(): void {
    this._overlays = [];

    this.updatePointsObject();
    this._octree = this.rebuildOctree();
  }

  /**
   * Run intersection on icons in this collection. Returns the closest hit
   */
  public intersectOverlays(normalizedCoordinates: Vector2, camera: Camera): Overlay3D<MetadataType> | undefined {
    this._rayCaster.setFromCamera(normalizedCoordinates.clone(), camera);

    const intersections = this._overlays.filter(icon => {
      return icon.getVisible() && icon.intersect(this._rayCaster.ray) !== null;
    });

    return minBy(intersections, a => a.getPosition().clone().sub(this._rayCaster.ray.origin).length());
  }

  private rebuildOctree(): IconOctree<MetadataType> {
    const icons = this._overlays;
    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(icons);

    return new IconOctree<MetadataType>(icons, octreeBounds, 2);
  }

  private updatePointsObject(): void {
    const filteredPoints = this._overlays.filter(p => p.getVisible());

    const pointsPositions = filteredPoints.map(p => p.getPosition());
    const pointsColors = filteredPoints.map(p => p.getColor() ?? this.defaultOverlayColor);

    this._overlayPoints.setPoints(pointsPositions, pointsColors);
  }

  private initializeOverlay3DIcons(overlayInfos: OverlayInfo<MetadataType>[]): Overlay3DIcon<MetadataType>[] {
    return overlayInfos.map(overlay => {
      const icon = new Overlay3DIcon<MetadataType>(
        {
          position: overlay.position,
          color: overlay.color ?? this.defaultOverlayColor,
          minPixelSize: this.MinPixelSize,
          maxPixelSize: this.MaxPixelSize,
          iconRadius: this._iconRadius
        },
        overlay?.content
      );

      icon.on('parametersChange', () => {
        this.updatePointsObject();
      });

      return icon;
    });
  }

  /**
   * Dispose this collection and icons with all associated resources
   */
  public dispose(): void {
    this._overlays.forEach(overlay => overlay.dispose());

    this._overlayPoints.dispose();
    this._sharedTextures.color.dispose();
    this._sharedTextures.mask?.dispose();
  }

  private createCircleTextures(): {
    color: Texture;
    mask: Texture;
  } {
    const canvas = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');

    const textureSize = this.MaxPixelSize * 2;
    canvas.width = textureSize;
    canvas.height = textureSize;
    canvas2.width = textureSize;
    canvas2.height = textureSize;

    const context = canvas.getContext('2d')!;
    const context2 = canvas2.getContext('2d')!;

    context.clearRect(0, 0, textureSize, textureSize);
    context.beginPath();
    context.lineWidth = textureSize / 12;
    context.strokeStyle = 'white';
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - (context.lineWidth / 2) * 1.1, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();

    const colorTexture = new CanvasTexture(canvas);

    const fillRGB = new Color(1.0, 0, 0);

    context2.clearRect(0, 0, textureSize, textureSize);
    context2.beginPath();
    context2.fillStyle = '#' + fillRGB.getHexString();
    context2.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context2.fill();

    const maskTexture = new CanvasTexture(canvas2);

    return {
      color: colorTexture,
      mask: maskTexture
    };
  }
}
