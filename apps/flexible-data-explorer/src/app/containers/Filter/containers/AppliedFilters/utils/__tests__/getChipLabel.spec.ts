import { mockTFunction } from '../../../../../../../app/fixtures';
import { TFunction } from '../../../../../../hooks/useTranslation';
import { FieldType, FieldValue, Operator, ValueType } from '../../../../types';
import { getChipLabel } from '../getChipLabel';

describe('getChipLabel', () => {
  const dataType: string = 'dataType';
  const field: string = 'field';
  const operator: Operator = Operator.STARTS_WITH;
  const value: ValueType = 'value';
  const type: FieldType = 'string';
  const t: TFunction = mockTFunction;
  const operatorText = t(operator).toLowerCase();

  it('should handle when dataType is undefined', () => {
    const fieldValue: FieldValue = { operator, value, type };
    const result = getChipLabel({ field, fieldValue, t });
    expect(result).toBe(`${field} ${operatorText} ${value}`);
  });

  it('should handle undefined values', () => {
    const fieldValue: FieldValue = { operator, type } as FieldValue;
    const result = getChipLabel({ field, fieldValue, t });
    expect(result).toBe(`${field} ${operatorText}`);
  });

  it('should handle include dataType when available', () => {
    const fieldValue: FieldValue = { operator, value, type };
    const result = getChipLabel({ dataType, field, fieldValue, t });
    expect(result).toBe(`${dataType} ${field} ${operatorText} ${value}`);
  });

  it(`should include 'and' when the value is an array`, () => {
    const fieldValue: FieldValue = {
      operator,
      value: [0, 1],
      type,
    };
    const result = getChipLabel({ dataType, field, fieldValue, t });
    expect(result).toContain('and');
  });
});
