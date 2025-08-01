import { describe, expect, test } from 'vitest';
import { MeasurePointCreator } from './MeasurePointCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { MeasurePointDomainObject } from './MeasurePointDomainObject';

describe(MeasurePointCreator.name, () => {
  test('Create the MeasurePointDomainObject by mimics the user clicking', () => {
    const domainObject = new MeasurePointDomainObject();
    const creator = new MeasurePointCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const expectedCenter = new Vector3(2, 3, 4);
    const rayOrigin = new Vector3(2, 3, 6);
    const rayDirection = new Vector3(0, 0, -1);
    click(creator, rayOrigin, rayDirection, true, expectedCenter);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.point, expectedCenter);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create not create the MeasurePointDomainObject by mimics the user clicking in the air', () => {
    const domainObject = new MeasurePointDomainObject();
    const creator = new MeasurePointCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const rayOrigin = new Vector3(2, 3, 6);
    const rayDirection = new Vector3(0, 0, -1);
    click(creator, rayOrigin, rayDirection, false); // Not final click, should not create the point

    expect(domainObject.point).toStrictEqual(new Vector3(0, 0, 0));
    expect(domainObject.focusType).toBe(FocusType.Pending);
  });
});
