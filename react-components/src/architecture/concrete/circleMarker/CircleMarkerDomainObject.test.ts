import { describe, expect, test } from 'vitest';
import { CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';
import { CircleMarkerDomainObject, getOrCreateCircleMarker } from './CircleMarkerDomainObject';
import { EventChangeTester } from '#test-utils/architecture/EventChangeTester';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DomainObject } from '../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';

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

    domainObject.setWarningColor();
    tester.toHaveBeenCalledTimes(1);

    domainObject.setDefaultColor();
    tester.toHaveBeenCalledTimes(2);

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

    // With an initial radius of 0.3, onWheel(1) will produce a new radius of 0.285.
    // Set the legal range to not include this value to test the boundary condition.
    domainObject.legalRadiusRange.set(0.29, 5.0);

    domainObject.onWheel(1);
    tester.toHaveBeenCalledTimes(0);
  });

  test('should get the circle marker from root and create it if not present', () => {
    const root = new RootDomainObject();
    const domainObject = getOrCreateCircleMarker(root);

    expect(domainObject).toBeDefined();
    expect(getOrCreateCircleMarker(root)).toBe(domainObject);
  });
});

class RootDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Root' };
  }

  public override get isRoot(): boolean {
    return true;
  }
}
