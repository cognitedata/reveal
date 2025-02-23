/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Expression } from '../types';
import { getExpressionTriggerTypes } from './getExpressionTriggerTypes';
import {
  mockedExpressionAssetMappingNumeric,
  mockedExpressionAssetMappingString1,
  mockedExpressionAssetMappingString2,
  mockedExpressionFdmMappingBoolean,
  mockedExpressionFdmMappingDatetime,
  mockedExpressionFdmMappingString
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('getExpressionTriggerTypes', () => {
  it('should return trigger types for "and" expression', () => {
    const expression: Expression = {
      type: 'and',
      expressions: [mockedExpressionFdmMappingBoolean, mockedExpressionAssetMappingNumeric]
    };

    const result = getExpressionTriggerTypes(expression);

    expect(result).toEqual(['fdm', 'metadata']);
  });

  it('should return trigger types for "or" expression', () => {
    const expression: Expression = {
      type: 'or',
      expressions: [mockedExpressionFdmMappingString, mockedExpressionFdmMappingDatetime]
    };

    const result = getExpressionTriggerTypes(expression);

    expect(result).toEqual(['fdm', 'fdm']);
  });

  it('should return trigger types for "not" expression', () => {
    const expression: Expression = {
      type: 'not',
      expression: mockedExpressionAssetMappingString1
    };

    const result = getExpressionTriggerTypes(expression);

    expect(result).toEqual(['metadata']);
  });

  it('should return the correct trigger type for "numericExpression"', () => {
    const result = getExpressionTriggerTypes(mockedExpressionAssetMappingNumeric);

    expect(result).toEqual(['metadata']);
  });

  it('should return the correct trigger type for "stringExpression"', () => {
    const result = getExpressionTriggerTypes(mockedExpressionAssetMappingString2);

    expect(result).toEqual(['metadata']);
  });

  it('should return the correct trigger type for "datetimeExpression"', () => {
    const result = getExpressionTriggerTypes(mockedExpressionFdmMappingDatetime);

    expect(result).toEqual(['fdm']);
  });

  it('should return the correct trigger type for "booleanExpression"', () => {
    const result = getExpressionTriggerTypes(mockedExpressionFdmMappingBoolean);

    expect(result).toEqual(['fdm']);
  });

  it('should throw an error for an unknown expression type', () => {
    const expression = {
      type: 'unknownType',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'equals', parameter: true }
    };

    expect(() => getExpressionTriggerTypes(expression as unknown as Expression)).toThrow();
  });
});
