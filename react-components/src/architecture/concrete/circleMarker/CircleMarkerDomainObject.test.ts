import { describe, expect, test } from 'vitest';
import { CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';
import { CircleMarkerDomainObject } from './CircleMarkerDomainObject';
import { EventChangeTester } from '../../../../tests/tests-utilities/architecture/EventChangeTester';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { Range1 } from '../../base/utilities/geometry/Range1';

describe(CircleMarkerDomainObject.name, () => {
  test('should have initial state', () => {
    const domainObject = new CircleMarkerDomainObject();
    expect(domainObject.label).toBe('Circle marker');
    expect(domainObject.isVisibleInTree).toBe(false);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(CircleMarkerRenderStyle);
  });

  test('should change color', () => {
    const domainObject = new CircleMarkerDomainObject();
    const tester = new EventChangeTester(domainObject, Changes.color);

    domainObject.setWarningColor();
    tester.toHaveBeenCalledTimes(1);

    domainObject.setDefaultColor();
    tester.toHaveBeenCalledTimes(2);
  });

  test('should update when radius is changed', () => {
    const domainObject = new CircleMarkerDomainObject();
    const tester = new EventChangeTester(domainObject, Changes.geometry);

    domainObject.onWheel(1);
    tester.toHaveBeenCalledTimes(1);

    domainObject.onWheel(0); // To small
    tester.toHaveBeenCalledTimes(1);
  });

  test('should not update when radius is is outside legalRadiusRange', () => {
    const domainObject = new CircleMarkerDomainObject();
    const tester = new EventChangeTester(domainObject, Changes.geometry);

    const newLegalRadiusRange = new Range1(domainObject.radius);
    newLegalRadiusRange.expandByFraction(0.01);

    domainObject.legalRadiusRange.set(newLegalRadiusRange.min, newLegalRadiusRange.min);

    expect(domainObject.legalRadiusRange).toStrictEqual(newLegalRadiusRange);

    domainObject.onWheel(1);
    tester.toHaveBeenCalledTimes(0);
  });
});
