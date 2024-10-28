/*!
 * Copyright 2023 Cognite AS
 */

import {
  AnnotationData,
  AnnotationModel,
  AnnotationType,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationsObjectDetection
} from '@cognite/sdk';
import { DataSourceType, Image360FileDescriptor } from '@reveal/data-providers';

import {
  Color,
  Matrix4,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
  Object3D,
  Group,
  Raycaster,
  Vector2
} from 'three';
import { ImageAnnotationObjectData } from './ImageAnnotationData';
import { BoxAnnotationData } from './BoxAnnotationData';
import { PolygonAnnotationData } from './PolygonAnnotationData';
import { Image360Annotation } from './Image360Annotation';
import { Image360AnnotationAppearance } from './types';

type FaceType = Image360FileDescriptor['face'];

import { VariableWidthLine } from '@reveal/utilities';

const DEFAULT_ANNOTATION_COLOR = new Color(0.8, 0.8, 0.3);

export class ImageAnnotationObject<T extends DataSourceType> implements Image360Annotation<T> {
  private readonly _annotation: AnnotationModel;

  private readonly _mesh: Mesh;
  private readonly _meshMaterial: MeshBasicMaterial;
  private readonly _line: VariableWidthLine;
  private readonly _objectGroup: Group;

  private _defaultAppearance: Image360AnnotationAppearance = {};
  private readonly _appearance: Image360AnnotationAppearance = {};

  get annotation(): AnnotationModel {
    return this._annotation;
  }

  public static createAnnotationObject<StaticT extends DataSourceType>(
    annotation: AnnotationModel,
    face: FaceType
  ): ImageAnnotationObject<StaticT> | undefined {
    const objectData = ImageAnnotationObject.createObjectData(annotation.annotationType, annotation.data);

    if (objectData === undefined) {
      return undefined;
    }

    return new ImageAnnotationObject(annotation, face, objectData);
  }

  private static createObjectData(
    annotationType: AnnotationType,
    detection: AnnotationData
  ): ImageAnnotationObjectData | undefined {
    if (isAnnotationsObjectDetection(annotationType, detection)) {
      return this.createObjectDetectionAnnotationData(detection);
    } else if (isAnnotationAssetLink(annotationType, detection)) {
      return this.createAssetLinkAnnotationData(detection);
    } else {
      return undefined;
    }
  }

  private static createObjectDetectionAnnotationData(
    detection: AnnotationsObjectDetection
  ): ImageAnnotationObjectData | undefined {
    if (detection.polygon !== undefined) {
      return new PolygonAnnotationData(detection.polygon);
    } else if (detection.boundingBox !== undefined) {
      return new BoxAnnotationData(detection.boundingBox);
    } else {
      return undefined;
    }
  }

  private static createAssetLinkAnnotationData(
    assetLink: AnnotationsCogniteAnnotationTypesImagesAssetLink
  ): ImageAnnotationObjectData | undefined {
    // TODO: Use AssetLink region type from SDK when available (2023-15-05)
    const objectRegion = (assetLink as any).objectRegion;
    if (objectRegion === undefined) {
      return new BoxAnnotationData(assetLink.textRegion);
    }

    if (objectRegion.polygon !== undefined) {
      return new PolygonAnnotationData(objectRegion.polygon);
    } else if (objectRegion.boundingBox !== undefined) {
      return new BoxAnnotationData(objectRegion.boundingBox);
    } else {
      return undefined;
    }
  }

  private constructor(annotation: AnnotationModel, face: FaceType, objectData: ImageAnnotationObjectData) {
    this._annotation = annotation;
    this._meshMaterial = createMaterial();
    this._mesh = new Mesh(objectData.getGeometry(), this._meshMaterial);
    this._line = createOutline(objectData.getOutlinePoints(), this._meshMaterial.color);
    this._objectGroup = new Group();

    this._objectGroup.add(this._line.mesh);
    this._objectGroup.add(this._mesh);

    this.initializeTransform(face, objectData.getNormalizationMatrix());

    this._objectGroup.renderOrder = 4;
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
    this._objectGroup.matrix = transformation;
    this._objectGroup.matrixAutoUpdate = false;
    this._objectGroup.updateWorldMatrix(false, true);
  }

  public getObject(): Object3D {
    return this._objectGroup;
  }

  public intersects(raycaster: Raycaster): boolean {
    return raycaster.intersectObject(this._mesh).length > 0;
  }

  private updateMaterials(): void {
    const color = this.getColorReference();
    const visibility = this.getVisible();

    this._meshMaterial.color = color;
    this._meshMaterial.visible = visibility;
    this._meshMaterial.needsUpdate = true;

    this._line.setLineColor(color);
    this._line.setVisibility(visibility);
  }

  public setDefaultStyle(appearance: Image360AnnotationAppearance): void {
    this._defaultAppearance = appearance;
    this.updateMaterials();
  }

  private getColorReference(): Color {
    return this._appearance.color ?? this._defaultAppearance.color ?? DEFAULT_ANNOTATION_COLOR;
  }

  public getColor(): Color {
    return this.getColorReference().clone();
  }

  public setColor(color?: Color): void {
    this._appearance.color = color?.clone();
    this.updateMaterials();
  }

  public getVisible(): boolean {
    return this._appearance.visible ?? this._defaultAppearance.visible ?? true;
  }

  public setVisible(visible?: boolean): void {
    this._appearance.visible = visible;
    this.updateMaterials();
  }

  public dispose(): void {
    this._meshMaterial.dispose();
    this._mesh.geometry.dispose();

    this._line.dispose();
  }

  public getCenter(out?: Vector3): Vector3 {
    out = out ?? new Vector3();
    this._mesh.geometry.computeBoundingBox();
    return this._mesh.geometry.boundingBox!.getCenter(out).applyMatrix4(this._mesh.matrixWorld);
  }
}

function createMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: DEFAULT_ANNOTATION_COLOR,
    side: DoubleSide,
    depthTest: false,
    opacity: 0.4,
    transparent: true
  });
}

function isAnnotationsObjectDetection(
  annotationType: AnnotationType,
  annotation: AnnotationData
): annotation is AnnotationsObjectDetection {
  const detection = annotation as AnnotationsObjectDetection;
  return (
    annotationType === 'images.ObjectDetection' &&
    detection.label !== undefined &&
    (detection.boundingBox !== undefined || detection.polygon !== undefined || detection.polyline !== undefined)
  );
}

function isAnnotationAssetLink(
  annotationType: AnnotationType,
  annotation: AnnotationData
): annotation is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const link = annotation as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return annotationType === 'images.AssetLink' && link.text !== undefined && link.textRegion !== undefined;
}

function createOutline(outlinePoints: Vector2[], color: Color): VariableWidthLine {
  const e = 1e-4;

  const points = [...outlinePoints, outlinePoints[0]].map(p => new Vector3(p.x, p.y, -e));

  return new VariableWidthLine(0.002, color, points);
}
