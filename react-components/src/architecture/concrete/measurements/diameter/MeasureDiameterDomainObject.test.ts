import { describe, expect, test } from 'vitest';
import { MeasureDiameterDomainObject } from './MeasureDiameterDomainObject';
import { isEmpty } from '../../../base/utilities/translation/TranslateInput';

describe(MeasureDiameterDomainObject.name, () => {
  test('Should have initial state', () => {
    const domainObject = new MeasureDiameterDomainObject();
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(isEmpty(domainObject.typeName)).toBe(false);
  });

  test('Should clone', () => {
    const domainObject = new MeasureDiameterDomainObject();
    expect(domainObject.clone()).instanceOf(MeasureDiameterDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });
});
