/*!
 * Copyright 2022 Cognite AS
 */

import { AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';
import { Image360FileDescriptor } from '@reveal/data-providers';

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
    this._mesh = new Mesh(createGeometry(annotation), createMaterial());
    this.initializeMesh(annotation, fileDescriptor);

    this._annotation = annotation;
    this._fileDescriptor = fileDescriptor;
  }

  private initializeMesh(annotation: AnnotationModel, fileDescriptor: Image360FileDescriptor) {
    this.initializeTransform(annotation, fileDescriptor);
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

  private initializeTransform(annotationData: AnnotationModel, descriptor: Image360FileDescriptor): void {
    const abox = (annotationData.data as AnnotationsObjectDetection).boundingBox!;

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

function createGeometry(annotationData: AnnotationModel): PlaneGeometry {
  const abox = (annotationData.data as AnnotationsObjectDetection).boundingBox!;
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
