import { describe, expect, test } from 'vitest';
import { PointCreator } from './PointCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { MeasurePointDomainObject } from '../../measurements/MeasurePointDomainObject';

const direction = new Vector3(1, 0, -1);

describe(PointCreator.name, () => {
  test('Create Point by mimics the user clicking', () => {
    const domainObject = new MeasurePointDomainObject();
    const creator = new PointCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), direction, false, new Vector3(0, 0, 0));

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.point, new Vector3(2, 1, 1));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});
