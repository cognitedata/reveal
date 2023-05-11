/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Texture, Object3D } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { Overlay3D } from './Overlay3D';
import { OverlayPointsObject } from './OverlayPointsObject';
import { IconOctree } from './IconOctree';
import { DefaultMetadataType, OverlayCollection, OverlayInfo } from './OverlayCollection';

export type Overlay3DCollectionOptions = {
  overlayTexture?: Texture;
  maxPointSize?: number;
  defaultOverlayColor?: Color;
};

export class Overlay3DCollection<MetadataType = DefaultMetadataType>
  extends Object3D
  implements OverlayCollection<MetadataType>
{
  private readonly MinPixelSize = 16;
  private readonly MaxPixelSize = 64;
  private readonly DefaultMaxPoints = 100000;
  private readonly defaultOverlayColor = new Color('white');

  private readonly _sharedTexture: Texture;
  private readonly _overlayPoints: OverlayPointsObject;
  private readonly _iconRadius = 0.4;
  private _overlays: Overlay3DIcon<MetadataType>[];
  private _octree: IconOctree;

  constructor(overlayInfos?: OverlayInfo<MetadataType>[], options?: Overlay3DCollectionOptions) {
    super();

    this.defaultOverlayColor = options?.defaultOverlayColor ?? this.defaultOverlayColor;
    this._sharedTexture = options?.overlayTexture ?? this.createCircleTexture();
    this._overlayPoints = new OverlayPointsObject(overlayInfos ? overlayInfos.length * 2 : this.DefaultMaxPoints, {
      spriteTexture: this._sharedTexture,
      minPixelSize: this.MinPixelSize,
      maxPixelSize: options?.maxPointSize ?? this.MaxPixelSize,
      radius: this._iconRadius
    });

    this._overlays = this.initializeOverlay3DIcons(overlayInfos ?? []);
    this.add(this._overlayPoints);

    this.updatePointsObject();

    this._octree = this.rebuildOctree();
  }

  setVisibility(visibility: boolean): void {
    this._overlayPoints.visible = visibility;
  }

  getOverlays(): Overlay3D<MetadataType>[] {
    return this._overlays;
  }

  /**
   * Adds overlays to the collection.
   * @param overlayInfos Array of overlays to add.
   * @returns Overlay group containing it's id.
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
  /**
   * Removes overlays that were added with addOverlays method.
   * @param overlays Overlay3D object array to be removed.
   */
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

  private rebuildOctree(): IconOctree {
    const icons = this._overlays as Overlay3DIcon[];
    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(icons);

    return new IconOctree(icons, octreeBounds, 2);
  }

  private updatePointsObject(): void {
    const pointsPositions = this._overlays.map(p => p.position);
    const pointsColors = this._overlays.map(p => p.color ?? this.defaultOverlayColor);

    this._overlayPoints.setPoints(pointsPositions, pointsColors);
  }

  private initializeOverlay3DIcons(overlayInfos: OverlayInfo<MetadataType>[]): Overlay3DIcon<MetadataType>[] {
    return overlayInfos.map(
      overlay =>
        new Overlay3DIcon<MetadataType>(
          {
            position: overlay.position,
            color: overlay.color ?? this.defaultOverlayColor,
            minPixelSize: this.MinPixelSize,
            maxPixelSize: this.MaxPixelSize,
            iconRadius: this._iconRadius
          },
          overlay.metadata
        )
    );
  }

  public dispose(): void {
    this._overlays.forEach(overlay => overlay.dispose());

    this._overlayPoints.dispose();
    this._sharedTexture.dispose();
  }

  private createCircleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const overlayColor = new Color('white');

    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 10;
    context.fillStyle = context.strokeStyle;
    context.stroke();

    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 0;
    context.fillStyle = context.strokeStyle;
    context.stroke();
    context.fill();

    return new CanvasTexture(canvas);
  }
}
