import { Operator, ValueByDataType, ValueByField } from '../../types';
import { isValueByField } from '../isValueByField';

describe('isValueByField', () => {
  it('should return true for an empty object', () => {
    const emptyObject: ValueByDataType = {};
    expect(isValueByField(emptyObject)).toBe(true);
  });

  it('should return true for an object with a valid ValueByField', () => {
    const valueByField: ValueByField = {
      someField: {
        operator: Operator.EQUALS,
        value: 'someValue',
      },
    };
    expect(isValueByField(valueByField)).toBe(true);
  });

  it('should return false for an object with a valid ValueByDataType', () => {
    const valueByField: ValueByDataType = {
      someDataType: {
        someField: {
          operator: Operator.EQUALS,
          value: 'someValue',
        },
      },
    };
    expect(isValueByField(valueByField)).toBe(false);
  });
});
