/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  CylinderGeometry,
  FrontSide,
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
import { Range3 } from '../../base/utilities/geometry/Range3';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const CYLINDER_DEFAULT_AXIS = new Vector3(0, 1, 0);

export class MeasureLineView extends GroupThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get lineDomainObject(): MeasureLineDomainObject {
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
  // OVERRIDES of GroupThreeView
  // ==================================================

  protected override addChildren(): void {
    this.addChild(this.createCylinders());
    this.addLabels();
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    if (this.domainObject.isSelected) {
      return undefined;
    }
    return super.intersectIfCloser(intersectInput, closestDistance);
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  private createCylinders(): Mesh | undefined {
    const { lineDomainObject, style } = this;
    const { points } = lineDomainObject;
    const { length } = points;
    if (length < 2) {
      return undefined;
    }
    const radius = 0.03; // this.getTextHeight(style.relativeTextSize) * 0.2;
    if (radius <= 0) {
      return;
    }
    const geometries: CylinderGeometry[] = [];
    const loopLength = lineDomainObject.measureType === MeasureType.Polygon ? length + 1 : length;

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
    updateSolidMaterial(material, lineDomainObject, style);
    return new Mesh(mergeGeometries(geometries, false), material);
  }

  private createLines(): Wireframe | undefined {
    const { lineDomainObject, style } = this;
    const vertices = createVertices(lineDomainObject);
    if (vertices === undefined) {
      return undefined;
    }
    const color = lineDomainObject.getColorByColorType(style.colorType);
    const linewidth = lineDomainObject.isSelected ? style.selectedLineWidth : style.lineWidth;
    const geometry = new LineSegmentsGeometry().setPositions(vertices);
    const material = new LineMaterial({
      linewidth: linewidth / 50,
      color,
      resolution: new Vector2(1000, 1000),
      worldUnits: true,
      depthTest: style.depthTest
    });
    return new Wireframe(geometry, material);
  }

  private addLabels(): void {
    const { lineDomainObject, style } = this;
    const { points } = lineDomainObject;
    const { length } = points;
    if (length < 2) {
      return;
    }
    const spriteHeight = this.getTextHeight(style.relativeTextSize);
    if (spriteHeight <= 0) {
      return;
    }
    const loopLength = lineDomainObject.measureType === MeasureType.Polygon ? length : length - 1;
    const center = new Vector3();
    for (let i = 0; i < loopLength; i++) {
      const point1 = points[i % length];
      const point2 = points[(i + 1) % length];
      const distance = point1.distanceTo(point2);

      center.copy(point1).add(point2).divideScalar(2);
      center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      const sprite = createSprite(distance.toFixed(2), style, spriteHeight);
      if (sprite === undefined) {
        continue;
      }
      center.y += spriteHeight / 2;
      sprite.position.copy(center);
      this.addChild(sprite);
    }
  }

  private getTextHeight(relativeTextSize: number): number {
    const { lineDomainObject } = this;
    const { points } = lineDomainObject;
    if (points.length < 2) {
      return 0;
    }
    const range = new Range3();
    for (const point of points) {
      range.add(point);
    }
    return relativeTextSize * range.diagonal;
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
  result.material.depthTest = true;
  result.material.transparent = true;
  result.material.opacity = 0.75;
  result.material.depthTest = style.depthTest;
  return result;
}

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: MeasureLineDomainObject,
  style: MeasureLineRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  const selected = boxDomainObject.isSelected;
  material.color = color;
  material.opacity = 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = selected ? 0.6 : 0.2;
  material.side = FrontSide;
  material.flatShading = false;
  material.depthWrite = false;
  material.depthTest = style.depthTest;
}
