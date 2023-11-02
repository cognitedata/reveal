import { mockTFunction } from '@fdx/shared/fixtures';
import { TFunction } from '@fdx/shared/hooks/useTranslation';
import {
  FieldType,
  FieldValue,
  Operator,
  ValueType,
} from '@fdx/shared/types/filters';

import { getChipLabel } from '../getChipLabel';

describe('getChipLabel', () => {
  const dataType: string = 'dataType';
  const label: string = 'field';
  const operator: Operator = Operator.STARTS_WITH;
  const value: ValueType = 'value';
  const type: FieldType = 'string';
  const t: TFunction = mockTFunction;
  const operatorText = t(operator).toLowerCase();

  it('should handle when dataType is undefined', () => {
    const fieldValue: FieldValue = { label, operator, value, type };
    const result = getChipLabel({ fieldValue, t });
    expect(result).toBe(`${label} ${operatorText} ${value}`);
  });

  it('should handle undefined values', () => {
    const fieldValue: FieldValue = { label, operator, type } as FieldValue;
    const result = getChipLabel({ fieldValue, t });
    expect(result).toBe(`${label} ${operatorText}`);
  });

  it('should handle include dataType when available', () => {
    const fieldValue: FieldValue = { label, operator, value, type };
    const result = getChipLabel({ dataType, fieldValue, t });
    expect(result).toBe(`${dataType} ${label} ${operatorText} ${value}`);
  });

  it(`should include 'and' when the value is an array`, () => {
    const fieldValue: FieldValue = {
      label,
      operator,
      value: [0, 1],
      type,
    };
    const result = getChipLabel({ dataType, fieldValue, t });
    expect(result).toContain('and');
  });
});
