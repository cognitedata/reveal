/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  FrontSide,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  Quaternion,
  Sprite,
  Vector2,
  Vector3
} from 'three';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  CustomObjectIntersectInput,
  CustomObjectIntersection
} from '@cognite/reveal';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { MeasureType } from './MeasureType';
import { createSpriteWithText } from '../../base/utilities/sprites/createSprite';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { ClosestGeometryFinder } from '../../base/utilities/geometry/ClosestGeometryFinder';
import { square } from '../../base/utilities/extensions/mathExtensions';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';

const CYLINDER_DEFAULT_AXIS = new Vector3(0, 1, 0);
const RENDER_ORDER = 100;

export class MeasureLineView extends GroupThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get domainObject(): MeasureLineDomainObject {
    return super.domainObject as MeasureLineDomainObject;
  }

  protected override get style(): MeasureLineRenderStyle {
    return super.style as MeasureLineRenderStyle;
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

  protected override addChildren(): void {
    this.addChild(this.createPipe());
    this.addChild(this.createLines()); // Create a line so it can be seen from long distance
    this.addLabels();
  }

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    if (this.domainObject.focusType === FocusType.Pending) {
      return undefined; // Should never be picked
    }
    // Implement the intersection logic here, because of bug in tree.js
    const { domainObject, style } = this;
    const radius = getRadius(domainObject, style);
    if (radius <= 0) {
      return;
    }
    const { points } = domainObject;
    const { length } = points;
    if (length < 2) {
      return undefined;
    }
    // Just allocate all needed objects once
    const prevPoint = new Vector3();
    const thisPoint = new Vector3();
    const intersection = new Vector3();

    const radiusSquared = square(1.5 * radius); // Add 50% more to make it easier to pick
    const ray = intersectInput.raycaster.ray;
    const closestFinder = new ClosestGeometryFinder<DomainObjectIntersection>(ray.origin);

    if (closestDistance !== undefined) {
      closestFinder.minDistance = closestDistance;
    }
    const loopLength = domainObject.measureType === MeasureType.Polygon ? length + 1 : length;
    for (let i = 0; i < loopLength; i++) {
      thisPoint.copy(points[i % length]);
      thisPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      if (i === 0) {
        prevPoint.copy(thisPoint);
        continue;
      }
      const distanceSq = ray.distanceSqToSegment(prevPoint, thisPoint, undefined, intersection);
      if (distanceSq > radiusSquared || !closestFinder.isClosest(intersection)) {
        prevPoint.copy(thisPoint);
        continue;
      }
      const objectIntersection: DomainObjectIntersection = {
        type: 'customObject',
        point: intersection,
        distanceToCamera: closestFinder.minDistance,
        customObject: this,
        domainObject
      };
      closestFinder.setClosestGeometry(objectIntersection);
      prevPoint.copy(thisPoint);
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
    const { points } = domainObject;
    const { length } = points;
    if (length < 2) {
      return undefined;
    }
    const geometries: CylinderGeometry[] = [];
    const loopLength = domainObject.measureType === MeasureType.Polygon ? length + 1 : length;

    // Just allocate all needed objects once
    const prevPoint = new Vector3();
    const thisPoint = new Vector3();
    const quaternion = new Quaternion();
    const center = new Vector3();
    const direction = new Vector3();

    for (let i = 0; i < loopLength; i++) {
      thisPoint.copy(points[i % length]);
      thisPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      if (i > 0) {
        // create cylinder with length equal to the distance between successive vertices
        const distance = prevPoint.distanceTo(thisPoint);
        const cylinder = new CylinderGeometry(radius, radius, distance, 6, 1);

        // use quaterion to orient cylinder to align along the vector formed between
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
    return new Mesh(mergeGeometries(geometries, false), material);
  }

  private createWireframe(): Wireframe | undefined {
    const { domainObject, style } = this;
    const linewidth = domainObject.isSelected ? style.selectedLineWidth : style.lineWidth;
    if (linewidth === 0) {
      return undefined;
    }
    const vertices = createVertices(domainObject);
    if (vertices === undefined) {
      return undefined;
    }
    const color = domainObject.getColorByColorType(style.colorType);
    const geometry = new LineSegmentsGeometry().setPositions(vertices);
    const material = new LineMaterial({
      linewidth,
      color,
      resolution: new Vector2(1000, 1000),
      worldUnits: true,
      depthTest: style.depthTest
    });
    const result = new Wireframe(geometry, material);
    result.renderOrder = RENDER_ORDER;
    return result;
  }

  private createLines(): Line | undefined {
    const { domainObject, style } = this;
    const vertices = createVertices(domainObject);
    if (vertices === undefined) {
      return undefined;
    }
    const color = domainObject.getColorByColorType(style.colorType);
    const linewidth = domainObject.isSelected ? style.selectedLineWidth : style.lineWidth;
    const geometry = createBufferGeometry(vertices);
    const material = new LineBasicMaterial({
      linewidth,
      color,
      depthTest: style.depthTest
    });
    const result = new Line(geometry, material);
    result.renderOrder = RENDER_ORDER;
    return result;

    function createBufferGeometry(vertices: number[]): BufferGeometry {
      const verticesArray = new Float32Array(vertices);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
      return geometry;
    }
  }

  private addLabels(): void {
    const { domainObject, style } = this;
    const { points, rootDomainObject } = domainObject;
    if (rootDomainObject === undefined) {
      return;
    }
    const { length } = points;
    if (length < 2) {
      return;
    }
    const spriteHeight = this.getTextHeight(style.relativeTextSize);
    if (spriteHeight <= 0) {
      return;
    }
    const loopLength = domainObject.measureType === MeasureType.Polygon ? length : length - 1;
    const center = new Vector3();
    for (let i = 0; i < loopLength; i++) {
      const point1 = points[i % length];
      const point2 = points[(i + 1) % length];
      const distance = point1.distanceTo(point2);

      center.copy(point1).add(point2).divideScalar(2);
      center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      const text = rootDomainObject.unitSystem.toStringWithUnit(distance, Quantity.Length);
      const sprite = createSprite(text, style, spriteHeight);
      if (sprite === undefined) {
        continue;
      }
      adjustLabel(center, domainObject, style, spriteHeight);
      sprite.position.copy(center);
      this.addChild(sprite);
    }
  }

  private getTextHeight(relativeTextSize: number): number {
    return relativeTextSize * this.domainObject.getAverageLength();
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Create object3D's
// ==================================================

function createVertices(domainObject: MeasureLineDomainObject): number[] | undefined {
  const { points } = domainObject;
  const { length } = points;
  if (length < 2) {
    return undefined;
  }
  const vertices: number[] = [];
  const loopLength = domainObject.measureType === MeasureType.Polygon ? length + 1 : length;

  for (let i = 0; i < loopLength; i++) {
    const point = points[i % length].clone();
    point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    vertices.push(...point);
    if (i > 0 && i < loopLength - 1) {
      vertices.push(...point);
    }
  }
  return vertices;
}

function createSprite(
  text: string,
  style: MeasureLineRenderStyle,
  height: number
): Sprite | undefined {
  const result = createSpriteWithText(text, height, style.textColor, style.textBgColor);
  if (result === undefined) {
    return undefined;
  }
  result.material.transparent = true;
  result.material.opacity = style.textOpacity;
  result.material.depthTest = style.depthTest;
  result.renderOrder = RENDER_ORDER;
  return result;
}

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: MeasureLineDomainObject,
  style: MeasureLineRenderStyle
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
  domainObject: MeasureLineDomainObject,
  style: MeasureLineRenderStyle,
  spriteHeight: number
): void {
  if (domainObject.measureType !== MeasureType.VerticalArea) {
    point.y += (1.1 * spriteHeight) / 2 + style.pipeRadius;
  }
}

function getRadius(domainObject: MeasureLineDomainObject, style: MeasureLineRenderStyle): number {
  return domainObject.isSelected ? style.selectedPipeRadius : style.pipeRadius;
}
