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
  BufferGeometry,
  BufferAttribute,
  LineBasicMaterial,
  Vector3,
  ArrowHelper,
  Matrix4,
  RingGeometry,
  MeshBasicMaterial
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
import { OBB } from 'three/addons/math/OBB.js';
import { BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';

const HALF_SIDE = 0.5;
const RELATIVE_HEAD_LENGTH = 0.25;
const RELATIVE_INNER_RADIUS = 0.85;
const RELATIVE_OUTER_RADIUS = 0.95;
const ARROW_AND_RING_COLOR = 0xffffff;

export class BoxThreeView extends GroupThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get boxDomainObject(): BoxDomainObject {
    return super.domainObject as BoxDomainObject;
  }

  protected get style(): BoxRenderStyle {
    return super.style as BoxRenderStyle;
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
    this.addChild(this.createLines(matrix));
    const focusType = boxDomainObject.focusType;
    if (focusType === BoxFocusType.None) {
      return;
    }
    this.addChild(this.createSolid(matrix));
    if (focusType === BoxFocusType.Scale || focusType === BoxFocusType.Translate) {
      this.addArrows(matrix);
    } else if (focusType === BoxFocusType.Rotate) {
      this.addChild(this.createRotationCircle(matrix));
    }
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const orientedBox = new OBB(new Vector3(), new Vector3().setScalar(HALF_SIDE));
    const matrix = this.getCombinedMatrix();
    orientedBox.applyMatrix4(matrix);

    const ray = intersectInput.raycaster.ray;
    const point = orientedBox.intersectRay(ray, new Vector3());
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
    const positionAtEdge = point?.clone().applyMatrix4(matrix);

    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new BoxFace().fromPositionAtEdge(positionAtEdge),
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
    const geometry = createLineSegmentsBufferGeometry();
    const result = new LineSegments(geometry, material);

    result.applyMatrix4(matrix);
    return result;
  }

  protected addArrows(matrix: Matrix4): void {
    const { boxDomainObject } = this;

    // Add the arrows
    const face = boxDomainObject.focusFace;
    if (face === undefined) {
      return;
    }
    const center = face.getCenter();
    center.applyMatrix4(matrix);
    const arrowSize = getArrowSize();

    const rotationMatrix = boxDomainObject.getRotatationMatrix();
    if (boxDomainObject.focusType === BoxFocusType.Translate) {
      this.addArrow(face.getTangent1(), center, arrowSize, rotationMatrix);
      this.addArrow(face.getTangent2(), center, arrowSize, rotationMatrix);
    } else if (boxDomainObject.focusType === BoxFocusType.Scale) {
      this.addArrow(face.getNormal(), center, arrowSize, rotationMatrix);
    }

    function getArrowSize(): number {
      if (face === undefined) {
        return 0;
      }
      const size1 = boxDomainObject.size.getComponent(face.tangentIndex1);
      const size2 = boxDomainObject.size.getComponent(face.tangentIndex2);
      const size = Math.sqrt(size1 * size2) / 2; // Half of the geometric mean of the two sizes
      return size;
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

  private createRotationCircle(matrix: Matrix4): Mesh {
    const { boxDomainObject } = this;

    const face = new BoxFace(2);
    const radius = getRadius();

    const outerRadius = radius * RELATIVE_OUTER_RADIUS;
    const innerRadius = radius * RELATIVE_INNER_RADIUS;
    const color = ARROW_AND_RING_COLOR;
    const geometry = new RingGeometry(innerRadius, outerRadius, 32);
    const material = new MeshBasicMaterial({ color, side: DoubleSide });
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter();
    center.applyMatrix4(matrix);
    mesh.position.copy(center);
    mesh.rotateX(Math.PI / 2);
    return mesh;

    function getRadius(): number {
      const size1 = boxDomainObject.size.getComponent(face.tangentIndex1);
      const size2 = boxDomainObject.size.getComponent(face.tangentIndex2);
      return Math.max(size1, size2) / 2;
    }
  }

  private getCombinedMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const combinedMatrix = boxDomainObject.getMatrix();
    combinedMatrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return combinedMatrix;
  }
}

// ==================================================
// LOCAL FUNCTIONS
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
  material.transparent = style.opacityUse;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
}

function updateLineSegmentsMaterial(
  material: LineBasicMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
}

function createBoxGeometryAsVertices(): number[] {
  // Define vertices of a cube
  const a = HALF_SIDE;
  const corners = [
    { x: -a, y: -a, z: -a }, // Bottom-left-back
    { x: +a, y: -a, z: -a }, // Bottom-right-back
    { x: +a, y: +a, z: -a }, // Top-right-back
    { x: -a, y: +a, z: -a }, // Top-left-back
    { x: -a, y: -a, z: +a }, // Bottom-left-front
    { x: +a, y: -a, z: +a }, // Bottom-right-front
    { x: +a, y: +a, z: +a }, // Top-right-front
    { x: -a, y: +a, z: +a } // Top-left-front
  ];
  const vertices = corners.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);

  // Define the order of the vertices to form line segments of the cube
  const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
  const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
  const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
  const indices = [...bottomIndices, ...topIndices, ...sideIndices];

  return createLineSegmentsAsVertices(vertices, indices);
}

function createLineSegmentsAsVertices(vertices: number[], indices: number[]): number[] {
  // Convert indexed lines to lines only
  const allVertices: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    const index = 3 * indices[i];
    allVertices.push(vertices[index], vertices[index + 1], vertices[index + 2]);
  }
  return allVertices;
}

function createLineSegmentsBufferGeometry(): BufferGeometry {
  const vertices = createBoxGeometryAsVertices();
  const verticesArray = new Float32Array(vertices);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
  return geometry;
}
