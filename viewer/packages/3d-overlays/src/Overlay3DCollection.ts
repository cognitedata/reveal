/*!
 * Copyright 2023 Cognite AS
 */

import { CanvasTexture, Color, Texture, Vector3, Object3D } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { OverlayPointsObject } from './OverlayPointsObject';
import { IconOctree } from './IconOctree';

export type Overlay3DOptions = {
  overlayTexture?: Texture;
};

export type PointData = { position: Vector3, id: number };

export class Overlay3DCollection extends Object3D {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _sharedTexture: Texture;
  private readonly _icons: Overlay3DIcon[];
  private readonly _iconsPoints: OverlayPointsObject;
  private readonly _octree: IconOctree;
  private readonly _iconRadius = 0.4;

  get icons(): Overlay3DIcon[] {
    return this._icons;
  }

  constructor(
    pointsData: PointData [],
    options?: Overlay3DOptions,
  ) {
    super();

    const sharedTexture = options?.overlayTexture ?? this.createCircleTexture();
    const iconsSprites = new OverlayPointsObject(
      pointsData.length * 2,
      {
        spriteTexture: sharedTexture,
        minPixelSize: this.MIN_PIXEL_SIZE,
        maxPixelSize: this.MAX_PIXEL_SIZE,
        radius: this._iconRadius
      });
    iconsSprites.setPoints(pointsData.map(p => p.position));

    this._sharedTexture = sharedTexture;
    this._icons = this.initializeOverlay3DIcons(pointsData);

    this._iconsPoints = iconsSprites;

    this.add(iconsSprites);
    
    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    this._octree = new IconOctree(this._icons, octreeBounds, 2);
  }

  get iconsOctree(): IconOctree {
    return this._octree;
  }

  private initializeOverlay3DIcons(
    points: PointData []
  ): Overlay3DIcon[] {
    return points.map(
      point =>
        new Overlay3DIcon < { id: number }>({
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

    const overlayColor = new Color('yellow');

    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(
      textureSize / 2,
      textureSize / 2,
      textureSize / 2 - context.lineWidth,
      0,
      2 * Math.PI
    );
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 10;
    context.fillStyle = context.strokeStyle;
    context.stroke();

    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(
      textureSize / 2,
      textureSize / 2,
      textureSize / 2 - context.lineWidth,
      0,
      2 * Math.PI
    );
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 0;
    context.fillStyle = context.strokeStyle;
    context.stroke();
    context.fill();

    return new CanvasTexture(canvas);
  }
}
