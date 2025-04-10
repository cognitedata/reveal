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
  Triangle,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  type Object3D,
  type Color
} from 'three';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
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
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { updateWireframeMaterial } from '../box/BoxView';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { PrimitiveUtils } from '../../../base/utilities/primitives/PrimitiveUtils';

export class PlaneView extends GroupThreeView<PlaneDomainObject> {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _sceneBoundingBox: Box3 = new Box3().makeEmpty(); // Cache the bounding box of the scene
  private readonly _sceneRange: Range3 = new Range3();

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

  protected override needsUpdateCore(): boolean {
    const target = this.renderTarget;

    // Check if bounding box is different
    const sceneBoundingBox = target.sceneBoundingBox;
    if (sceneBoundingBox.equals(this._sceneBoundingBox)) {
      return false;
    }
    this._sceneBoundingBox.copy(sceneBoundingBox);
    this._sceneRange.copy(sceneBoundingBox);
    return true;
  }

  protected override addChildren(): void {
    const { style, domainObject } = this;
    const corners = this.createCorners();
    if (corners === undefined) {
      return;
    }
    if (style.showSolid) {
      this.addSolid(corners);
    }
    if (style.showLines) {
      if (style.getLineWidth(domainObject.isSelected) === 1) {
        this.addChild(this.createLines(corners));
      } else {
        this.addChild(this.createWireframe(corners));
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

  private createLines(corners: Vector3[]): Object3D {
    const points = [corners[0], corners[1], corners[3], corners[2], corners[0]];
    const { domainObject, style } = this;
    const material = new LineBasicMaterial({});
    material.color = getLineColor(domainObject, style);
    const geometry = new BufferGeometry().setFromPoints(points);
    return new Line(geometry, material);
  }

  private createWireframe(corners: Vector3[]): Object3D | undefined {
    const points = [
      corners[0],
      corners[1],
      corners[1],
      corners[3],
      corners[3],
      corners[2],
      corners[2],
      corners[0]
    ];
    const { domainObject, style } = this;
    const material = new LineMaterial();
    updateWireframeMaterial(material, domainObject, style, this.useDepthTest);
    material.color = getLineColor(domainObject, style);
    const geometry = PrimitiveUtils.createLineSegmentsGeometryByVertices(points);
    return new Wireframe(geometry, material);
  }

  private addSolid(points: Vector3[]): void {
    const { domainObject, style } = this;
    const buffer = new TrianglesBuffers(4);
    const normal = domainObject.plane.normal;
    buffer.addPairWithNormal(points[0], points[1], normal);
    buffer.addPairWithNormal(points[2], points[3], normal);
    if (!buffer.isFilled) {
      return;
    }
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

  private createCorners(): Vector3[] | undefined {
    const { domainObject } = this;
    const { plane } = domainObject;

    if (this._sceneBoundingBox.isEmpty()) {
      return undefined;
    }
    const boundingBox = this._sceneBoundingBox.clone();
    boundingBox.applyMatrix4(this.renderTarget.fromViewerMatrix);
    const range = new Range3();
    range.copy(boundingBox);

    let p0: Vector3 | undefined;
    let p1: Vector3 | undefined;
    let p2: Vector3 | undefined;
    let p3: Vector3 | undefined;

    if (domainObject.primitiveType === PrimitiveType.PlaneZ) {
      p0 = range.getHorizontalIntersection(plane, 0);
      p1 = range.getHorizontalIntersection(plane, 1);
      p2 = range.getHorizontalIntersection(plane, 3);
      p3 = range.getHorizontalIntersection(plane, 2);
    } else {
      for (let startIndex = 0; startIndex < 2; startIndex++) {
        const start = new Vector3();
        const end = new Vector3();
        if (!range.getVerticalPlaneIntersection(plane, startIndex > 0, start, end)) {
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
      return undefined;
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

    return [p0, p1, p2, p3];
  }
}

// ==================================================
// PRIVATE FUNCTIONS:
// ==================================================

function updateSolidMaterial(
  material: MeshPhongMaterial,
  domainObject: PlaneDomainObject,
  style: SolidPrimitiveRenderStyle,
  side: Side
): void {
  const color = side === FrontSide ? domainObject.color : domainObject.backSideColor;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.getSolidOpacity(domainObject.isSelected);
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = side;
  material.flatShading = true;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

function getLineColor(domainObject: PlaneDomainObject, style: SolidPrimitiveRenderStyle): Color {
  const isSelected = domainObject.isSelected || domainObject.focusType !== FocusType.None;
  return style.getLineColor(isSelected);
}
