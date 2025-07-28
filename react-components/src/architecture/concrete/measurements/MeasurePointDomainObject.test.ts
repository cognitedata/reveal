import { describe, expect, test } from 'vitest';
import { MeasurePointDomainObject } from './MeasurePointDomainObject';
import { Vector3 } from 'three';

describe(MeasurePointDomainObject.name, () => {
  test('Should set and get the point', () => {
    const domainObject = new MeasurePointDomainObject();

    const expectedPoint = new Vector3(2, 3, 4);
    domainObject.point = expectedPoint;
    expect(domainObject.point).toStrictEqual(expectedPoint);
  });

  test('Should set and get the point size', () => {
    const domainObject = new MeasurePointDomainObject();

    const expectedPointSize = 3.14;
    domainObject.pointSize = expectedPointSize;
    expect(domainObject.pointSize).toBe(expectedPointSize);
  });
});
