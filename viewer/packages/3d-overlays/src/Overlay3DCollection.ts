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

export class Overlay3DCollection extends Object3D {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _sharedTexture: Texture;
  private readonly _icons: Overlay3DIcon[];
  private readonly _iconsPoints: OverlayPointsObject;
  private readonly _octree: IconOctree;
  private readonly _iconRadius = 0.3;

  get icons(): Overlay3DIcon[] {
    return this._icons;
  }

  constructor(
    points: Vector3[],
    options?: Overlay3DOptions,
  ) {
    super();

    const sharedTexture = options?.overlayTexture ?? this.createCircleTexture();
    const iconSpriteRadius = 0.5;
    const iconsSprites = new OverlayPointsObject(
      points.length * 2,
      {
        spriteTexture: sharedTexture,
        minPixelSize: this.MIN_PIXEL_SIZE,
        maxPixelSize: this.MAX_PIXEL_SIZE,
        radius: iconSpriteRadius
      });
    iconsSprites.setPoints(points);

    this._sharedTexture = sharedTexture;
    this._icons = this.initializeImage360Icons(points);

    this._iconsPoints = iconsSprites;

    this.add(iconsSprites);
    
    const octreeBounds = IconOctree.getMinimalOctreeBoundsFromIcons(this._icons);
    this._octree = new IconOctree(this._icons, octreeBounds, 2);
  }

  get iconsOctree(): IconOctree {
    return this._octree;
  }

  private initializeImage360Icons(
    points: Vector3[]
  ): Overlay3DIcon[] {
    return points.map(
      point =>
        new Overlay3DIcon(
          point,
          this.MIN_PIXEL_SIZE,
          this.MAX_PIXEL_SIZE,
          this._iconRadius
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
