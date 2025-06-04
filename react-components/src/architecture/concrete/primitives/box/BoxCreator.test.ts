import { describe, expect, test } from 'vitest';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { BoxCreator } from './BoxCreator';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { Box } from '../../../base/utilities/primitives/Box';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';

const direction = new Vector3(1, 0, -1);

describe(BoxCreator.name, () => {
  test('Create Box by mimics the user clicking 4 times', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), direction, false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), direction, false);
    click(creator, new Vector3(1, 1, 1), direction, false);
    click(creator, new Vector3(2, 1, 1), direction, true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, 1, 1));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0.5, 0.5));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create HorizontalArea by mimics the user clicking 3 times', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.HorizontalArea);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), direction, false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), direction, false);
    click(creator, new Vector3(1, 1, 1), direction, true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, 1, Box.MinSize));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0.5, Box.MinSize / 2));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create VerticalArea  by mimics the user clicking 2 times', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.VerticalArea);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), direction, false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), direction, true, new Vector3(2, 0, 4));

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, Box.MinSize, 4));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0, 2));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});
