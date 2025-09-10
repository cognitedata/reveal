import { describe, expect, test } from 'vitest';
import { isEmpty } from '../../base/utilities/translation/TranslateInput';
import { MeasureCylinderDomainObject } from './MeasureCylinderDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';

describe(MeasureCylinderDomainObject.name, () => {
  test('Should have initial state', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.Diameter);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(isEmpty(domainObject.typeName)).toBe(false);
  });

  test('Should clone', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.Diameter);
    expect(domainObject.clone()).instanceOf(MeasureCylinderDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });
});
