/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Sprite, Vector2, Vector3 } from 'three';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { MeasureType } from './MeasureType';
import { createSpriteWithText } from '../../base/utilities/sprites/createSprite';
import { Range3 } from '../../base/utilities/geometry/Range3';

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
    this.addChild(this.createWireframe());
    this.addLabels();
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  private createWireframe(): Wireframe | undefined {
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

    // Alternative:
    // https://discourse.threejs.org/t/how-do-i-align-a-cylinder-along-an-axis/30860
    //  import { BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
      const matrix = CDF_TO_VIEWER_TRANSFORMATION;
      center.applyMatrix4(matrix);
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
    const matrix = CDF_TO_VIEWER_TRANSFORMATION;
    point.applyMatrix4(matrix);
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
