/*!
 * Copyright 2024 Cognite AS
 */

import {
  Mesh,
  MeshPhongMaterial,
  type Object3D,
  LineSegments,
  LineBasicMaterial,
  Vector3,
  type Matrix4,
  RingGeometry,
  CircleGeometry,
  type Material,
  type Sprite
} from 'three';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { GroupThreeView } from '../../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection,
  Vector3Pool
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from '../common/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { Range1 } from '../../../base/utilities/geometry/Range1';
import {
  rotateEdgeCircle,
  updateWireframeMaterial,
  updateLineSegmentsMaterial,
  updateMarkerMaterial,
  updateSolidMaterial,
  BoxView
} from '../box/BoxView';
import { type SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { CylinderUtils } from '../../../base/utilities/primitives/CylinderUtils';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { clear } from '../../../base/utilities/extensions/arrayExtensions';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { getRoot } from '../../../base/domainObjects/getRoot';

const RELATIVE_RESIZE_RADIUS = 0.2;
const RELATIVE_MAX_RADIUS = 0.9;
const RELATIVE_ROTATION_RADIUS = new Range1(0.4, 0.7);
const CIRCULAR_SEGMENTS = 32;
const RENDER_ORDER = 100;
const TOP_FACE = new BoxFace(2);
const BOTTOM_FACE = new BoxFace(2);

export class CylinderView extends GroupThreeView<CylinderDomainObject> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _sprites: Array<Sprite | undefined> = [];

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): SolidPrimitiveRenderStyle {
    return super.style as SolidPrimitiveRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (
      change.isChanged(
        Changes.selected,
        Changes.focus,
        Changes.renderStyle,
        Changes.color,
        Changes.unit
      )
    ) {
      this.removeChildren();
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get useDepthTest(): boolean {
    const { domainObject } = this;
    if (domainObject.focusType === FocusType.Pending || domainObject.isSelected) {
      return false;
    }
    return this.style.depthTest;
  }

  protected override addChildren(): void {
    const { domainObject, style } = this;
    const matrix = this.getMatrix();

    const { focusType } = domainObject;
    if (style.showSolid) {
      this.addChild(this.createSolid(matrix));
    }
    if (style.showLines) {
      if (style.getLineWidth(domainObject.isSelected) === 1) {
        this.addChild(this.createLines(matrix));
      } else {
        this.addChild(this.createWireframe(matrix));
      }
    }
    if (showMarkers(focusType)) {
      if (domainObject.canRotate) {
        this.addChild(this.createRotationRing(matrix, TOP_FACE));
        this.addChild(this.createRotationRing(matrix, BOTTOM_FACE));
      }
      this.addEdgeCircles(matrix);
    }
    if (style.showLabel) {
      this.addLabels(matrix);
    }
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;
    if (domainObject.focusType === FocusType.Pending) {
      return undefined; // Should never be picked
    }

    const { cylinder } = domainObject;
    const centerA = cylinder.centerA.clone();
    const centerB = cylinder.centerB.clone();
    centerA.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    centerB.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const ray = intersectInput.raycaster.ray;
    const point = cylinder.intersectRay(ray, CDF_TO_VIEWER_TRANSFORMATION);
    if (point === undefined) {
      return undefined;
    }
    const matrix = this.getMatrix();

    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }
    const positionAtFace = newVector3(point).applyMatrix4(matrix.invert());
    const boxFace = new BoxFace().fromPositionAtFace(positionAtFace);

    const cdfPosition = this.renderTarget.convertFromViewerCoordinates(point);
    const focusType = this.getPickedFocusType(cdfPosition, boxFace);
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new PrimitivePickInfo(boxFace, focusType, new Vector3()),
      customObject: this,
      domainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  private getFaceRadius(): number {
    return this.domainObject.cylinder.radius / 2;
  }

  private getMatrix(): Matrix4 {
    const { domainObject } = this;
    const matrix = domainObject.cylinder.getMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  // ==================================================
  // INSTANCE METHODS: Create Object3D's
  // ==================================================

  private createSolid(matrix: Matrix4): Object3D | undefined {
    const { domainObject } = this;
    const { style } = this;

    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, domainObject, style);

    const geometry = CylinderUtils.createUnitGeometry();
    // In Three.js, the cylinder is oriented along the Y-axis, so we need to rotate it
    // so up is the Z-axis.
    geometry.applyMatrix4(this.renderTarget.fromViewerMatrix);
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = RENDER_ORDER;
    mesh.applyMatrix4(matrix);
    return mesh;
  }

  private createLines(matrix: Matrix4): Object3D | undefined {
    const { domainObject } = this;
    const { style } = this;

    const material = new LineBasicMaterial();
    updateLineSegmentsMaterial(material, domainObject, style, this.useDepthTest);
    const geometry = CylinderUtils.createLineSegmentsBufferGeometry();
    const result = new LineSegments(geometry, material);
    result.renderOrder = RENDER_ORDER;
    result.applyMatrix4(matrix);
    return result;
  }

  private createWireframe(matrix: Matrix4): Object3D | undefined {
    const { domainObject } = this;
    const { style } = this;

    const material = new LineMaterial();
    updateWireframeMaterial(material, domainObject, style, this.useDepthTest);
    const geometry = CylinderUtils.createLineSegmentsGeometry();
    const result = new Wireframe(geometry, material);
    result.renderOrder = RENDER_ORDER;
    result.applyMatrix4(matrix);
    return result;
  }

  private createRotationRing(matrix: Matrix4, face: BoxFace): Mesh | undefined {
    if (!this.isFaceVisible(face)) {
      return undefined;
    }
    const { domainObject, style } = this;
    const { focusType } = domainObject;
    const radius = this.getFaceRadius();

    const outerRadius = RELATIVE_ROTATION_RADIUS.max * 2 * radius;
    const innerRadius = RELATIVE_ROTATION_RADIUS.min * 2 * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, CIRCULAR_SEGMENTS);

    const material = new MeshPhongMaterial();
    updateMarkerMaterial(
      material,
      domainObject,
      style,
      focusType === FocusType.Rotation,
      this.useDepthTest
    );
    const result = new Mesh(geometry, material);
    result.renderOrder = RENDER_ORDER;

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    result.position.copy(center);

    const rotationMatrix = domainObject.cylinder.getRotationMatrix();
    rotationMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

    rotateEdgeCircle(result, face, rotationMatrix);
    return result;
  }

  private createEdgeCircle(matrix: Matrix4, material: Material, face: BoxFace): Mesh | undefined {
    const { domainObject } = this;
    const radius = 2 * RELATIVE_RESIZE_RADIUS * this.getFaceRadius();
    const geometry = new CircleGeometry(radius, CIRCULAR_SEGMENTS);
    material.transparent = true;
    material.depthWrite = false;
    const result = new Mesh(geometry, material);
    result.renderOrder = RENDER_ORDER;

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    result.position.copy(center);

    const rotationMatrix = domainObject.cylinder.getRotationMatrix();
    rotationMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

    rotateEdgeCircle(result, face, rotationMatrix);
    return result;
  }

  private addLabels(matrix: Matrix4): void {
    const { style } = this;

    const spriteHeight = this.getTextHeight(style.relativeTextSize);
    clear(this._sprites);
    this.addChild(this.createRadiusLabel(matrix, spriteHeight, TOP_FACE));
  }

  private getTextHeight(relativeTextSize: number): number {
    return relativeTextSize * 2 * this.domainObject.cylinder.radius;
  }

  private createRadiusLabel(
    matrix: Matrix4,
    spriteHeight: number,
    face: BoxFace
  ): Sprite | undefined {
    if (!this.isFaceVisible(face)) {
      return undefined;
    }
    const { domainObject } = this;
    const radius = domainObject.cylinder.radius;
    if (radius === 0) {
      return undefined; // Not show when about 0
    }
    const rootDomainObject = getRoot(domainObject);
    if (rootDomainObject === undefined) {
      return undefined;
    }
    const text = rootDomainObject.unitSystem.toStringWithUnit(radius, Quantity.Length);
    const sprite = BoxView.createSprite(text, this.style, spriteHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = face.getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    faceCenter.y += (1.1 * spriteHeight) / 2;

    sprite.position.copy(faceCenter);
    return sprite;
  }

  // ==================================================
  // INSTANCE METHODS: Add Object3D's
  // ==================================================

  private addEdgeCircles(matrix: Matrix4): void {
    const { domainObject, style } = this;
    let selectedFace = domainObject.focusFace;
    if (this.domainObject.focusType !== FocusType.Face) {
      selectedFace = undefined;
    }
    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, domainObject, style, false, this.useDepthTest);
    for (const boxFace of BoxFace.getAllFaces()) {
      if (!this.isFaceVisible(boxFace)) {
        continue;
      }
      if (selectedFace === undefined || !selectedFace.equals(boxFace)) {
        this.addChild(this.createEdgeCircle(matrix, material, boxFace));
      }
    }
    if (selectedFace !== undefined && this.isFaceVisible(selectedFace)) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, domainObject, style, true, this.useDepthTest);
      this.addChild(this.createEdgeCircle(matrix, material, selectedFace));
    }
  }

  // ==================================================
  // INSTANCE METHODS: For picking
  // ==================================================

  private getPickedFocusType(realPosition: Vector3, face: BoxFace): FocusType {
    const { domainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius());
    const scaledMatrix = domainObject.cylinder.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = newVector3(realPosition).applyMatrix4(scaledMatrix);
    const planePoint = face.getPlanePoint(scaledPositionAtFace);
    const relativeDistance = planePoint.length() / 2;

    if (face.index === 2) {
      if (relativeDistance < RELATIVE_RESIZE_RADIUS) {
        return FocusType.Face;
      }
      if (domainObject.canRotate && RELATIVE_ROTATION_RADIUS.isInside(relativeDistance)) {
        return FocusType.Rotation;
      }
      if (
        relativeDistance > RELATIVE_MAX_RADIUS &&
        domainObject.primitiveType === PrimitiveType.HorizontalCircle
      ) {
        // This makes it possible to pick the face at the edges, so the radius can be changed
        face.face = 0;
        return FocusType.Face;
      }
      return FocusType.Body;
    }
    return FocusType.Face;
  }

  private isFaceVisible(face: BoxFace): boolean {
    return face.index === 2; // Z Face visible only
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function showMarkers(focusType: FocusType): boolean {
  switch (focusType) {
    case FocusType.Pending:
    case FocusType.None:
      return false;
    default:
      return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
