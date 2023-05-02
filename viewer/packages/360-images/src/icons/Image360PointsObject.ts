/*!
 * Copyright 2023 Cognite AS
 */
import { OverlayPointsObject } from '@reveal/3d-overlays';
import { PointsMaterialParameters } from '@reveal/3d-overlays/src/OverlayPointsObject';
import { LessEqualDepth, GreaterDepth, Object3D, Vector3 } from 'three';

export class Image360PointsObject extends Object3D {
  private readonly _pointsFront: OverlayPointsObject;
  private readonly _pointsBack: OverlayPointsObject;

  constructor(
    maxPoints: number,
    materialParameters: Pick<
      PointsMaterialParameters,
      'spriteTexture' | 'minPixelSize' | 'maxPixelSize' | 'radius' | 'colorTint'
    >
  ) {
    super();

    this._pointsFront = new OverlayPointsObject(maxPoints, {
      collectionOpacity: 1,
      depthMode: LessEqualDepth,
      ...materialParameters
    });
    this._pointsBack = new OverlayPointsObject(maxPoints, {
      collectionOpacity: 0.5,
      depthMode: GreaterDepth,
      ...materialParameters
    });

    this.add(this._pointsFront);
    this.add(this._pointsBack);
  }

  setPoints(points: Vector3[]): void {
    this._pointsFront.setPoints(points);
    this._pointsBack.setPoints(points);
  }

  dispose(): void {
    this._pointsFront.dispose();
    this._pointsBack.dispose();
  }
}
