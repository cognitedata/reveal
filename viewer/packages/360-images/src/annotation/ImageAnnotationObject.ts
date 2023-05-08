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
import { Image360Annotation } from './Image360Annotation';
import { Image360AnnotationAppearance } from './types';

type FaceType = Image360FileDescriptor['face'];

import SeededRandom from 'random-seed';

export class ImageAnnotationObject implements Image360Annotation {
  private readonly _annotation: AnnotationModel;

  private readonly _mesh: Mesh;
  private readonly _material: MeshBasicMaterial;

  private _defaultAppearance: Image360AnnotationAppearance = {};
  private readonly _appearance: Image360AnnotationAppearance = {};

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
    this._material = createMaterial(annotation);
    this._mesh = new Mesh(objectData.getGeometry(), this._material);

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
    this._mesh.updateWorldMatrix(false, false);
  }

  public getObject(): Object3D {
    return this._mesh;
  }

  public updateMaterial(): void {
    this._material.color = this._defaultAppearance.color ?? getDefaultColor(this._annotation);
    this._material.visible = this._defaultAppearance.visible ?? true;

    if (this._appearance.color !== undefined) {
      this._material.color = this._appearance.color;
    }

    if (this._appearance.visible !== undefined) {
      this._material.visible = this._appearance.visible;
    }

    this._material.needsUpdate = true;
  }

  public setDefaultStyle(appearance: Image360AnnotationAppearance): void {
    this._defaultAppearance = appearance;
    this.updateMaterial();
  }

  public setColor(color?: Color): void {
    this._appearance.color = color;
    this.updateMaterial();
  }

  public setVisible(visible?: boolean): void {
    this._appearance.visible = visible;
    this.updateMaterial();
  }
}

function createMaterial(annotation: AnnotationModel): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: getDefaultColor(annotation),
    side: DoubleSide,
    depthTest: false,
    opacity: 0.7,
    transparent: true
  });
}

function getDefaultColor(annotation: AnnotationModel): Color {
  const random = SeededRandom.create((annotation.data as AnnotationsObjectDetection).label);
  return new Color(random.floatBetween(0, 1), random.floatBetween(0, 1), random.floatBetween(0, 1))
    .multiplyScalar(0.7)
    .addScalar(0.3);
}

function isAnnotationsObject(annotation: AnnotationData): annotation is AnnotationsObjectDetection {
  const detection = annotation as AnnotationsObjectDetection;
  return (
    detection.label !== undefined &&
    (detection.boundingBox !== undefined || detection.polygon !== undefined || detection.polyline !== undefined)
  );
}
