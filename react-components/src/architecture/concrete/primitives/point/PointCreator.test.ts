import { describe, expect, test } from 'vitest';
import { PointCreator } from './PointCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { MeasurePointDomainObject } from '../../measurements/MeasurePointDomainObject';

describe(PointCreator.name, () => {
  test('Create Point by mimics the user clicking', () => {
    const domainObject = new MeasurePointDomainObject();
    const creator = new PointCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const expectedCenter = new Vector3(2, 3, 4);
    const rayOrigin = new Vector3(2, 3, 6);
    const rayDirection = new Vector3(0, 0, -1);
    click(creator, rayOrigin, rayDirection, true, expectedCenter);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.center, expectedCenter);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});
