/*!
 * Copyright 2024 Cognite AS
 */

import {
  Mesh,
  MeshPhongMaterial,
  type Object3D,
  BoxGeometry,
  DoubleSide,
  LineSegments,
  LineBasicMaterial,
  Vector3,
  type Matrix4,
  RingGeometry,
  Color,
  type Sprite,
  type Camera,
  CircleGeometry,
  type Material,
  Plane,
  FrontSide,
  type PerspectiveCamera
} from 'three';
import { type MeasureBoxDomainObject, MIN_BOX_SIZE } from './MeasureBoxDomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type MeasureBoxRenderStyle } from './MeasureBoxRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { clear } from '../../base/utilities/extensions/arrayExtensions';
import { Vector3Pool } from '../../base/utilities/geometry/Vector3Pool';
import { createSpriteWithText } from '../../base/utilities/sprites/createSprite';
import {
  createLineSegmentsBufferGeometryForBox,
  createOrientedBox
} from '../../base/utilities/box/createLineSegmentsBufferGeometryForBox';
import { BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { Range1 } from '../../base/utilities/geometry/Range1';
import { MeasureType } from './MeasureType';

const RELATIVE_RESIZE_RADIUS = 0.15;
const RELATIVE_ROTATION_RADIUS = new Range1(0.6, 0.75);
const ARROW_AND_RING_COLOR = new Color(1, 1, 1);
const TOP_FACE = new BoxFace(2);
const CIRCULAR_SEGMENTS = 32;

export class MeasureBoxView extends GroupThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _sprites: Array<Sprite | undefined> = [];
  private readonly _visibleFaces: boolean[] = new Array(6); // Just for avoiding allocation

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get boxDomainObject(): MeasureBoxDomainObject {
    return super.domainObject as MeasureBoxDomainObject;
  }

  protected override get style(): MeasureBoxRenderStyle {
    return super.style as MeasureBoxRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this.isEmpty) {
      return;
    }
    if (
      change.isChanged(Changes.focus) ||
      change.isChanged(Changes.selected) ||
      change.isChanged(Changes.renderStyle) ||
      change.isChanged(Changes.color)
    ) {
      this.removeChildren();
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override beforeRender(camera: PerspectiveCamera): void {
    super.beforeRender(camera);
    if (this.isEmpty) {
      return;
    }
    this.updateLabels(camera);
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  protected override addChildren(): void {
    const { boxDomainObject } = this;
    const matrix = this.getMatrix();

    const { focusType } = boxDomainObject;
    this.addChild(this.createSolid(matrix));
    this.addChild(this.createLines(matrix));
    if (boxDomainObject.isSelected && showMarkers(focusType)) {
      this.addChild(this.createRotationRing(matrix));
      this.addEdgeCircles(matrix);
    }
    this.addLabels(matrix);
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { boxDomainObject } = this;
    if (boxDomainObject.focusType === BoxFocusType.Pending) {
      return undefined; // Should never be picked
    }
    const orientedBox = createOrientedBox();
    const matrix = this.getMatrix();
    orientedBox.applyMatrix4(matrix);

    const ray = intersectInput.raycaster.ray;
    const point = orientedBox.intersectRay(ray, newVector3());
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
    const positionAtFace = newVector3(point).applyMatrix4(matrix.invert());
    const boxFace = new BoxFace().fromPositionAtFace(positionAtFace);
    if (!this.isFaceVisible(boxFace)) {
      return undefined;
    }
    const cornerSign = new Vector3();
    const cdfPosition = newVector3(point).applyMatrix4(
      CDF_TO_VIEWER_TRANSFORMATION.clone().invert()
    );
    const focusType = this.getPickedFocusType(cdfPosition, boxFace, cornerSign);
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new BoxPickInfo(boxFace, focusType, cornerSign),
      customObject: this,
      domainObject: boxDomainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  private getTextHeight(relativeTextSize: number): number {
    return relativeTextSize * this.boxDomainObject.diagonal;
  }

  private getFaceRadius(boxFace: BoxFace): number {
    const { size } = this.boxDomainObject;
    const size1 = size.getComponent(boxFace.tangentIndex1);
    const size2 = size.getComponent(boxFace.tangentIndex2);
    return (size1 + size2) / 4;
  }

  private getMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const matrix = boxDomainObject.getMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  private getRotationMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const matrix = boxDomainObject.getRotationMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  // ==================================================
  // INSTANCE METHODS: Create Object3D's
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
    return result;
  }

  private createRotationLabel(matrix: Matrix4, spriteHeight: number): Sprite | undefined {
    if (!this.isFaceVisible(TOP_FACE)) {
      return undefined;
    }
    const { boxDomainObject } = this;
    const degrees = radToDeg(boxDomainObject.zRotation);
    const text = degrees.toFixed(1);
    if (text === '0.0') {
      return undefined; // Not show when about 0
    }
    const sprite = createSprite(text + '°', this.style, spriteHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = TOP_FACE.getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    faceCenter.y += spriteHeight / 2;
    sprite.position.copy(faceCenter);
    return sprite;
  }

  private createPendingLabel(matrix: Matrix4, spriteHeight: number): Sprite | undefined {
    if (!this.isFaceVisible(TOP_FACE)) {
      return undefined;
    }
    const sprite = createSprite('Pending', this.style, spriteHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = TOP_FACE.getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    faceCenter.y += spriteHeight / 2;
    sprite.position.copy(faceCenter);
    return sprite;
  }

  private createRotationRing(matrix: Matrix4): Mesh | undefined {
    if (!this.isFaceVisible(TOP_FACE)) {
      return undefined;
    }
    const { boxDomainObject, style } = this;
    const { focusType } = boxDomainObject;
    const radius = this.getFaceRadius(TOP_FACE);

    const outerRadius = RELATIVE_ROTATION_RADIUS.max * radius;
    const innerRadius = RELATIVE_ROTATION_RADIUS.min * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, CIRCULAR_SEGMENTS);

    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, boxDomainObject, style, focusType === BoxFocusType.RotationRing);
    material.clippingPlanes = this.createClippingPlanes(matrix, TOP_FACE.index);
    const mesh = new Mesh(geometry, material);

    const center = TOP_FACE.getCenter(newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);
    mesh.rotateX(-Math.PI / 2);
    return mesh;
  }

  private createEdgeCircle(matrix: Matrix4, material: Material, face: BoxFace): Mesh | undefined {
    const { boxDomainObject } = this;
    const adjecentSize1 = boxDomainObject.size.getComponent(face.tangentIndex1);
    if (adjecentSize1 <= MIN_BOX_SIZE) {
      return undefined;
    }
    const adjecentSize2 = boxDomainObject.size.getComponent(face.tangentIndex2);
    if (adjecentSize2 <= MIN_BOX_SIZE) {
      return undefined;
    }
    const radius = RELATIVE_RESIZE_RADIUS * this.getFaceRadius(face);
    const geometry = new CircleGeometry(radius, CIRCULAR_SEGMENTS);
    material.transparent = true;
    material.depthWrite = false;
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);

    // Must be roteted correctly because of sideness
    if (face.face === 2) {
      mesh.rotateX(-Math.PI / 2);
    } else if (face.face === 5) {
      mesh.rotateX(Math.PI / 2);
    } else if (face.face === 0) {
      mesh.rotateY(Math.PI / 2 + boxDomainObject.zRotation);
    } else if (face.face === 3) {
      mesh.rotateY(-Math.PI / 2 + boxDomainObject.zRotation);
    } else if (face.face === 1) {
      mesh.rotateY(Math.PI + boxDomainObject.zRotation);
    } else if (face.face === 4) {
      mesh.rotateY(boxDomainObject.zRotation);
    }
    return mesh;
  }

  private createClippingPlanes(matrix: Matrix4, faceIndex: number): Plane[] {
    const planes: Plane[] = [];

    for (const boxFace of BoxFace.getAllFaces()) {
      if (boxFace.index === faceIndex) {
        continue;
      }
      const center = boxFace.getCenter(newVector3());
      const normal = boxFace.getNormal(newVector3()).negate();
      const plane = new Plane().setFromNormalAndCoplanarPoint(normal, center);
      plane.applyMatrix4(matrix);
      planes.push(plane);
    }
    return planes;
  }

  // ==================================================
  // INSTANCE METHODS: Add Object3D's
  // ==================================================

  private addLabels(matrix: Matrix4): void {
    const { boxDomainObject, style } = this;
    const spriteHeight = this.getTextHeight(style.relativeTextSize);
    clear(this._sprites);
    for (let index = 0; index < 3; index++) {
      const size = boxDomainObject.size.getComponent(index);
      if (size <= MIN_BOX_SIZE) {
        this._sprites.push(undefined);
        continue;
      }
      const sprite = createSprite(size.toFixed(2), style, spriteHeight);
      if (sprite === undefined) {
        this._sprites.push(undefined);
        continue;
      }
      this._sprites.push(sprite);
      this.addChild(sprite);
    }
    this.updateLabels(this.renderTarget.camera);
    const { focusType } = boxDomainObject;
    if (focusType === BoxFocusType.Pending && boxDomainObject.hasArea) {
      this.addChild(this.createPendingLabel(matrix, spriteHeight));
    } else if (showRotationLabel(focusType)) {
      this.addChild(this.createRotationLabel(matrix, spriteHeight));
    }
  }

  private updateLabels(camera: Camera): void {
    const { boxDomainObject, style } = this;
    const matrix = this.getMatrix();

    const rotationMatrix = this.getRotationMatrix();
    const centerOfBox = newVector3(boxDomainObject.center);
    centerOfBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const cameraPosition = camera.getWorldPosition(newVector3());
    const cameraDirection = centerOfBox.sub(cameraPosition).normalize();

    // Calculate which face of the box are visible
    const boxFace = new BoxFace(); // Due to reuse in both loops
    const visibleFaces = this._visibleFaces;
    for (const face of BoxFace.getAllFaces(boxFace)) {
      const normal = boxFace.getNormal(newVector3());
      normal.applyMatrix4(rotationMatrix);
      visibleFaces[face.face] = normal.dot(cameraDirection) < 0;
    }
    const spriteHeight = this.getTextHeight(style.relativeTextSize);

    // If the 2 adjecent faces are visible, show the sprite along the edge
    for (let index = 0; index < this._sprites.length; index++) {
      const sprite = this._sprites[index];
      if (sprite === undefined) {
        continue;
      }
      sprite.visible = false;
      for (let i = 0; i < 2; i++) {
        const face1 = (index + (i === 0 ? 1 : 4)) % 6;
        if (!visibleFaces[face1]) {
          continue;
        }
        boxFace.face = face1;
        const showFace1 = this.isFaceVisible(boxFace);
        const faceCenter1 = boxFace.getCenter(newVector3());
        for (let j = 0; j < 2; j++) {
          const face2 = (index + (j === 0 ? 2 : 5)) % 6;
          if (!visibleFaces[face2]) {
            continue;
          }
          boxFace.face = face2;
          if (!showFace1 && !this.isFaceVisible(boxFace)) {
            continue;
          }
          const faceCenter2 = boxFace.getCenter(newVector3());
          const edgeCenter = faceCenter2.add(faceCenter1);
          edgeCenter.applyMatrix4(matrix);
          edgeCenter.y += spriteHeight / 2;

          // Move the sprite slightly away from the box to avoid z-fighting
          edgeCenter.addScaledVector(cameraDirection, -spriteHeight / 4);
          sprite.position.copy(edgeCenter);
          sprite.visible = true;
          break;
        }
        if (sprite.visible) {
          break;
        }
      }
    }
  }

  private addEdgeCircles(matrix: Matrix4): void {
    const { boxDomainObject, style } = this;
    let selectedFace = boxDomainObject.focusFace;
    if (this.boxDomainObject.focusType !== BoxFocusType.Face) {
      selectedFace = undefined;
    }
    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, boxDomainObject, style, false);
    for (const boxFace of BoxFace.getAllFaces()) {
      if (!this.isFaceVisible(boxFace)) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (selectedFace === undefined || !selectedFace.equals(boxFace)) {
        this.addChild(this.createEdgeCircle(matrix, material, boxFace));
      }
    }
    if (selectedFace !== undefined && this.isFaceVisible(selectedFace)) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, boxDomainObject, style, true);
      this.addChild(this.createEdgeCircle(matrix, material, selectedFace));
    }
  }

  // ==================================================
  // INSTANCE METHODS: For picking
  // ==================================================

  private getPickedFocusType(
    realPosition: Vector3,
    boxFace: BoxFace,
    outputCornerSign: Vector3
  ): BoxFocusType {
    const { boxDomainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(boxFace));
    const scaledMatrix = boxDomainObject.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = newVector3(realPosition).applyMatrix4(scaledMatrix);
    const planePoint = boxFace.getPlanePoint(scaledPositionAtFace);
    const relativeDistance = planePoint.length();

    outputCornerSign.copy(this.getCornerSign(realPosition, boxFace));
    const corner = this.getCorner(outputCornerSign, boxFace);

    if (relativeDistance < RELATIVE_RESIZE_RADIUS) {
      return BoxFocusType.Face;
    }
    if (realPosition.distanceTo(corner) < 0.2 * this.getFaceRadius(boxFace)) {
      return BoxFocusType.Corner;
    }
    if (boxFace.face === 2) {
      if (RELATIVE_ROTATION_RADIUS.isInside(relativeDistance)) {
        return BoxFocusType.RotationRing;
      }
    }
    return BoxFocusType.Body;
  }

  private getCornerSign(realPosition: Vector3, boxFace: BoxFace): Vector3 {
    const { boxDomainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(boxFace));
    const scaledMatrix = boxDomainObject.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = realPosition.clone().applyMatrix4(scaledMatrix);
    scaledPositionAtFace.setComponent(boxFace.index, 0);
    scaledPositionAtFace.setComponent(
      boxFace.tangentIndex1,
      Math.sign(scaledPositionAtFace.getComponent(boxFace.tangentIndex1))
    );
    scaledPositionAtFace.setComponent(
      boxFace.tangentIndex2,
      Math.sign(scaledPositionAtFace.getComponent(boxFace.tangentIndex2))
    );
    return scaledPositionAtFace;
  }

  private getCorner(cornerSign: Vector3, boxFace: BoxFace): Vector3 {
    const { boxDomainObject } = this;
    const center = boxFace.getCenter(new Vector3()); // In range (-0.5, 0.5)
    const corner = center.addScaledVector(cornerSign, 0.5);
    const matrix = boxDomainObject.getMatrix();
    corner.applyMatrix4(matrix);
    return corner;
  }

  private isFaceVisible(boxFace: BoxFace): boolean {
    const { boxDomainObject } = this;
    switch (boxDomainObject.measureType) {
      case MeasureType.VerticalArea:
        return boxFace.index === 1; // Y Face visible

      case MeasureType.HorizontalArea:
        return boxFace.index === 2; // Z face visible
    }
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function showRotationLabel(focusType: BoxFocusType): boolean {
  switch (focusType) {
    case BoxFocusType.Face:
    case BoxFocusType.Body:
    case BoxFocusType.Pending:
      return false;
    default:
      return true;
  }
}

function showMarkers(focusType: BoxFocusType): boolean {
  switch (focusType) {
    case BoxFocusType.Pending:
      return false;
    default:
      return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: MeasureBoxDomainObject,
  style: MeasureBoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  const selected = boxDomainObject.isSelected;
  const opacity = selected ? style.opacity : style.opacity / 2;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.opacityUse ? opacity : 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

function updateLineSegmentsMaterial(
  material: LineBasicMaterial,
  boxDomainObject: MeasureBoxDomainObject,
  style: MeasureBoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

function updateMarkerMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: MeasureBoxDomainObject,
  style: MeasureBoxRenderStyle,
  selected: boolean
): void {
  material.color = ARROW_AND_RING_COLOR;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.transparent = true;
  material.emissive = ARROW_AND_RING_COLOR;
  material.emissiveIntensity = selected ? 0.8 : 0.3;
  material.side = FrontSide;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

// ==================================================
// PRIVATE FUNCTIONS: Create object3D's
// ==================================================

function createSprite(
  text: string,
  style: MeasureBoxRenderStyle,
  height: number
): Sprite | undefined {
  const result = createSpriteWithText(text, height, style.textColor, style.textBgColor);
  if (result === undefined) {
    return undefined;
  }
  result.material.depthTest = true;
  result.material.transparent = true;
  result.material.opacity = 0.75;
  result.material.depthTest = style.depthTest;
  return result;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
