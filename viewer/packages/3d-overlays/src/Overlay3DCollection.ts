/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Texture, Vector3, Object3D } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { OverlayPointsObject } from './OverlayPointsObject';
import { IconOctree } from './IconOctree';

export type Overlay3DOptions = {
  overlayTexture?: Texture;
  maxPointSize?: number;
};

export type PointData = {
  position: Vector3;
  id: number;
  color?: Color;
};

export class Overlay3DCollection extends Object3D {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly DEFAULT_MAX_POINTS = 100000;
  private readonly _sharedTexture: Texture;
  private readonly _iconsPoints: OverlayPointsObject;
  private readonly _iconRadius = 0.4;
  private _icons: Overlay3DIcon[];
  private _pointsData: PointData[];
  private _octree: IconOctree;

  get icons(): Overlay3DIcon[] {
    return this._icons;
  }

  constructor(pointsData?: PointData[], options?: Overlay3DOptions) {
    super();

    this._sharedTexture = options?.overlayTexture ?? this.createCircleTexture();
    this._iconsPoints = new OverlayPointsObject(pointsData ? pointsData.length * 2 : this.DEFAULT_MAX_POINTS, {
      spriteTexture: this._sharedTexture,
      minPixelSize: this.MIN_PIXEL_SIZE,
      maxPixelSize: options?.maxPointSize ?? this.MAX_PIXEL_SIZE,
      radius: this._iconRadius
    });

    this._pointsData = pointsData ?? [];
    this.updatePointsData(this._pointsData);

    this._icons = this.initializeOverlay3DIcons(this._pointsData);

    this.add(this._iconsPoints);

    this._octree = this.rebuildOctree();
  }

  get iconsOctree(): IconOctree {
    return this._octree;
  }

  public addOverlays(pointsData: PointData[]): void {
    if (pointsData.length + this._pointsData.length > this.DEFAULT_MAX_POINTS)
      throw new Error('Cannot add more than ' + this.DEFAULT_MAX_POINTS + ' points');

    this.updatePointsData(pointsData);

    const newIcons = this.initializeOverlay3DIcons(pointsData);
    this._icons.push(...newIcons);

    this._octree = this.rebuildOctree();
  }

  public removeOverlays(pointsIds: number[]): void {
    this._pointsData = this._pointsData.filter(p => !pointsIds.includes(p.id));
    this._icons = this._icons.filter(i => !pointsIds.includes(i.iconMetadata?.id));

    this.updatePointsData();
    this._octree = this.rebuildOctree();
  }

  public removeAllOverlays(): void {
    this._pointsData = [];
    this._icons = [];

    this.updatePointsData();
    this._octree = this.rebuildOctree();
  }

  private rebuildOctree(): IconOctree {
    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    return new IconOctree(this._icons, octreeBounds, 2);
  }

  private updatePointsData(newPointsData?: PointData[]): void {
    if (newPointsData) {
      this._pointsData.push(...newPointsData);
    }

    const pointsPositions = this._pointsData.map(p => p.position);
    const pointsColors = this._pointsData.map(p => p.color ?? new Color(1, 1, 1));

    this._iconsPoints.setPoints(pointsPositions, pointsColors);
  }

  private initializeOverlay3DIcons(points: PointData[]): Overlay3DIcon[] {
    return points.map(
      point =>
        new Overlay3DIcon<{ id: number }>(
          {
            position: point.position,
            minPixelSize: this.MIN_PIXEL_SIZE,
            maxPixelSize: this.MAX_PIXEL_SIZE,
            iconRadius: this._iconRadius
          },
          { id: point.id }
        )
    );
  }

  public dispose(): void {
    this._iconsPoints.dispose();
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
