import {
  Mesh,
  MeshPhongMaterial,
  type Object3D,
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
  FrontSide,
  type PerspectiveCamera,
  Vector2
} from 'three';
import { type BoxDomainObject } from './BoxDomainObject';
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
import { clear } from '../../../base/utilities/extensions/arrayUtils';
import { createSpriteWithText } from '../../../base/utilities/sprites/createSprite';
import { BoxUtils } from '../../../base/utilities/primitives/BoxUtils';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { Range1 } from '../../../base/utilities/geometry/Range1';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type PrimitiveRenderStyle } from '../common/PrimitiveRenderStyle';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { Box } from '../../../base/utilities/primitives/Box';
import { getRoot } from '../../../base/domainObjects/getRoot';

const RELATIVE_RESIZE_RADIUS = 0.15;
const RELATIVE_ROTATION_RADIUS = new Range1(0.6, 0.75);
const ARROW_AND_RING_COLOR = new Color(1, 1, 1);
const TOP_FACE = new BoxFace(2);
const CIRCULAR_SEGMENTS = 32;
const RENDER_ORDER = 100;

export class BoxView extends GroupThreeView<BoxDomainObject> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _sprites: Array<Sprite | undefined> = [];
  private readonly _visibleFaces: boolean[] = new Array(6); // Just for avoiding allocation

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
      const rotationMatrix = this.getRotationMatrix();
      this.addRotationRing(matrix, rotationMatrix);
      this.addEdgeCircles(matrix, rotationMatrix);
    }
    if (style.showLabel) {
      this.addLabels(matrix);
    } else if (focusType === FocusType.Rotation) {
      const face = domainObject.focusFace;
      if (face !== undefined) {
        const spriteHeight = this.getTextHeight(this.style.relativeTextSize);
        this.addChild(this.createRotationLabel(matrix, spriteHeight, face));
      }
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
    const matrix = this.getMatrix();
    const orientedBox = BoxUtils.createOrientedBox(matrix);

    const ray = intersectInput.raycaster.ray;
    const point = orientedBox.intersectRay(ray, newVector3());
    if (point === null) {
      return undefined;
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }
    const positionAtFace = newVector3(point).applyMatrix4(matrix.invert());
    const boxFace = new BoxFace().fromPositionAtFace(positionAtFace);
    if (!this.isFaceVisible(boxFace)) {
      return undefined;
    }
    const cornerSign = new Vector3();
    const cdfPosition = this.renderTarget.convertFromViewerCoordinates(point);
    const focusType = this.getPickedFocusType(cdfPosition, boxFace, cornerSign);
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new PrimitivePickInfo(boxFace, focusType, cornerSign),
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

  private getTextHeight(relativeTextSize: number): number {
    return relativeTextSize * this.domainObject.box.diagonal;
  }

  private getFaceRadius(face: BoxFace): number {
    const { size } = this.domainObject.box;
    const size1 = size.getComponent(face.tangentIndex1);
    const size2 = size.getComponent(face.tangentIndex2);
    return (size1 + size2) / 4;
  }

  private getMatrix(): Matrix4 {
    const { domainObject } = this;
    const matrix = domainObject.box.getMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  private getRotationMatrix(): Matrix4 {
    const { domainObject } = this;
    const matrix = domainObject.box.getRotationMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  // ==================================================
  // INSTANCE METHODS: Create Object3D's
  // ==================================================

  private createSolid(matrix: Matrix4): Object3D | undefined {
    const { domainObject, style } = this;
    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, domainObject, style);
    const geometry = BoxUtils.createUnitGeometry();
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = RENDER_ORDER;
    mesh.applyMatrix4(matrix);
    return mesh;
  }

  private createLines(matrix: Matrix4): Object3D | undefined {
    const { domainObject, style } = this;
    const material = new LineBasicMaterial();
    updateLineSegmentsMaterial(material, domainObject, style, this.useDepthTest);
    const geometry = BoxUtils.createLineSegmentsBufferGeometry();
    const result = new LineSegments(geometry, material);
    result.renderOrder = RENDER_ORDER;
    result.applyMatrix4(matrix);
    return result;
  }

  private createWireframe(matrix: Matrix4): Object3D | undefined {
    const { domainObject, style } = this;
    const material = new LineMaterial();
    updateWireframeMaterial(material, domainObject, style, this.useDepthTest);
    const geometry = BoxUtils.createLineSegmentsGeometry();
    const result = new Wireframe(geometry, material);
    result.renderOrder = RENDER_ORDER;
    result.applyMatrix4(matrix);
    return result;
  }

  private createRotationLabel(
    matrix: Matrix4,
    spriteHeight: number,
    face: BoxFace
  ): Sprite | undefined {
    if (!this.isFaceVisible(face)) {
      return undefined;
    }
    const { domainObject } = this;
    if (!domainObject.canRotateComponent(face.index)) {
      return undefined;
    }
    const root = getRoot(domainObject);
    if (root === undefined) {
      return undefined;
    }
    const degrees = domainObject.box.getRotationInDegrees(face.index);
    if (degrees === 0) {
      return undefined; // Not show when about 0
    }
    const text = root.unitSystem.toStringWithUnit(degrees, Quantity.Angle);
    const sprite = createSprite(text, this.style, spriteHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = face.getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    adjustLabel(faceCenter, domainObject, spriteHeight);
    sprite.position.copy(faceCenter);
    return sprite;
  }

  private createPendingLabel(
    matrix: Matrix4,
    spriteHeight: number,
    face: BoxFace
  ): Sprite | undefined {
    if (!this.isFaceVisible(face)) {
      return undefined;
    }
    const sprite = createSprite('Pending', this.style, spriteHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = face.getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    adjustLabel(faceCenter, this.domainObject, spriteHeight);
    sprite.position.copy(faceCenter);
    return sprite;
  }

  private createRotationRing(
    matrix: Matrix4,
    rotationMatrix: Matrix4,
    material: Material,
    face: BoxFace
  ): Mesh | undefined {
    const radius = this.getFaceRadius(face);

    const outerRadius = RELATIVE_ROTATION_RADIUS.max * radius;
    const innerRadius = RELATIVE_ROTATION_RADIUS.min * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, CIRCULAR_SEGMENTS);

    const result = new Mesh(geometry, material);
    result.renderOrder = RENDER_ORDER;

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    result.position.copy(center);

    rotateEdgeCircle(result, face, rotationMatrix);
    return result;
  }

  private createEdgeCircle(
    matrix: Matrix4,
    rotationMatrix: Matrix4,
    material: Material,
    face: BoxFace
  ): Mesh | undefined {
    const { domainObject } = this;
    const adjacentSize1 = domainObject.box.size.getComponent(face.tangentIndex1);
    if (!Box.isValidSize(adjacentSize1)) {
      return undefined;
    }
    const adjacentSize2 = domainObject.box.size.getComponent(face.tangentIndex2);
    if (!Box.isValidSize(adjacentSize2)) {
      return undefined;
    }
    const radius = RELATIVE_RESIZE_RADIUS * this.getFaceRadius(face);
    const geometry = new CircleGeometry(radius, CIRCULAR_SEGMENTS);
    material.transparent = true;
    material.depthWrite = false;
    const result = new Mesh(geometry, material);
    result.renderOrder = RENDER_ORDER;

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    result.position.copy(center);

    rotateEdgeCircle(result, face, rotationMatrix);
    return result;
  }

  // ==================================================
  // INSTANCE METHODS: Add Object3D's
  // ==================================================

  private addLabels(matrix: Matrix4): void {
    const { domainObject, style } = this;
    const root = getRoot(domainObject);
    if (root === undefined) {
      return undefined;
    }
    const spriteHeight = this.getTextHeight(style.relativeTextSize);
    clear(this._sprites);
    for (let index = 0; index < 3; index++) {
      const size = domainObject.box.size.getComponent(index);
      if (!Box.isValidSize(size)) {
        this._sprites.push(undefined);
        continue;
      }
      const text = root.unitSystem.toStringWithUnit(size, Quantity.Length);
      const sprite = createSprite(text, style, spriteHeight);
      if (sprite === undefined) {
        this._sprites.push(undefined);
        continue;
      }
      this._sprites.push(sprite);
      this.addChild(sprite);
    }
    this.updateLabels(this.renderTarget.camera);
    const { focusType } = domainObject;
    if (focusType === FocusType.Pending && domainObject.box.hasArea) {
      this.addChild(this.createPendingLabel(matrix, spriteHeight, TOP_FACE));
    } else if (showRotationLabel(focusType)) {
      this.addChild(this.createRotationLabel(matrix, spriteHeight, TOP_FACE));
    }
  }

  private updateLabels(camera: Camera): void {
    const { domainObject, style } = this;
    const matrix = this.getMatrix();

    const rotationMatrix = this.getRotationMatrix();
    const centerOfBox = newVector3(domainObject.box.center);
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

    // If the 2 adjacent faces are visible, show the sprite along the edge
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

          adjustLabel(edgeCenter, domainObject, spriteHeight);

          // Move the sprite slightly away from the box to avoid z-fighting
          edgeCenter.addScaledVector(cameraDirection, -spriteHeight / 2);
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

  private addEdgeCircles(matrix: Matrix4, rotationMatrix: Matrix4): void {
    const { domainObject, style } = this;
    let selectedFace = domainObject.focusFace;
    if (this.domainObject.focusType !== FocusType.Face) {
      selectedFace = undefined;
    }
    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, domainObject, style, false, this.useDepthTest);
    for (const face of BoxFace.getAllFaces()) {
      if (!this.isFaceVisible(face)) {
        continue;
      }
      if (selectedFace !== undefined && selectedFace.equals(face)) {
        continue;
      }
      this.addChild(this.createEdgeCircle(matrix, rotationMatrix, material, face));
    }
    if (selectedFace !== undefined && this.isFaceVisible(selectedFace)) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, domainObject, style, true, this.useDepthTest);
      this.addChild(this.createEdgeCircle(matrix, rotationMatrix, material, selectedFace));
    }
  }

  private addRotationRing(matrix: Matrix4, rotationMatrix: Matrix4): void {
    const { domainObject, style } = this;
    let selectedFace = domainObject.focusFace;
    if (this.domainObject.focusType !== FocusType.Rotation) {
      selectedFace = undefined;
    } else if (selectedFace !== undefined && !domainObject.canRotateComponent(selectedFace.index)) {
      selectedFace = undefined;
    }
    for (const face of BoxFace.getAllFaces()) {
      if (!this.isFaceVisible(face)) {
        continue;
      }
      if (!domainObject.canRotateComponent(face.index)) {
        continue;
      }
      if (selectedFace !== undefined && selectedFace.equals(face)) {
        continue;
      }
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, domainObject, style, false, this.useDepthTest);
      material.clippingPlanes = BoxFace.createClippingPlanes(matrix, face.index);
      this.addChild(this.createRotationRing(matrix, rotationMatrix, material, face));
    }
    if (selectedFace !== undefined && this.isFaceVisible(selectedFace)) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, domainObject, style, true, this.useDepthTest);
      material.clippingPlanes = BoxFace.createClippingPlanes(matrix, selectedFace.index);
      this.addChild(this.createRotationRing(matrix, rotationMatrix, material, selectedFace));
    }
  }

  // ==================================================
  // INSTANCE METHODS: For picking
  // ==================================================

  private getPickedFocusType(
    realPosition: Vector3,
    face: BoxFace,
    outputCornerSign: Vector3
  ): FocusType {
    const { domainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(face));
    const scaledMatrix = domainObject.box.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = newVector3(realPosition).applyMatrix4(scaledMatrix);
    const planePoint = face.getPlanePoint(scaledPositionAtFace);
    const relativeDistance = planePoint.length();

    outputCornerSign.copy(this.getCornerSign(realPosition, face));
    const corner = this.getCorner(outputCornerSign, face);

    if (relativeDistance < RELATIVE_RESIZE_RADIUS) {
      return FocusType.Face;
    }
    if (realPosition.distanceTo(corner) < 0.2 * this.getFaceRadius(face)) {
      return FocusType.Corner;
    }
    if (domainObject.canRotateComponent(face.index)) {
      if (RELATIVE_ROTATION_RADIUS.isInside(relativeDistance)) {
        return FocusType.Rotation;
      }
    }
    return FocusType.Body;
  }

  private getCornerSign(realPosition: Vector3, face: BoxFace): Vector3 {
    const { domainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(face));
    const scaledMatrix = domainObject.box.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = realPosition.clone().applyMatrix4(scaledMatrix);
    scaledPositionAtFace.setComponent(face.index, 0);
    scaledPositionAtFace.setComponent(
      face.tangentIndex1,
      Math.sign(scaledPositionAtFace.getComponent(face.tangentIndex1))
    );
    scaledPositionAtFace.setComponent(
      face.tangentIndex2,
      Math.sign(scaledPositionAtFace.getComponent(face.tangentIndex2))
    );
    return scaledPositionAtFace;
  }

  private getCorner(cornerSign: Vector3, face: BoxFace): Vector3 {
    const { domainObject } = this;
    const center = face.getCenter(new Vector3()); // In range (-0.5, 0.5)
    const corner = center.addScaledVector(cornerSign, 0.5);
    const matrix = domainObject.box.getMatrix();
    corner.applyMatrix4(matrix);
    return corner;
  }

  private isFaceVisible(face: BoxFace): boolean {
    const { domainObject } = this;
    switch (domainObject.primitiveType) {
      case PrimitiveType.VerticalArea:
        return face.index === 1; // Y Face visible

      case PrimitiveType.HorizontalArea:
        return face.index === 2; // Z face visible
    }
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function showRotationLabel(focusType: FocusType): boolean {
  switch (focusType) {
    case FocusType.Face:
    case FocusType.Body:
    case FocusType.Pending:
      return false;
    default:
      return true;
  }
}

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
// PRIVATE FUNCTIONS: Update materials
// ==================================================

export function updateSolidMaterial(
  material: MeshPhongMaterial,
  domainObject: DomainObject,
  style: SolidPrimitiveRenderStyle
): void {
  const color = domainObject.getColorByColorType(style.colorType);
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.getSolidOpacity(domainObject.isSelected);
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

export function updateLineSegmentsMaterial(
  material: LineBasicMaterial,
  domainObject: DomainObject,
  style: SolidPrimitiveRenderStyle,
  depthTest: boolean
): void {
  const color = domainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = depthTest;
}

export function updateWireframeMaterial(
  material: LineMaterial,
  domainObject: DomainObject,
  style: SolidPrimitiveRenderStyle,
  depthTest: boolean
): void {
  const color = domainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = depthTest;
  material.linewidth = style.getLineWidth(domainObject.isSelected);
  material.resolution = new Vector2(1000, 1000);
  material.worldUnits = false;
}

export function updateMarkerMaterial(
  material: MeshPhongMaterial,
  domainObject: DomainObject,
  style: SolidPrimitiveRenderStyle,
  hasFocus: boolean,
  depthTest: boolean
): void {
  material.color = ARROW_AND_RING_COLOR;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.transparent = true;
  material.emissive = ARROW_AND_RING_COLOR;
  material.emissiveIntensity = hasFocus ? 0.9 : 0.2;
  material.side = FrontSide;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = depthTest;
}

// ==================================================
// PRIVATE FUNCTIONS: Create object3D's
// ==================================================

function adjustLabel(point: Vector3, domainObject: BoxDomainObject, spriteHeight: number): void {
  if (domainObject.primitiveType !== PrimitiveType.VerticalArea) {
    point.y += (1.1 * spriteHeight) / 2;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Misc
// ==================================================

export function rotateEdgeCircle(mesh: Mesh, face: BoxFace, rotationMatrix: Matrix4): void {
  // Must be rotated correctly because of sideness
  mesh.rotation.setFromRotationMatrix(rotationMatrix);

  switch (face.face) {
    case 0:
      mesh.rotateY(Math.PI / 2);
      break;
    case 3:
      mesh.rotateY(-Math.PI / 2);
      break;
    case 2:
      mesh.rotateY(0);
      break;
    case 5:
      mesh.rotateY(Math.PI);
      break;
    case 1:
      mesh.rotateX(-Math.PI / 2);
      break;
    case 4:
      mesh.rotateX(Math.PI / 2);
      break;
  }
}

export function createSprite(
  text: string,
  style: PrimitiveRenderStyle,
  height: number
): Sprite | undefined {
  const result = createSpriteWithText(text, height, style.labelColor, style.labelBgColor);
  if (result === undefined) {
    return undefined;
  }
  result.material.transparent = true;
  result.material.opacity = style.labelOpacity;
  result.material.depthTest = style.depthTest;
  result.renderOrder = RENDER_ORDER;
  return result;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
