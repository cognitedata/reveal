/*!
 * Copyright 2024 Cognite AS
 */

import {
  Mesh,
  MeshPhongMaterial,
  Vector3,
  type PerspectiveCamera,
  Box3,
  FrontSide,
  BackSide,
  type Side,
  Line3,
  type Plane,
  Triangle,
  LineBasicMaterial,
  BufferGeometry,
  Line
} from 'three';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type PlaneRenderStyle } from './PlaneRenderStyle';
import { GroupThreeView } from '../../../base/views/GroupThreeView';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { TrianglesBuffers } from '../../../base/utilities/geometry/TrianglesBuffers';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitiveType } from '../PrimitiveType';

export class PlaneView extends GroupThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _sceneBoundingBox: Box3 = new Box3().makeEmpty(); // Cache the bounding box of the scene
  private readonly _sceneRange: Range3 = new Range3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get domainObject(): PlaneDomainObject {
    return super.domainObject as PlaneDomainObject;
  }

  protected override get style(): PlaneRenderStyle {
    return super.style as PlaneRenderStyle;
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
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get isPartOfBoundingBox(): boolean {
    return false;
  }

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  protected override get needsUpdate(): boolean {
    const target = this.renderTarget;

    // Check if bounding box is different
    const sceneBoundingBox = target.sceneBoundingBox;
    if (sceneBoundingBox.equals(this._sceneBoundingBox)) {
      return false;
    }
    this._sceneBoundingBox.copy(sceneBoundingBox);
    this._sceneRange.copy(this._sceneBoundingBox);
    return true;
  }

  protected override addChildren(): void {
    const { domainObject, style } = this;
    const plane = domainObject.plane;

    const sceneBoundingBox = this._sceneBoundingBox.clone();
    sceneBoundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    const range = new Range3();
    range.copy(sceneBoundingBox);

    let p0: Vector3 | undefined;
    let p1: Vector3 | undefined;
    let p2: Vector3 | undefined;
    let p3: Vector3 | undefined;

    if (domainObject.primitiveType === PrimitiveType.PlaneZ) {
      p0 = getHorizontalIntersection(range, plane, 0);
      p1 = getHorizontalIntersection(range, plane, 1);
      p2 = getHorizontalIntersection(range, plane, 3);
      p3 = getHorizontalIntersection(range, plane, 2);
    } else {
      for (let startIndex = 0; startIndex < 8; startIndex += 4) {
        let start: Vector3 | undefined;
        let end: Vector3 | undefined;
        for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
          const intersection = getVerticalIntersection(range, plane, cornerIndex + startIndex);
          if (intersection === undefined) {
            continue;
          }
          if (start === undefined) {
            start = intersection;
            continue;
          }
          if (end === undefined) {
            end = intersection;
            break;
          }
        }
        if (start === undefined || end === undefined) {
          continue;
        }
        if (startIndex === 0) {
          p0 = start;
          p1 = end;
        } else {
          p2 = start;
          p3 = end;
        }
      }
    }
    if (p0 === undefined || p1 === undefined || p2 === undefined || p3 === undefined) {
      return;
    }
    // Layout of the points
    //     2------3
    //     |      |
    //     0------1
    // Make sure it is right handed
    const normal = Triangle.getNormal(p0, p1, p2, new Vector3()).normalize();
    const angle = normal.angleTo(plane.normal);
    if (Math.abs(angle) > Math.PI / 2) {
      [p0, p1] = [p1, p0];
      [p2, p3] = [p3, p2];
    }
    p0.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    p1.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    p2.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    p3.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    if (style.showSolid) {
      const buffer = new TrianglesBuffers(4);
      buffer.addPairWithNormal(p0, p1, plane.normal);
      buffer.addPairWithNormal(p2, p3, plane.normal);
      this.addSolid(buffer);
    }
    if (style.showLines) {
      const material = new LineBasicMaterial({});

      const hasFocus = domainObject.focusType !== FocusType.None;
      material.color =
        domainObject.isSelected || hasFocus ? style.selectedLinesColor : style.linesColor;

      const points = [p0, p1, p3, p2, p0];
      const geometry = new BufferGeometry().setFromPoints(points);

      const line = new Line(geometry, material);
      this.addChild(line);
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
    const plane = domainObject.plane.clone();
    plane.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    const ray = intersectInput.raycaster.ray;
    const point = ray.intersectPlane(plane, new Vector3());
    if (point === null) {
      return undefined;
    }
    if (domainObject.primitiveType === PrimitiveType.PlaneZ) {
      if (!this._sceneRange.x.isInside(point.x)) {
        return undefined;
      }
      if (!this._sceneRange.z.isInside(point.z)) {
        return undefined;
      }
    } else {
      if (!this._sceneRange.isInside(point)) {
        return undefined;
      }
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      customObject: this,
      domainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private addSolid(buffer: TrianglesBuffers): void {
    if (!buffer.isFilled) {
      return;
    }
    const { domainObject, style } = this;
    const geometry = buffer.createBufferGeometry();
    {
      const material = new MeshPhongMaterial();
      updateSolidMaterial(material, domainObject, style, FrontSide);

      const mesh = new Mesh(geometry, material);
      this.addChild(mesh);
    }
    {
      const material = new MeshPhongMaterial();
      updateSolidMaterial(material, domainObject, style, BackSide);

      const mesh = new Mesh(geometry, material);
      this.addChild(mesh);
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS:
// ==================================================

function updateSolidMaterial(
  material: MeshPhongMaterial,
  domainObject: PlaneDomainObject,
  style: PlaneRenderStyle,
  side: Side
): void {
  const color = side === FrontSide ? domainObject.color : domainObject.backSideColor;
  const opacity = domainObject.isSelected ? style.selectedOpacity : style.opacity;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.opacityUse ? opacity : 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = side;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

// ==================================================
// PRIVATE FUNCTIONS: Intersections
// ==================================================

function getHorizontalIntersection(range: Range3, plane: Plane, cornerIndex: number): Vector3 {
  const corner = range.getCornerPoint(cornerIndex, new Vector3());
  return plane.projectPoint(corner, corner);
}

function getVerticalIntersection(
  range: Range3,
  plane: Plane,
  cornerIndex: number
): Vector3 | undefined {
  // Finds 2 corners and make a line between them, then intersect the line
  const corner = range.getCornerPoint(cornerIndex, new Vector3());
  let nextCornerIndex: number;
  if (cornerIndex === 3) {
    nextCornerIndex = 0;
  } else if (cornerIndex === 7) {
    nextCornerIndex = 4;
  } else {
    nextCornerIndex = cornerIndex + 1;
  }
  const nextCorner = range.getCornerPoint(nextCornerIndex, new Vector3());
  const line = new Line3(corner, nextCorner);
  const point = plane.intersectLine(line, new Vector3());
  return point ?? undefined;
}
