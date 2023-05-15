/*!
 * Copyright 2023 Cognite AS
 */

import { ImageAnnotationObjectData } from './ImageAnnotationData';

import { BufferGeometry, Color, Group, Matrix4, Object3D, PlaneGeometry, Vector2, Vector3 } from 'three';

import { AnnotationsBoundingBox } from '@cognite/sdk';
import { ThickLine } from '@reveal/utilities/src/three/ThickLine';

export class BoxAnnotationData implements ImageAnnotationObjectData {
  private readonly _geometry: PlaneGeometry;
  private readonly _initialTranslation: Matrix4;
  private readonly _lineGeometry: BufferGeometry;
  private readonly _outline: Vector2[];

  constructor(annotationsBox: AnnotationsBoundingBox) {
    this._geometry = this.createGeometry(annotationsBox);
    this._outline = getBoundPoints(annotationsBox);

    this._initialTranslation = new Matrix4().makeTranslation(
      0.5 - (annotationsBox.xMax + annotationsBox.xMin) / 2,
      0.5 - (annotationsBox.yMax + annotationsBox.yMin) / 2,
      0.5
    );

    this._lineGeometry = createLineGeometry(annotationsBox);
  }

  createGeometry(annotationsBox: AnnotationsBoundingBox): PlaneGeometry {
    return new PlaneGeometry(annotationsBox.xMax - annotationsBox.xMin, annotationsBox.yMax - annotationsBox.yMin);
  }

  getGeometry(): BufferGeometry {
    return this._geometry;
  }

  getNormalizationMatrix(): Matrix4 {
    return this._initialTranslation;
  }

  getLineGeometry(): BufferGeometry {
    return this._lineGeometry;
  }

  getOutlinePoints(): Vector2[] {
    return this._outline;
  }
}

function createLineGeometry(box: AnnotationsBoundingBox): BufferGeometry {
  const span = { x: (box.xMax - box.xMin) / 2, y: (box.yMax - box.yMin) / 2 };
  const points = [
    new Vector3(-span.x, -span.y, 0),
    new Vector3(-span.x, span.y, 0),
    new Vector3(span.x, span.y, 0),
    new Vector3(span.x, -span.y, 0),
    new Vector3(-span.x, -span.y, 0)
  ];

  return new BufferGeometry().setFromPoints(points);
}

function getBoundPoints(box: AnnotationsBoundingBox): Vector2[] {
  const span = { x: (box.xMax - box.xMin) / 2, y: (box.yMax - box.yMin) / 2 };
  return [
    new Vector2(-span.x, -span.y),
    new Vector2(-span.x, span.y),
    new Vector2(span.x, span.y),
    new Vector2(span.x, -span.y)
  ];
}

function createLine(box: AnnotationsBoundingBox): Object3D {
  const span = { x: (box.xMax - box.xMin) / 2, y: (box.yMax - box.yMin) / 2 };
  const e = 1e-4;
  const points = [
    new Vector3(-span.x, -span.y, -e),
    new Vector3(-span.x, span.y, -e),
    new Vector3(span.x, span.y, -e),
    new Vector3(span.x, -span.y, -e)
  ];

  const lines = points.map(
    (_, ind) => new ThickLine(0.002, new Color(1, 0, 0), points[ind], points[(ind + 1) % points.length])
  );

  const group = new Group();
  lines.forEach(l => group.add(l.meshes));
  return group;
}
