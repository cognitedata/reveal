/*!
 * Copyright 2022 Cognite AS
 */

import { AnnotationData, AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';
import { Image360FileDescriptor } from '@reveal/data-providers';
import assert from 'assert';

import { Matrix4, Vector3, Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, Object3D } from 'three';

export class ImageAnnotationObject {
  private readonly _annotation: AnnotationModel;
  private readonly _fileDescriptor: Image360FileDescriptor;

  private readonly _mesh: Mesh;

  get annotation(): AnnotationModel {
    return this._annotation;
  }

  get face(): Image360FileDescriptor['face'] {
    return this._fileDescriptor.face;
  }

  constructor(annotation: AnnotationModel, fileDescriptor: Image360FileDescriptor) {
    const annotationData = annotation.data;
    assert(isAnnotationsObject(annotationData));

    this._mesh = new Mesh(createGeometry(annotationData), createMaterial());
    this.initializeMesh(annotationData, fileDescriptor);

    this._annotation = annotation;
    this._fileDescriptor = fileDescriptor;
  }

  private initializeMesh(annotationData: AnnotationsObjectDetection, fileDescriptor: Image360FileDescriptor) {
    this.initializeTransform(annotationData, fileDescriptor);
    this._mesh.renderOrder = 4;
  }

  private getRotationFromFace(face: Image360FileDescriptor['face']): Matrix4 {
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

  private initializeTransform(annotationData: AnnotationsObjectDetection, descriptor: Image360FileDescriptor): void {
    const abox = annotationData.boundingBox!;

    const rotationMatrix = this.getRotationFromFace(descriptor.face);

    const initialTranslation = new Matrix4().makeTranslation(
      0.5 - (abox.xMax + abox.xMin) / 2,
      0.5 - (abox.yMax + abox.yMin) / 2,
      0.5
    );

    const transformation = initialTranslation.clone().premultiply(rotationMatrix);
    this._mesh.matrix = transformation;
    this._mesh.matrixAutoUpdate = false;
  }

  public getObject(): Object3D {
    return this._mesh;
  }
}

function createGeometry(annotationData: AnnotationsObjectDetection): PlaneGeometry {
  const abox = annotationData.boundingBox!;
  return new PlaneGeometry(abox.xMax - abox.xMin, abox.yMax - abox.yMin);
}

function createMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: 0xffff00,
    side: DoubleSide,
    depthTest: false,
    opacity: 0.5,
    transparent: true
  });
}

export function isAnnotationsObject(annotation: AnnotationData): annotation is AnnotationsObjectDetection {
  const detection = annotation as AnnotationsObjectDetection;
  return (
    detection.label !== undefined &&
    (detection.boundingBox !== undefined || detection.polygon !== undefined || detection.polyline !== undefined)
  );
}
