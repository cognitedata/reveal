/*!
 * Copyright 2025 Cognite AS
 */

import { assert, describe, expect, test } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type LineDomainObject } from './LineDomainObject';
import { MeasureLineDomainObject } from '../../measurements/MeasureLineDomainObject';
import { Box3, Vector3 } from 'three';
import { expectEqualBox3 } from '#test-utils/primitives/primitiveTestUtil';
import {
  horizontalDistanceTo,
  verticalDistanceTo
} from '../../../base/utilities/extensions/vectorExtensions';
import { LineRenderStyle } from './LineRenderStyle';

describe('LineDomainObject', () => {
  test('should be empty', () => {
    for (const primitiveType of [
      PrimitiveType.Line,
      PrimitiveType.Polyline,
      PrimitiveType.Polygon
    ]) {
      const domainObject = new MeasureLineDomainObject(primitiveType);
      expect(domainObject.primitiveType).toBe(primitiveType);
      expect(domainObject.color.getHex()).toBe(0xff0000);
      expect(domainObject.points).toHaveLength(0);
      expect(domainObject.isLegal).toBe(false);
      expect(domainObject.icon?.length).greaterThan(0);
      expect(isEmpty(domainObject.typeName)).toBe(false);
      expect(domainObject.renderStyle).instanceOf(LineRenderStyle);
      expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
      expect(domainObject.getTotalLength());
    }
  });

  test('should single line have geometry', () => {
    const domainObject = new MeasureLineDomainObject(PrimitiveType.Line);
    const first = new Vector3(1, 2, 3);
    const last = new Vector3(4, 6, 8);
    domainObject.points.push(first, last);

    expect(domainObject.pointCount).toBe(2);
    expect(domainObject.lineSegmentCount).toBe(1);
    expect(domainObject.firstPoint).toBe(first);
    expect(domainObject.lastPoint).toBe(last);
    expect(domainObject.isClosed).toBe(false);
    expect(domainObject.isLegal).toBe(true);
    expect(domainObject.getTotalLength()).toBeCloseTo(last.distanceTo(first));
    expect(domainObject.getAverageLength()).toBeCloseTo(domainObject.getTotalLength());
    expect(domainObject.getHorizontalLength()).toBeCloseTo(horizontalDistanceTo(first, last));
    expect(domainObject.getVerticalLength()).toBeCloseTo(verticalDistanceTo(first, last));
    expect(domainObject.getHorizontalArea()).toBeCloseTo(0);

    const boundingBox = domainObject.getBoundingBox();
    expectEqualBox3(boundingBox, new Box3(first, last));
  });

  test('should polyline or polygon have geometry', () => {
    for (const primitiveType of [PrimitiveType.Polyline, PrimitiveType.Polygon]) {
      const isPolygon = primitiveType === PrimitiveType.Polygon;
      const domainObject = createLineDomainObject(primitiveType);
      expect(domainObject.pointCount).toBe(4);
      expect(domainObject.lineSegmentCount).toBe(isPolygon ? 4 : 3);
      expect(domainObject.isClosed).toBe(isPolygon);
      expect(domainObject.isLegal).toBe(true);
      expect(domainObject.getTotalLength()).toBeCloseTo(isPolygon ? 8 : 6);
      expect(domainObject.getAverageLength()).toBeCloseTo(2);
      expect(domainObject.getHorizontalLength()).toBeCloseTo(isPolygon ? 8 : 6);
      expect(domainObject.getVerticalLength()).toBeCloseTo(0);
      expect(domainObject.getHorizontalArea()).toBeCloseTo(isPolygon ? 4 : 0);

      const boundingBox = domainObject.getBoundingBox();
      expectEqualBox3(boundingBox, new Box3(domainObject.points[0], domainObject.points[2]));
    }
  });

  test('should be cloned', () => {
    const domainObject = createLineDomainObject(PrimitiveType.Box);
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(MeasureLineDomainObject);
    expect(clone).not.toBe(domainObject);
    if (!(clone instanceof MeasureLineDomainObject)) {
      return;
    }
    expect(clone.primitiveType).toStrictEqual(domainObject.primitiveType);
    expect(clone.points).toStrictEqual(domainObject.points);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('should create info', () => {
    testMe(PrimitiveType.Line, Quantity.Length, 3);
    testMe(PrimitiveType.Line, Quantity.Area, 0);
    testMe(PrimitiveType.Polyline, Quantity.Length, 2);
    testMe(PrimitiveType.Polyline, Quantity.Area, 0);
    testMe(PrimitiveType.Polygon, Quantity.Length, 2);
    testMe(PrimitiveType.Polygon, Quantity.Area, 1);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createLineDomainObject(primitiveType);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      assert(info !== undefined);
      expect(info.getItemsByQuantity(quantity)).toHaveLength(expectedItems);
    }
  });
});

function createLineDomainObject(primitiveType: PrimitiveType): LineDomainObject {
  const domainObject = new MeasureLineDomainObject(primitiveType);
  switch (primitiveType) {
    case PrimitiveType.Line:
      domainObject.points.push(new Vector3(0, 0, 0));
      domainObject.points.push(new Vector3(1, 2, 3));
      break;

    case PrimitiveType.Polyline:
    case PrimitiveType.Polygon:
      domainObject.points.push(new Vector3(0, 0, 0));
      domainObject.points.push(new Vector3(1, 0, 0));
      domainObject.points.push(new Vector3(1, 1, 0));
      domainObject.points.push(new Vector3(0, 1, 0));
      break;
  }
  // Translate the points
  for (const point of domainObject.points) {
    point.x *= 2;
    point.y *= 2;
    point.x += 14.245;
    point.y += 51.562;
    point.z += 23.951;
  }
  return domainObject;
}
