import {
  Mesh,
  MeshPhongMaterial,
  type Object3D,
  LineSegments,
  LineBasicMaterial,
  type Vector3,
  type Matrix4,
  RingGeometry,
  CircleGeometry,
  type Material,
  type Sprite,
  type PerspectiveCamera
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
  createSprite
} from '../box/BoxView';
import { type SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { CylinderUtils } from '../../../base/utilities/primitives/CylinderUtils';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';

const RELATIVE_RESIZE_RADIUS = 0.2;
const RELATIVE_MAX_RADIUS = 0.9;
const RELATIVE_ROTATION_RADIUS = new Range1(0.4, 0.7);
const CIRCULAR_SEGMENTS = 32;
const LABEL_PADDING_FACTOR = 1.1;
const SMALL_SIZE_TOLERANCE_FACTOR = 0.99;

const HEIGHT_LABEL = 'HeightLabel';
const RADIUS_LABEL_A = 'RadiusLabelA';
const RADIUS_LABEL_B = 'RadiusLabelB';
const DIAMETER_LABEL = 'DiameterLabel';

const RENDER_ORDER = 100;
const LABEL_RENDER_ORDER = 101;

export class CylinderView extends GroupThreeView<CylinderDomainObject> {
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
      if (domainObject.canMoveCaps) {
        this.addChild(this.createRotationRing(matrix, new BoxFace(2)));
        this.addChild(this.createRotationRing(matrix, new BoxFace(5)));
      }
      this.addEdgeCircles(matrix);
    }
    if (style.showLabel) {
      this.addLabels();
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
      userData: new PrimitivePickInfo(boxFace, focusType),
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
    if (!isFaceVisible(face)) {
      return undefined;
    }
    const { domainObject } = this;
    const { focusType } = domainObject;
    const radius = this.getFaceRadius();

    const outerRadius = RELATIVE_ROTATION_RADIUS.max * 2 * radius;
    const innerRadius = RELATIVE_ROTATION_RADIUS.min * 2 * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, CIRCULAR_SEGMENTS);

    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, focusType === FocusType.Rotation, this.useDepthTest);
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

  // ==================================================
  // INSTANCE METHODS: Add Object3D's
  // ==================================================

  private addEdgeCircles(matrix: Matrix4): void {
    const { domainObject } = this;
    let selectedFace = domainObject.focusFace;
    if (this.domainObject.focusType !== FocusType.Face) {
      selectedFace = undefined;
    }
    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, false, this.useDepthTest);
    for (const boxFace of BoxFace.getAllFaces()) {
      if (!isFaceVisible(boxFace)) {
        continue;
      }
      if (selectedFace === undefined || !selectedFace.equals(boxFace)) {
        this.addChild(this.createEdgeCircle(matrix, material, boxFace));
      }
    }
    if (selectedFace !== undefined && isFaceVisible(selectedFace)) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, true, this.useDepthTest);
      this.addChild(this.createEdgeCircle(matrix, material, selectedFace));
    }
  }

  // ==================================================
  // INSTANCE METHODS: Labels
  // ==================================================

  private addLabels(): void {
    const type = this.domainObject.primitiveType;
    if (
      type === PrimitiveType.VerticalCylinder ||
      type === PrimitiveType.HorizontalCircle ||
      type === PrimitiveType.HorizontalCylinder
    ) {
      this.addChild(this.createRadiusLabel(RADIUS_LABEL_B));
      this.addChild(this.createRadiusLabel(RADIUS_LABEL_A));
    }
    if (type === PrimitiveType.VerticalCylinder || type === PrimitiveType.HorizontalCylinder) {
      this.addChild(this.createHeightLabel(HEIGHT_LABEL));
    }
    if (type === PrimitiveType.Diameter) {
      this.addChild(this.createDiameterLabel(DIAMETER_LABEL));
    }
  }

  private createRadiusLabel(name: string): Sprite | undefined {
    const value = this.domainObject.cylinder.radius;
    if (value < Cylinder.MinSize * SMALL_SIZE_TOLERANCE_FACTOR) {
      return undefined; // Not show when about 0
    }
    const labelHeight = this.getRadiusLabelHeight();
    return this.createLabel(name, value, labelHeight);
  }

  private createDiameterLabel(name: string): Sprite | undefined {
    const labelHeight = this.getDiameterLabelHeight();
    return this.createLabel(name, this.domainObject.cylinder.diameter, labelHeight);
  }

  private createHeightLabel(name: string): Sprite | undefined {
    const value = this.domainObject.cylinder.height;
    if (value < Cylinder.MinSize * SMALL_SIZE_TOLERANCE_FACTOR) {
      return undefined; // Not show when about 0
    }
    const labelHeight = this.getHeightLabelHeight();
    return this.createLabel(name, value, labelHeight);
  }

  private getRadiusLabelHeight(): number {
    const { style, domainObject } = this;
    return 4 * style.relativeTextSize * domainObject.cylinder.radius;
  }

  private getHeightLabelHeight(): number {
    const { style, domainObject } = this;
    return style.relativeTextSize * domainObject.cylinder.height;
  }

  private getDiameterLabelHeight(): number {
    const { style, domainObject } = this;
    return style.relativeTextSize * domainObject.cylinder.diameter;
  }

  private createLabel(name: string, value: number, labelHeight: number): Sprite {
    const text = this.getUnitSystem().toStringWithUnit(value, Quantity.Length);
    const sprite = createSprite(text, this.style, labelHeight);
    sprite.name = name;
    sprite.renderOrder = LABEL_RENDER_ORDER;
    return sprite;
  }

  private updateLabels(camera: PerspectiveCamera): void {
    const radiusLabelA = this._group.getObjectByName(RADIUS_LABEL_A);
    const radiusLabelB = this._group.getObjectByName(RADIUS_LABEL_B);
    const heightLabel = this._group.getObjectByName(HEIGHT_LABEL);
    const diameterLabel = this._group.getObjectByName(DIAMETER_LABEL);

    if (
      radiusLabelA === undefined &&
      radiusLabelB === undefined &&
      heightLabel === undefined &&
      diameterLabel === undefined
    ) {
      return;
    }
    const { domainObject } = this;
    const { radius, height } = domainObject.cylinder;

    const centerA = domainObject.cylinder.centerA.clone();
    const centerB = domainObject.cylinder.centerB.clone();
    centerA.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    centerB.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    const axis = newVector3().subVectors(centerB, centerA).normalize();
    const cameraPosition = camera.getWorldPosition(newVector3());

    if (radiusLabelA !== undefined) {
      updateRadiusLabel(centerA, radiusLabelA, -1, this.getRadiusLabelHeight());
    }
    if (radiusLabelB !== undefined) {
      updateRadiusLabel(centerB, radiusLabelB, 1, this.getRadiusLabelHeight());
    }
    if (heightLabel !== undefined || diameterLabel !== undefined) {
      const center = newVector3().addVectors(centerA, centerB).multiplyScalar(0.5);
      if (heightLabel !== undefined) {
        updateHeightLabel(center, heightLabel);
      }
      if (diameterLabel !== undefined) {
        updateDiameterLabel(center, diameterLabel, this.getDiameterLabelHeight());
      }
    }

    function updateRadiusLabel(
      center: Vector3,
      label: Object3D,
      sign: number,
      labelHeight: number
    ): void {
      const cameraDirection = newVector3().subVectors(center, cameraPosition).normalize();
      label.visible = Math.sign(axis.dot(cameraDirection)) !== sign; // Show only when the cap is visible
      if (!label.visible) {
        return;
      }
      const radialDirection = newVector3().crossVectors(cameraDirection, axis).normalize();
      const position = newVector3(center).addScaledVector(radialDirection, 0.5 * radius);
      position.addScaledVector(axis, 0.5 * sign * LABEL_PADDING_FACTOR * labelHeight);
      label.position.copy(position);
    }

    function updateHeightLabel(center: Vector3, label: Object3D): void {
      const cameraDirection = newVector3().subVectors(center, cameraPosition).normalize();
      const radialDirection = newVector3().crossVectors(cameraDirection, axis).normalize();
      const forwardDirection = newVector3().crossVectors(radialDirection, axis).normalize();
      center.addScaledVector(forwardDirection, radius);
      label.position.copy(center);
      label.visible = true;
    }

    function updateDiameterLabel(center: Vector3, label: Object3D, labelHeight: number): void {
      const cameraDirection = newVector3().subVectors(center, cameraPosition).normalize();
      const radialDirection = newVector3().crossVectors(cameraDirection, axis).normalize();

      // Here the label will be placed one top of the cylinder.
      const padding = LABEL_PADDING_FACTOR * labelHeight;
      if (Math.abs(axis.y) > 0.5) {
        // Mostly vertical cylinder
        center.addScaledVector(axis, -height - padding);
      } else {
        // Mostly horizontal cylinder
        center.addScaledVector(radialDirection, -radius - padding);
      }
      label.position.copy(center);
      label.visible = true;
    }
  }

  private getPickedFocusType(realPosition: Vector3, face: BoxFace): FocusType {
    const { domainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius());
    const scaledMatrix = domainObject.cylinder.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = newVector3(realPosition).applyMatrix4(scaledMatrix);
    const planePoint = face.getPlanePoint(scaledPositionAtFace);
    const relativeDistance = planePoint.length() / 2;

    if (!isFaceVisible(face)) {
      return FocusType.Face;
    }
    if (relativeDistance < RELATIVE_RESIZE_RADIUS) {
      return FocusType.Face;
    }
    if (domainObject.canMoveCaps && RELATIVE_ROTATION_RADIUS.isInside(relativeDistance)) {
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

function isFaceVisible(face: BoxFace): boolean {
  return face.index === 2; // Z Face visible only
}
