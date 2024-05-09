/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  Mesh,
  MeshPhongMaterial,
  Object3D,
  BoxGeometry,
  DoubleSide,
  LineSegments,
  LineBasicMaterial,
  Vector3,
  ArrowHelper,
  Matrix4,
  RingGeometry,
  Color,
  Sprite,
  Camera,
  CircleGeometry,
  Material
} from 'three';
import { BoxDomainObject } from './BoxDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxRenderStyle } from './BoxRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  CustomObjectIntersectInput,
  CustomObjectIntersection
} from '@cognite/reveal';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { clear } from '../../base/utilities/extensions/arrayExtensions';
import { Vector3Pool } from '../../base/utilities/geometry/Vector3Pool';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';
import { createSpriteWithText } from '../../base/utilities/sprites/createSprite';
import {
  createLineSegmentsBufferGeometryForBox,
  createOrientedBox
} from '../../base/utilities/box/createLineSegmentsBufferGeometryForBox';
import { isInside } from '../../base/utilities/extensions/mathExtensions';
import { BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';

const RELATIVE_HEAD_LENGTH = 0.25;
const RELATIVE_INNER_RADIUS = 0.85;
const RELATIVE_OUTER_RADIUS = 0.95;
const RELATIVE_RESIZE_RADIUS = 0.15;

const ARROW_AND_RING_COLOR = new Color(1, 1, 1);
const LABEL_BG_COLOR = new Color().setScalar(0.05);
export class BoxThreeView extends GroupThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _labels: Sprite[] = [];
  private readonly _vectorPool = new Vector3Pool();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get boxDomainObject(): BoxDomainObject {
    return super.domainObject as BoxDomainObject;
  }

  protected get style(): BoxRenderStyle {
    return super.style as BoxRenderStyle;
  }

  private newVector3(copyFrom?: Vector3): Vector3 {
    return this._vectorPool.getNext(copyFrom);
  }

  private getLabelHeight(): number {
    return 0.05 * Math.sqrt(this.boxDomainObject.area);
  }

  private getFaceRadius(face: BoxFace): number {
    const { size } = this.boxDomainObject;
    const size1 = size.getComponent(face.tangentIndex1);
    const size2 = size.getComponent(face.tangentIndex2);
    return Math.max(size1, size2) / 2;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this.isEmpty) {
      return;
    }
    if (change.isChanged(Changes.renderStyle) || change.isChanged(Changes.color)) {
      const mesh = this.object as Mesh;
      if (mesh !== undefined) {
        updateSolidMaterial(mesh.material as MeshPhongMaterial, this.boxDomainObject, this.style);
        this.invalidateRenderTarget();
      }
    }
    if (change.isChanged(Changes.focus)) {
      this.removeChildren();
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  protected override addChildren(): void {
    const { boxDomainObject } = this;
    const matrix = this.getCombinedMatrix();

    const focusType = boxDomainObject.focusType;
    if (focusType !== BoxFocusType.None) {
      this.addChild(this.createSolid(matrix));
    }
    this.addChild(this.createLines(matrix));

    if (focusType !== BoxFocusType.None) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, boxDomainObject);
      this.addChild(this.createRotationCircle(matrix, material));
      this.addResizeCircles(matrix, material);
    }
    this.addLabels(matrix);
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const orientedBox = createOrientedBox();

    const matrix = this.getCombinedMatrix();
    orientedBox.applyMatrix4(matrix);

    const ray = intersectInput.raycaster.ray;
    const point = orientedBox.intersectRay(ray, this.newVector3());
    if (point === null) {
      return undefined;
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (!intersectInput.isVisible(point)) {
      return undefined;
    }
    matrix.invert();
    const positionAtFace = this.newVector3(point).applyMatrix4(matrix);
    const face = new BoxFace().fromPositionAtFace(positionAtFace);

    const { boxDomainObject } = this;

    const scale = this.newVector3().setScalar(this.getFaceRadius(face));
    const scaledMatrix = boxDomainObject.getScaledMatrix(scale);
    scaledMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    const scaledPositionAtFace = this.newVector3(point).applyMatrix4(matrix);
    const planePoint = face.getPlanePoint(scaledPositionAtFace);

    const relativeDistance = planePoint.length() * 2;
    let focusType: BoxFocusType;
    if (face.face === 2 && relativeDistance < RELATIVE_RESIZE_RADIUS) {
      focusType = BoxFocusType.Scale;
    } else if (isInside(RELATIVE_INNER_RADIUS, relativeDistance, RELATIVE_OUTER_RADIUS)) {
      focusType = BoxFocusType.Rotate;
    } else {
      focusType = BoxFocusType.Translate;
    }

    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new BoxPickInfo(face, focusType),
      customObject: this,
      domainObject: this.domainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createSolid(matrix: Matrix4): Object3D | undefined {
    const { boxDomainObject } = this;
    const { style } = this;

    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, boxDomainObject, style);
    const geometry = new BoxGeometry(1, 1, 1);
    const result = new Mesh(geometry, material);
    result.applyMatrix4(matrix);
    return result;
  }

  private createLines(matrix: Matrix4): Object3D | undefined {
    const { boxDomainObject } = this;
    const { style } = this;

    const material = new LineBasicMaterial();
    updateLineSegmentsMaterial(material, boxDomainObject, style);
    const geometry = createLineSegmentsBufferGeometryForBox();
    const result = new LineSegments(geometry, material);

    result.applyMatrix4(matrix);
    result.onBeforeRender = this.onBeforeRender;
    return result;
  }

  private addLabels(matrix: Matrix4): void {
    const labelHeight = this.getLabelHeight();
    clear(this._labels);
    for (let index = 0; index < 3; index++) {
      const label = this.createLabel(index, matrix, labelHeight);
      if (label === undefined) {
        return;
      }
      this._labels.push(label);
      this.addChild(label);
    }
    this.updateLabels(this.renderTarget.camera);
  }

  private createLabel(index: number, matrix: Matrix4, labelHeight: number): Sprite | undefined {
    const { boxDomainObject } = this;

    const label = boxDomainObject.size.getComponent(index).toFixed(2);
    const result = createSpriteWithText(label, labelHeight, WHITE_COLOR, LABEL_BG_COLOR);
    if (result === undefined) {
      return undefined;
    }
    result.renderOrder = 3;
    result.material.depthTest = true;
    result.material.transparent = true;
    result.material.opacity = 0.75;
    return result;
  }

  private readonly onBeforeRender = (_1: any, _2: any, camera: Camera): void => {
    this.updateLabels(camera);
  };

  private updateLabels(camera: Camera): void {
    const { boxDomainObject } = this;
    const matrix = this.getCombinedMatrix();

    const rotationMatrix = boxDomainObject.getRotationMatrix();
    rotationMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

    const centerOfBox = this.newVector3(boxDomainObject.center);
    centerOfBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const cameraPosition = camera.getWorldPosition(this.newVector3());
    const cameraDirection = centerOfBox.sub(cameraPosition).normalize();

    // Calculate which face of the box are visible
    const visibleFaces: boolean[] = new Array(6).fill(false);
    const boxFace = new BoxFace();
    for (boxFace.face = 0; boxFace.face < visibleFaces.length; boxFace.face++) {
      const normal = boxFace.getNormal(this.newVector3());
      normal.applyMatrix4(rotationMatrix);
      visibleFaces[boxFace.face] = normal.dot(cameraDirection) < 0;
    }
    // If the 2 adjecent faces are visible, show the label along the edge
    for (let index = 0; index < this._labels.length; index++) {
      const label = this._labels[index];
      label.visible = false;

      for (let i = 0; i < 2; i++) {
        const face1 = (index + (i === 0 ? 1 : 4)) % 6;
        if (!visibleFaces[face1]) {
          continue;
        }
        boxFace.face = face1;
        const faceCenter1 = boxFace.getCenter(this.newVector3());
        for (let j = 0; j < 2; j++) {
          const face2 = (index + (j === 0 ? 2 : 5)) % 6;
          if (!visibleFaces[face2]) {
            continue;
          }
          boxFace.face = face2;
          const faceCenter2 = boxFace.getCenter(this.newVector3());
          const edgeCenter = faceCenter2.add(faceCenter1);
          edgeCenter.applyMatrix4(matrix);
          label.position.copy(edgeCenter);
          label.visible = true;
          break;
        }
        if (label.visible) {
          break;
        }
      }
    }
  }

  private addArrows(matrix: Matrix4): void {
    const { boxDomainObject } = this;

    // Add the arrows
    const face = boxDomainObject.focusFace;
    if (face === undefined) {
      return;
    }
    const center = face.getCenter(this.newVector3());
    center.applyMatrix4(matrix);
    const arrowSize = getArrowSize();

    const rotationMatrix = boxDomainObject.getRotationMatrix();
    if (boxDomainObject.focusType === BoxFocusType.Translate) {
      this.addArrow(face.getTangent1(this.newVector3()), center, arrowSize, rotationMatrix);
      this.addArrow(face.getTangent2(this.newVector3()), center, arrowSize, rotationMatrix);
    } else if (boxDomainObject.focusType === BoxFocusType.Scale) {
      this.addArrow(face.getNormal(this.newVector3()), center, arrowSize, rotationMatrix);
    }

    function getArrowSize(): number {
      return Math.sqrt(boxDomainObject.area) / 4;
    }
  }

  private addArrow(
    direction: Vector3,
    center: Vector3,
    size: number,
    rotationMatrix: Matrix4
  ): void {
    direction.applyMatrix4(rotationMatrix);
    direction.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    direction.normalize();

    const headLength = size * RELATIVE_HEAD_LENGTH;
    const headWidth = size * RELATIVE_HEAD_LENGTH;
    const color = ARROW_AND_RING_COLOR;
    const arrow1 = new ArrowHelper(direction, center, size, color, headLength, headWidth);

    direction.negate();
    this.addChild(arrow1);

    const arrow2 = new ArrowHelper(direction, center, size, color, headLength, headWidth);
    this.addChild(arrow2);
  }

  private createRotationCircle(matrix: Matrix4, material: Material): Mesh {
    const face = new BoxFace(2);
    const radius = this.getFaceRadius(face);

    const outerRadius = RELATIVE_OUTER_RADIUS * radius;
    const innerRadius = RELATIVE_INNER_RADIUS * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, 32);
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter(this.newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);
    mesh.rotateX(Math.PI / 2);
    return mesh;
  }

  protected addResizeCircles(matrix: Matrix4, material: Material): void {
    const boxFace = new BoxFace();
    for (boxFace.face = 0; boxFace.face < 6; boxFace.face++) {
      this.addChild(this.createResizeCircle(matrix, material, boxFace));
    }
  }

  private createResizeCircle(matrix: Matrix4, material: Material, face: BoxFace): Mesh {
    const { boxDomainObject } = this;

    const radius = RELATIVE_RESIZE_RADIUS * this.getFaceRadius(face);

    const geometry = new CircleGeometry(radius, 32);
    material.transparent = true;
    material.depthWrite = false;
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter(this.newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);
    if (face.face % 3 === 2) {
      mesh.rotateX(Math.PI / 2);
    } else if (face.face % 3 === 0) {
      mesh.rotateY(Math.PI / 2 + boxDomainObject.zRotation);
    } else {
      mesh.rotateY(boxDomainObject.zRotation);
    }
    return mesh;
  }

  private getCombinedMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const combinedMatrix = boxDomainObject.getMatrix();
    combinedMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return combinedMatrix;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.polygonOffset = boxDomainObject.hasFocus;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.opacityUse ? style.opacity : 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
  material.depthWrite = false;
}

function updateLineSegmentsMaterial(
  material: LineBasicMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.transparent = true;
  material.depthWrite = false;
}

function updateMarkerMaterial(material: MeshPhongMaterial, boxDomainObject: BoxDomainObject): void {
  material.color = ARROW_AND_RING_COLOR;
  material.polygonOffset = boxDomainObject.hasFocus;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.transparent = true;
  material.emissive = ARROW_AND_RING_COLOR;
  material.emissiveIntensity = 0.4;
  material.side = DoubleSide;
  material.flatShading = true;
  material.depthWrite = false;
}
