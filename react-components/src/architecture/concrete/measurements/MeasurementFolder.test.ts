import { describe, expect, test } from 'vitest';
import { MeasurementFolder } from './MeasurementFolder';
import { isEmpty } from '../../base/utilities/TranslateInput';

describe(MeasurementFolder.name, () => {
  test('Should have typename', () => {
    const domainObject = new MeasurementFolder();
    expect(isEmpty(domainObject.typeName)).toBe(false);
  });
});
