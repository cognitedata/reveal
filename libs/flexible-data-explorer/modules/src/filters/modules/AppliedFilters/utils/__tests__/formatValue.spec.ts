import { FieldType, ValueType } from '@fdx/shared/types/filters';

import { formatValue } from '../formatValue';

jest.mock('@fdx/shared/utils/date');

describe('formatValue', () => {
  const TYPE: FieldType = 'number';
  const NON_ARRAY_VALUE: ValueType = 0;
  const ARRAY_VALUE: ValueType = [NON_ARRAY_VALUE, NON_ARRAY_VALUE];

  it('should return array if the value is an array', () => {
    const result = formatValue(ARRAY_VALUE, TYPE);
    expect(result).toHaveLength(ARRAY_VALUE.length);
  });

  it('should return single value if the value is not an array', () => {
    const result = formatValue(NON_ARRAY_VALUE, TYPE);
    expect(Array.isArray(result)).toBe(false);
  });
});
