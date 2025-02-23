/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Expression } from '../types';
import { traverseExpressionToGetTimeseries } from './traverseExpressionToGetTimeseries';

describe('traverseExpressionToGetTimeseries', () => {
  it('should return unique timeseries external IDs for "or" expression', () => {
    const expressions: Expression[] = [
      {
        type: 'or',
        expressions: [
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-1' },
            condition: { type: 'greaterThan', parameters: [10] }
          },
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-2' },
            condition: { type: 'greaterThan', parameters: [20] }
          }
        ]
      }
    ];

    const result = traverseExpressionToGetTimeseries(expressions);

    expect(result).toEqual(['timeseries-1', 'timeseries-2']);
  });

  it('should return unique timeseries external IDs for "and" expression', () => {
    const expressions: Expression[] = [
      {
        type: 'and',
        expressions: [
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-1' },
            condition: { type: 'greaterThan', parameters: [10] }
          },
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-2' },
            condition: { type: 'greaterThan', parameters: [20] }
          }
        ]
      }
    ];

    const result = traverseExpressionToGetTimeseries(expressions);

    expect(result).toEqual(['timeseries-1', 'timeseries-2']);
  });

  it('should return unique timeseries external IDs for "not" expression', () => {
    const expressions: Expression[] = [
      {
        type: 'not',
        expression: {
          type: 'numericExpression',
          trigger: { type: 'timeseries', externalId: 'timeseries-1' },
          condition: { type: 'greaterThan', parameters: [10] }
        }
      }
    ];

    const result = traverseExpressionToGetTimeseries(expressions);

    expect(result).toEqual(['timeseries-1']);
  });

  it('should return unique timeseries external IDs for "numericExpression"', () => {
    const expressions: Expression[] = [
      {
        type: 'numericExpression',
        trigger: { type: 'timeseries', externalId: 'timeseries-1' },
        condition: { type: 'greaterThan', parameters: [10] }
      }
    ];

    const result = traverseExpressionToGetTimeseries(expressions);

    expect(result).toEqual(['timeseries-1']);
  });

  it('should return empty array if expressions are undefined', () => {
    const result = traverseExpressionToGetTimeseries(undefined);

    expect(result).toEqual([]);
  });

  it('should return unique timeseries external IDs with duplicates removed', () => {
    const expressions: Expression[] = [
      {
        type: 'or',
        expressions: [
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-1' },
            condition: { type: 'greaterThan', parameters: [10] }
          },
          {
            type: 'numericExpression',
            trigger: { type: 'timeseries', externalId: 'timeseries-1' },
            condition: { type: 'greaterThan', parameters: [20] }
          }
        ]
      }
    ];

    const result = traverseExpressionToGetTimeseries(expressions);

    expect(result).toEqual(['timeseries-1']);
  });
});
