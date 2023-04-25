/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationData, AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';
import { Image360FileDescriptor } from '@reveal/data-providers';
import assert from 'assert';

import { Color, Matrix4, Vector3, Mesh, MeshBasicMaterial, DoubleSide, Object3D } from 'three';
import { ImageAnnotationObjectData } from './ImageAnnotationData';
import { BoxAnnotationData } from './BoxAnnotationData';
import { PolygonAnnotationData } from './PolygonAnnotationData';

type FaceType = Image360FileDescriptor['face'];

import SeededRandom from 'random-seed';

export class ImageAnnotationObject {
  private readonly _annotation: AnnotationModel;

  private readonly _mesh: Mesh;

  get annotation(): AnnotationModel {
    return this._annotation;
  }

  public static createAnnotationObject(annotation: AnnotationModel, face: FaceType): ImageAnnotationObject | undefined {
    const detection = annotation.data;
    assert(isAnnotationsObject(detection));

    let objectData: ImageAnnotationObjectData;

    if (detection.boundingBox !== undefined) {
      objectData = new BoxAnnotationData(detection);
    } else if (detection.polygon !== undefined) {
      objectData = new PolygonAnnotationData(detection);
    } else {
      return undefined;
    }

    return new ImageAnnotationObject(annotation, face, objectData);
  }

  private constructor(annotation: AnnotationModel, face: FaceType, objectData: ImageAnnotationObjectData) {
    this._annotation = annotation;
    this._mesh = new Mesh(objectData.getGeometry(), createMaterial(annotation));

    this.initializeTransform(face, objectData.getNormalizationMatrix());
    this._mesh.renderOrder = 4;
  }

  private getRotationFromFace(face: FaceType): Matrix4 {
    switch (face) {
      case 'front':
        return new Matrix4().identity();
      case 'back':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), Math.PI);
      case 'left':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), Math.PI / 2);
      case 'right':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), -Math.PI / 2);
      case 'top':
        return new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI / 2);
      case 'bottom':
        return new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / 2);
      default:
        throw Error(`Unrecognized face identifier "${face}"`);
    }
  }

  private initializeTransform(face: FaceType, normalizationTransform: Matrix4): void {
    const rotationMatrix = this.getRotationFromFace(face);

    const transformation = rotationMatrix.clone().multiply(normalizationTransform);
    this._mesh.matrix = transformation;
    this._mesh.matrixAutoUpdate = false;
  }

  public getObject(): Object3D {
    return this._mesh;
  }
}

function createMaterial(annotation: AnnotationModel): MeshBasicMaterial {
  const random = SeededRandom.create((annotation.data as AnnotationsObjectDetection).label);

  return new MeshBasicMaterial({
    color: new Color(random.floatBetween(0, 1), random.floatBetween(0, 1), random.floatBetween(0, 1))
      .multiplyScalar(0.7)
      .addScalar(0.3),
    side: DoubleSide,
    depthTest: false,
    opacity: 0.7,
    transparent: true
  });
}

function isAnnotationsObject(annotation: AnnotationData): annotation is AnnotationsObjectDetection {
  const detection = annotation as AnnotationsObjectDetection;
  return (
    detection.label !== undefined &&
    (detection.boundingBox !== undefined || detection.polygon !== undefined || detection.polyline !== undefined)
  );
}
