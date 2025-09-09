import { describe, expect, test } from 'vitest';
import { MeasureDiameterDomainObject } from './MeasureDiameterDomainObject';

describe(MeasureDiameterDomainObject.name, () => {
  test('Should have initial state', () => {
    const domainObject = new MeasureDiameterDomainObject();
    expect(domainObject.hasIndexOnLabel).toBe(false);
  });

  test('Should clone', () => {
    const domainObject = new MeasureDiameterDomainObject();
    expect(domainObject.clone()).instanceOf(MeasureDiameterDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });
});
