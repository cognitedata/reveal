import { DateRange, FieldValue, Operator } from '../../types/filters';
import {
  isNumericRange,
  isDateRange,
  convertDateRangeToNumericRange,
  convertDateFieldToNumericField,
} from '../filter';

describe('filter', () => {
  describe('isNumericRange', () => {
    it('should return false', () => {
      expect(isNumericRange('test')).toBe(false);
      expect(isNumericRange(0)).toBe(false);
      expect(isNumericRange(true)).toBe(false);
      expect(isNumericRange(new Date())).toBe(false);
      expect(isNumericRange([new Date(), new Date()])).toBe(false);
    });

    it('should return true', () => {
      expect(isNumericRange([0, 1])).toBe(true);
    });
  });

  describe('isDateRange', () => {
    it('should return false', () => {
      expect(isDateRange('test')).toBe(false);
      expect(isDateRange(0)).toBe(false);
      expect(isDateRange(true)).toBe(false);
      expect(isDateRange(new Date())).toBe(false);
      expect(isDateRange([0, 1])).toBe(false);
    });

    it('should return true', () => {
      expect(isDateRange([new Date(), new Date()])).toBe(true);
    });
  });

  describe('convertDateRangeToNumericRange', () => {
    it('should return undefined', () => {
      const min = new Date();
      const max = new Date();
      expect(convertDateRangeToNumericRange([min, max])).toStrictEqual([
        min.valueOf(),
        max.valueOf(),
      ]);
    });
  });

  describe('convertDateFieldToNumericField', () => {
    const label: string = 'label';

    it('should handle undefined value', () => {
      const result = convertDateFieldToNumericField();
      expect(result).toBeUndefined();
    });

    it('should return the same field value for numeric field', () => {
      const value: FieldValue = {
        label,
        operator: Operator.EQUALS,
        value: 0,
        type: 'number',
      };
      const result = convertDateFieldToNumericField(value);
      expect(result).toStrictEqual(value);
    });

    it('should return the same field value for numeric range field', () => {
      const value: FieldValue = {
        label,
        operator: Operator.BETWEEN,
        value: [0, 1],
        type: 'number',
      };
      const result = convertDateFieldToNumericField(value);
      expect(result).toStrictEqual(value);
    });

    it('should convert date field into numeric field', () => {
      const date = new Date();
      const value: FieldValue = {
        label,
        operator: Operator.ON,
        value: date,
        type: 'date',
      };
      const result = convertDateFieldToNumericField(value);
      expect(result).toStrictEqual({
        ...value,
        value: date.valueOf(),
      });
    });

    it('should convert date range field into numeric range field', () => {
      const dateRange: DateRange = [new Date(), new Date()];
      const value: FieldValue = {
        label,
        operator: Operator.BETWEEN,
        value: dateRange,
        type: 'date',
      };
      const result = convertDateFieldToNumericField(value);
      expect(result).toStrictEqual({
        ...value,
        value: convertDateRangeToNumericRange(dateRange),
      });
    });

    it('should return undefined', () => {
      const stringValue: FieldValue = {
        label,
        operator: Operator.STARTS_WITH,
        value: 'test',
        type: 'string',
      };
      expect(convertDateFieldToNumericField(stringValue)).toBeUndefined();

      const booleanValue: FieldValue = {
        label,
        operator: Operator.IS_TRUE,
        value: true,
        type: 'boolean',
      };
      expect(convertDateFieldToNumericField(booleanValue)).toBeUndefined();
    });
  });
});
