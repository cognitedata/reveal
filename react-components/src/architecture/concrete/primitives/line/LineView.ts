/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  Quaternion,
  Uint32BufferAttribute,
  Vector3
} from 'three';
import { type LineDomainObject } from './LineDomainObject';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { LineRenderStyle } from './LineRenderStyle';
import { GroupThreeView } from '../../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  CustomObjectIntersectInput,
  CustomObjectIntersection
} from '@cognite/reveal';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { ClosestGeometryFinder } from '../../../base/utilities/geometry/ClosestGeometryFinder';
import { square } from '../../../base/utilities/extensions/mathExtensions';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { BoxView } from '../box/BoxView';
import { PrimitiveUtils } from '../../../base/utilities/primitives/PrimitiveUtils';
import { getRoot } from '../../../base/domainObjects/getRoot';
import { UnitSystem } from '../../../base/renderTarget/UnitSystem';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';

const CYLINDER_DEFAULT_AXIS = new Vector3(0, 1, 0);
const SOLID_NAME = 'Solid';

export class LineView extends GroupThreeView<LineDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): LineRenderStyle {
    return super.style as LineRenderStyle;
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
    return this.style.depthTest;
  }

  protected override addChildren(): void {
    this.addChild(this.createPipe());
    this.addChild(this.createLines()); // Create a line so it can be seen from long distance
    this.addChild(this.createSolid());
    this.addLabels();
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject, style } = this;
    if (domainObject.focusType === FocusType.Pending) {
      return undefined; // Should never be picked
    }
    const solid = this._group.getObjectByName(SOLID_NAME);
    if (solid !== undefined) {
      const objectIntersection = this.intersectObjectIfCloser(
        solid,
        intersectInput,
        closestDistance
      );
      if (objectIntersection !== undefined) {
        return objectIntersection;
      }
    }
    // Implement the intersection logic here, because of bug in tree.js
    const radius = getSelectRadius(domainObject, style);
    if (radius <= 0) {
      return;
    }
    const { points, pointCount } = domainObject;
    if (pointCount < 2) {
      return undefined;
    }
    // Just allocate all needed objects once
    const prevPoint = new Vector3();
    const thisPoint = new Vector3();
    const intersection = new Vector3();

    const radiusSquared = square(radius);
    const ray = intersectInput.raycaster.ray;
    const closestFinder = new ClosestGeometryFinder<DomainObjectIntersection>(ray.origin);
    if (closestDistance !== undefined) {
      closestFinder.minDistance = closestDistance;
    }
    const segmentCount = domainObject.lineSegmentCount;
    for (let i = 0; i <= segmentCount; i++) {
      domainObject.getCopyOfTransformedPoint(points[i % pointCount], thisPoint);
      thisPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      if (i === 0) {
        prevPoint.copy(thisPoint);
        continue;
      }
      const distanceSq = ray.distanceSqToSegment(prevPoint, thisPoint, undefined, intersection);
      prevPoint.copy(thisPoint);
      if (distanceSq > radiusSquared) {
        continue;
      }
      if (domainObject instanceof VisualDomainObject) {
        if (domainObject.useClippingInIntersection && !intersectInput.isVisible(intersection)) {
          return undefined;
        }
      } else {
        if (!intersectInput.isVisible(intersection)) {
          return undefined;
        }
      }
      if (!closestFinder.isClosest(intersection)) {
        continue;
      }
      const objectIntersection: DomainObjectIntersection = {
        type: 'customObject',
        point: intersection.clone(),
        distanceToCamera: closestFinder.minDistance,
        customObject: this,
        domainObject
      };
      closestFinder.setClosestGeometry(objectIntersection);
    }
    return closestFinder.getClosestGeometry();
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  private createPipe(): Mesh | undefined {
    const { domainObject, style } = this;
    const radius = getRadius(domainObject, style);
    if (radius <= 0) {
      return;
    }
    const { points, pointCount } = domainObject;
    if (pointCount < 2) {
      return undefined;
    }
    const geometries: CylinderGeometry[] = [];

    // Just allocate all needed objects once
    const prevPoint = new Vector3();
    const thisPoint = new Vector3();
    const quaternion = new Quaternion();
    const center = new Vector3();
    const direction = new Vector3();

    const segmentCount = domainObject.lineSegmentCount;
    for (let i = 0; i <= segmentCount; i++) {
      domainObject.getCopyOfTransformedPoint(points[i % pointCount], thisPoint);
      thisPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      if (i > 0) {
        // create cylinder with length equal to the distance between successive vertices
        const distance = prevPoint.distanceTo(thisPoint);
        const cylinder = new CylinderGeometry(radius, radius, distance, 6, 1);

        // use quaternion to orient cylinder to align along the vector formed between
        // the pair of vertices
        direction.copy(thisPoint).sub(prevPoint).normalize();
        quaternion.setFromUnitVectors(CYLINDER_DEFAULT_AXIS, direction);
        cylinder.applyQuaternion(quaternion);

        center.copy(thisPoint).add(prevPoint).divideScalar(2);
        cylinder.translate(center.x, center.y, center.z);
        geometries.push(cylinder);
      }
      prevPoint.copy(thisPoint);
    }
    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, domainObject, style);
    const pipeMesh = new Mesh(mergeGeometries(geometries, false), material);
    if (style.renderOrder !== undefined) {
      pipeMesh.renderOrder = style.renderOrder;
    }
    return pipeMesh;
  }

  private createSolid(): Object3D | undefined {
    const { domainObject, style } = this;
    if (!style.showSolid) {
      return undefined;
    }
    const { points, pointCount } = domainObject;
    if (pointCount < 3) {
      return undefined;
    }
    const indices = domainObject.getTriangleIndexes();
    if (indices === undefined) {
      return undefined;
    }
    const positions: number[] = [];
    for (let i = 0; i < domainObject.pointCount; i++) {
      const point = domainObject.getCopyOfTransformedPoint(points[i], new Vector3());
      point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      positions.push(...point);
    }
    const color = domainObject.getColorByColorType(style.colorType);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setIndex(new Uint32BufferAttribute(indices, 1));

    const material = new MeshBasicMaterial({
      color,
      depthTest: style.depthTest,
      transparent: true,
      opacity: style.getSolidOpacity(domainObject.isSelected),
      side: DoubleSide
    });
    const result = new Mesh(geometry, material);
    if (style.renderOrder !== undefined) {
      result.renderOrder = style.renderOrder;
    }
    result.name = SOLID_NAME;
    return result;
  }

  private createLines(): Object3D | undefined {
    const { domainObject, style } = this;
    const positions = createPositions(domainObject);
    if (positions === undefined) {
      return undefined;
    }
    const color = domainObject.getColorByColorType(style.colorType);
    const linewidth = domainObject.isSelected ? style.selectedLineWidth : style.lineWidth;
    const geometry = PrimitiveUtils.createBufferGeometry(positions);
    const material = new LineBasicMaterial({
      linewidth,
      color,
      depthTest: style.depthTest,
      transparent: style.transparent
    });
    const result = new Line(geometry, material);
    if (style.renderOrder !== undefined) {
      result.renderOrder = style.renderOrder;
    }
    return result;
  }

  private addLabels(): void {
    const { domainObject, style } = this;
    let spriteHeight = this.getTextHeight(style.relativeTextSize);
    if (spriteHeight <= 0) {
      spriteHeight = 1;
    }
    const unitSystem = getRoot(domainObject)?.unitSystem ?? new UnitSystem();
    const center = new Vector3();
    let prevPoint = domainObject.isClosed
      ? domainObject.getTransformedPoint(domainObject.lastPoint)
      : undefined;

    for (const point of domainObject.points) {
      const transformedPoint = domainObject.getTransformedPoint(point);
      if (prevPoint !== undefined) {
        const distance = transformedPoint.distanceTo(prevPoint);

        center.copy(transformedPoint).add(prevPoint).divideScalar(2);
        center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

        const text = unitSystem.toStringWithUnit(distance, Quantity.Length);
        const sprite = BoxView.createSprite(text, style, spriteHeight);
        if (sprite !== undefined) {
          adjustLabel(center, domainObject, style, spriteHeight);
          sprite.position.copy(center);
          this.addChild(sprite);
        }
      }
      prevPoint = transformedPoint;
    }
  }

  private getTextHeight(relativeTextSize: number): number {
    return relativeTextSize * this.domainObject.getAverageLength();
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Create object3D's
// ==================================================

function createPositions(domainObject: LineDomainObject): number[] | undefined {
  const { points, pointCount } = domainObject;
  if (pointCount < 2) {
    return undefined;
  }
  const positions: number[] = [];
  const segmentCount = domainObject.lineSegmentCount;

  for (let i = 0; i <= segmentCount; i++) {
    const point = domainObject.getCopyOfTransformedPoint(points[i % pointCount], new Vector3());
    point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    positions.push(...point);
    if (i > 0 && i < segmentCount - 1) {
      positions.push(...point);
    }
  }
  return positions;
}

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: LineDomainObject,
  style: LineRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.opacity = 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = boxDomainObject.isSelected ? 0.75 : 0.5;
  material.side = FrontSide;
  material.flatShading = false;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}

function adjustLabel(
  point: Vector3,
  domainObject: LineDomainObject,
  style: LineRenderStyle,
  spriteHeight: number
): void {
  if (domainObject.primitiveType !== PrimitiveType.VerticalArea) {
    point.y += (1.1 * spriteHeight) / 2 + style.pipeRadius;
  }
}

function getRadius(domainObject: LineDomainObject, style: LineRenderStyle): number {
  return domainObject.isSelected ? style.selectedPipeRadius : style.pipeRadius;
}

function getSelectRadius(domainObject: LineDomainObject, style: LineRenderStyle): number {
  return 1.5 * style.selectedPipeRadius; // Added more to make it easier to pick
}
