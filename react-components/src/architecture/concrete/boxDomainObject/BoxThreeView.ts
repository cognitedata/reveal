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
  Matrix4
} from 'three';
import { BoxDomainObject } from './BoxDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxRenderStyle } from './BoxRenderStyle';
import { ObjectThreeView } from '../../base/views/ObjectThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  CustomObjectIntersectInput,
  CustomObjectIntersection
} from '@cognite/reveal';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { OBB } from 'three/addons/math/OBB.js';
import { BoxFace } from './BoxFace';

const HALF_SIDE = 0.5;
export class BoxThreeView extends ObjectThreeView {
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
  // OVERRIDES of ObjectThreeView
  // ==================================================

  protected override addChildren(): void {
    const { boxDomainObject } = this;
    const matrix = this.getCombinedMatrix();
    this.addChild(this.createLines(matrix));
    if (boxDomainObject.hasFocus) {
      this.addChild(this.createSolid(matrix));

      // Add the arrows
      if (boxDomainObject.focusFace !== undefined) {
        const face = boxDomainObject.focusFace;
        const center = face.getCenter();
        center.applyMatrix4(matrix);

        const arrowSize1 = boxDomainObject.size.getComponent(face.tangentIndex1);
        const arrowSize2 = boxDomainObject.size.getComponent(face.tangentIndex2);
        const arrowSize = Math.sqrt(arrowSize1 * arrowSize2) / 2; // Half of the geometric mean of the two sizes

        if (boxDomainObject.focusTranslate) {
          this.addArrow(face.getTangent1(), center, arrowSize);
          this.addArrow(face.getTangent2(), center, arrowSize);
        } else {
          this.addArrow(face.getNormal(), center, arrowSize);
        }
      }
    }
  }

  private addArrow(direction: Vector3, center: Vector3, size: number): void {
    direction.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    direction.normalize();

    const headLength = size * 0.25;
    const headWidth = size * 0.25;
    const color = 0xffffff;

    const arrow1 = new ArrowHelper(direction, center, size, color, headLength, headWidth);

    direction.negate();
    this.addChild(arrow1);

    const arrow2 = new ArrowHelper(direction, center, size, color, headLength, headWidth);
    this.addChild(arrow2);
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

  public getCombinedMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const combinedMatrix = boxDomainObject.getMatrix(new Matrix4());
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
