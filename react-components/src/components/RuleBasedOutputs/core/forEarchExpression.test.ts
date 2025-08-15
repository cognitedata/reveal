/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, vi } from 'vitest';
import { forEachExpression } from './forEachExpression';
import { type Expression } from '../types';
import {
  mockedExpressionAssetMappingNumeric,
  mockedExpressionAssetMappingString1,
  mockedExpressionFdmMappingBoolean,
  mockedExpressionFdmMappingDatetime
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('forEachExpression', () => {
  it('should call callback for each expression in an "and" expression', () => {
    const callback = vi.fn();
    const expression: Expression = {
      type: 'and',
      expressions: [mockedExpressionAssetMappingString1, mockedExpressionAssetMappingNumeric]
    };

    forEachExpression(expression, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(expression);
    expect(callback).toHaveBeenCalledWith(expression.expressions[0]);
    expect(callback).toHaveBeenCalledWith(expression.expressions[1]);
  });

  it('should call callback for each expression in an "or" expression', () => {
    const callback = vi.fn();
    const expression: Expression = {
      type: 'or',
      expressions: [mockedExpressionAssetMappingString1, mockedExpressionFdmMappingBoolean]
    };

    forEachExpression(expression, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(expression);
    expect(callback).toHaveBeenCalledWith(expression.expressions[0]);
    expect(callback).toHaveBeenCalledWith(expression.expressions[1]);
  });

  it('should call callback for the expression in a "not" expression', () => {
    const callback = vi.fn();
    const expression: Expression = {
      type: 'not',
      expression: mockedExpressionFdmMappingBoolean
    };

    forEachExpression(expression, callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(expression);
    expect(callback).toHaveBeenCalledWith(expression.expression);
  });

  it('should call callback once for a "numericExpression"', () => {
    const callback = vi.fn();
    forEachExpression(mockedExpressionAssetMappingNumeric, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockedExpressionAssetMappingNumeric);
  });

  it('should call callback for a "stringExpression"', () => {
    const callback = vi.fn();
    forEachExpression(mockedExpressionAssetMappingString1, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockedExpressionAssetMappingString1);
  });

  it('should call callback for a "datetimeExpression"', () => {
    const callback = vi.fn();
    forEachExpression(mockedExpressionFdmMappingDatetime, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockedExpressionFdmMappingDatetime);
  });

  it('should call callback for a "booleanExpression"', () => {
    const callback = vi.fn();
    forEachExpression(mockedExpressionFdmMappingBoolean, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockedExpressionFdmMappingBoolean);
  });

  it('should throw an error for an unknown expression type', () => {
    const callback = vi.fn();
    const expression = {
      type: 'unknownType',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'equals', parameter: true }
    };

    expect(() => {
      forEachExpression(expression as unknown as Expression, callback);
    }).toThrow();
  });
});
