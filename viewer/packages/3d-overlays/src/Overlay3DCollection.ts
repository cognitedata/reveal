/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Texture, Object3D, Camera, Vector2, Raycaster } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { Overlay3D } from './Overlay3D';
import { OverlayPointsObject } from './OverlayPointsObject';
import { IconOctree } from './IconOctree';
import { DefaultOverlay3DContentType, OverlayCollection, OverlayInfo } from './OverlayCollection';
import minBy from 'lodash/minBy';
import { CameraManager } from '@reveal/camera-manager';

export type Overlay3DCollectionOptions = {
  overlayTexture?: Texture;
  overlayTextureMask?: Texture;
  maxPointSize?: number;
  defaultOverlayColor?: Color;
};

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
  private _previousRenderCamera: Camera | undefined;
  private readonly _rayCaster = new Raycaster();

  private readonly _cameraManager: CameraManager;

  constructor(
    overlayInfos: OverlayInfo<MetadataType>[],
    cameraManager: CameraManager,
    options?: Overlay3DCollectionOptions
  ) {
    super();

    this.defaultOverlayColor = options?.defaultOverlayColor ?? this.defaultOverlayColor;

    const defaultOverlayTextures = this.createCircleTextures();
    this._sharedTextures = {
      color: options?.overlayTexture ?? defaultOverlayTextures.color,
      mask: options?.overlayTextureMask ?? (options?.overlayTexture ? undefined : defaultOverlayTextures.mask)
    };

    this._overlayPoints = new OverlayPointsObject(overlayInfos ? overlayInfos.length : this.DefaultMaxPoints, {
      spriteTexture: this._sharedTextures.color,
      maskTexture: this._sharedTextures.mask,
      minPixelSize: this.MinPixelSize,
      maxPixelSize: options?.maxPointSize ?? this.MaxPixelSize,
      radius: this._iconRadius
    });

    this._overlays = this.initializeOverlay3DIcons(overlayInfos ?? []);
    this._cameraManager = cameraManager;
    cameraManager.on('cameraChange', () => this.onCameraChange(this._cameraManager.getCamera()));
    this.add(this._overlayPoints);

    this.updatePointsObject();

    this._octree = this.rebuildOctree();
  }

  onCameraChange = (camera: Camera): void => {
    if (this._previousRenderCamera !== undefined && camera.matrix.equals(this._previousRenderCamera.matrix)) {
      return;
    }

    this.sortOverlaysRelativeToCamera(camera);

    if (this._previousRenderCamera === undefined) {
      this._previousRenderCamera = camera.clone();
    }

    this._previousRenderCamera.copy(camera);
  };

  setVisibility(visibility: boolean): void {
    this._overlayPoints.visible = visibility;
  }

  getOverlays(): Overlay3D<MetadataType>[] {
    return this._overlays;
  }

  public addOverlays(overlayInfos: OverlayInfo<MetadataType>[]): Overlay3D<MetadataType>[] {
    if (overlayInfos.length + this._overlays.length > this.DefaultMaxPoints)
      throw new Error('Cannot add more than ' + this.DefaultMaxPoints + ' points');

    const newIcons = this.initializeOverlay3DIcons(overlayInfos);
    this._overlays.push(...newIcons);

    this.updatePointsObject();
    this._octree = this.rebuildOctree();

    return newIcons;
  }

  private sortOverlaysRelativeToCamera(camera: Camera): void {
    this._overlays = this._overlays.sort((a, b) => {
      return b.getPosition().distanceToSquared(camera.position) - a.getPosition().distanceToSquared(camera.position);
    });
    this.updatePointsObject();
  }

  public removeOverlays(overlays: Overlay3D<MetadataType>[]): void {
    this._overlays = this._overlays.filter(overlay => !overlays.includes(overlay));

    this.updatePointsObject();
    this._octree = this.rebuildOctree();
  }

  public removeAllOverlays(): void {
    this._overlays = [];

    this.updatePointsObject();
    this._octree = this.rebuildOctree();
  }

  public intersectOverlays(normalizedCoordinates: Vector2): Overlay3D<MetadataType> | undefined {
    const camera = this._previousRenderCamera;
    if (camera === undefined) {
      return undefined;
    }

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
