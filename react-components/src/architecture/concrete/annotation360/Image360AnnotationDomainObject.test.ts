/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { LineRenderStyle } from '../primitives/line/LineRenderStyle';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { forEach } from 'lodash';
import { type AnnotationStatus } from './types';

const CONNECTED_IMAGE_ID = 'My Id';
const CENTER = new Vector3(5, 6, 7);

describe(Image360AnnotationDomainObject.name, () => {
  test('should be empty', () => {
    const domainObject = new Image360AnnotationDomainObject(CONNECTED_IMAGE_ID);
    expect(domainObject.icon?.length).greaterThan(0);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.primitiveType).toBe(PrimitiveType.Polygon);
    expect(domainObject.points).toHaveLength(0);
    expect(domainObject.isLegal).toBe(false);
    expect(domainObject.renderStyle).instanceOf(LineRenderStyle);
    expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
    expect(domainObject.hasPanelInfo).toBe(false);

    // Unique properties of Image360AnnotationDomainObject
    expect(domainObject.connectedImageId).toBe(CONNECTED_IMAGE_ID);
    expect(domainObject.center).toStrictEqual(new Vector3());
    expect(domainObject.vectorLength).greaterThan(0);
    expect(domainObject.annotationIdentifier).toBeUndefined();
    expect(domainObject.assetRef).toBeUndefined();
    expect(domainObject.status).toBe('pending');
  });

  test('should transform a vector to a point in space', () => {
    const domainObject = new Image360AnnotationDomainObject(CONNECTED_IMAGE_ID);
    const vector = new Vector3(1, 2, 3).normalize();
    const expected = domainObject.center.clone().addScaledVector(vector, domainObject.vectorLength);

    const transformedPoint = domainObject.getTransformedPoint(vector);
    expect(transformedPoint).toEqual(expected);

    const copyTransformedPoint = domainObject.getCopyOfTransformedPoint(vector, new Vector3());
    expect(copyTransformedPoint).toEqual(expected);
  });

  test('should get 4 triangle indexes', () => {
    const domainObject = createSquareShapedAnnotation();
    const indexes = domainObject.getTriangleIndexes();
    expect(indexes).toHaveLength(6);
  });

  test('should have one unique color for each status', () => {
    const domainObject = createSquareShapedAnnotation();
    const uniqueColors = new Set<number>();

    const statuses: AnnotationStatus[] = ['pending', 'saved', 'suggested', 'deleted'];
    for (const status of statuses) {
      domainObject.status = status;
      const color = domainObject.color.getHex();
      expect(uniqueColors.has(color)).toBe(false);
      uniqueColors.add(domainObject.color.getHex());
    }
  });

  test('should be cloned', () => {
    const domainObject = createSquareShapedAnnotation();
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(Image360AnnotationDomainObject);
    expect(clone).not.toBe(domainObject);
    if (!(clone instanceof Image360AnnotationDomainObject)) {
      return;
    }
    expect(clone.primitiveType).toStrictEqual(domainObject.primitiveType);
    expect(clone.points).toStrictEqual(domainObject.points);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);

    // Unique properties of Image360AnnotationDomainObject
    expect(clone.connectedImageId).toBe(domainObject.connectedImageId);
    expect(clone.center).toStrictEqual(domainObject.center);
    expect(clone.vectorLength).toBe(domainObject.vectorLength);
    expect(clone.annotationIdentifier).toBe(domainObject.annotationIdentifier);
    expect(clone.assetRef).toBe(domainObject.assetRef);
    expect(clone.status).toBe(domainObject.status);
  });
});

function createSquareShapedAnnotation(): Image360AnnotationDomainObject {
  const domainObject = new Image360AnnotationDomainObject(CONNECTED_IMAGE_ID);
  domainObject.center.copy(CENTER);
  domainObject.points.push(...createSquareToEdgeOfUnitSphere());
  return domainObject;
}

function createSquareToEdgeOfUnitSphere(): Vector3[] {
  const vectors: Vector3[] = [];
  const z = -5;
  vectors.push(new Vector3(0, 0, z));
  vectors.push(new Vector3(1, 0, z));
  vectors.push(new Vector3(1, 1, z));
  vectors.push(new Vector3(0, 1, z));
  forEach(vectors, (vector: Vector3) => vector.normalize());
  return vectors;
}
