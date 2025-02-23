/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Expression, type TriggerTypeData } from '../types';
import { traverseExpression } from './traverseExpression';
import {
  mockedExpressionFdmMappingBoolean,
  mockedExpressionFdmMappingDatetime,
  mockedExpressionMultipleAnd,
  mockedExpressionMultipleOr,
  mockedFdmInstanceNodeWithConnectionAndPropertiesDatetime,
  triggerDataFDMBoolean
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('traverseExpression', () => {
  const triggerTypeData: TriggerTypeData[] = [
    {
      type: 'metadata',
      asset: {
        metadata: {
          mockedProperty: 'valueA'
        },
        rootId: 0,
        name: '',
        id: 0,
        lastUpdatedTime: new Date(),
        createdTime: new Date()
      }
    }
  ];

  it('should handle "or" expression', () => {
    const expressions: Expression[] = [mockedExpressionMultipleOr];

    const result = traverseExpression(triggerTypeData, expressions);

    expect(result).toEqual([true]);
  });

  it('should handle "and" expression', () => {
    const expressions: Expression[] = [mockedExpressionMultipleAnd];

    const result = traverseExpression(triggerTypeData, expressions);

    expect(result).toEqual([false]);
  });

  it('should handle "not" expression', () => {
    const expressions: Expression[] = [mockedExpressionFdmMappingBoolean];

    const result = traverseExpression(triggerTypeData, expressions);
    expect(result).toEqual([false]);
  });

  it('should handle "numericExpression"', () => {
    const triggerTypeDataNumeric: TriggerTypeData[] = [
      {
        type: 'metadata',
        asset: {
          metadata: {
            mockedProperty: '10'
          },
          rootId: 0,
          name: '',
          id: 0,
          lastUpdatedTime: new Date(),
          createdTime: new Date()
        }
      }
    ];
    const expressions: Expression[] = [
      {
        type: 'numericExpression',
        trigger: { type: 'metadata', key: 'mockedProperty' },
        condition: { type: 'greaterThan', parameters: [10] }
      }
    ];

    const result = traverseExpression(triggerTypeDataNumeric, expressions);

    expect(result).toEqual([false]);
  });

  it('should handle "stringExpression"', () => {
    const expressions: Expression[] = [
      {
        type: 'stringExpression',
        trigger: { type: 'metadata', key: 'mockedProperty' },
        condition: { type: 'contains', parameter: 'valueA' }
      }
    ];

    const result = traverseExpression(triggerTypeData, expressions);

    expect(result).toEqual([true]);
  });

  it('should handle "datetimeExpression"', () => {
    const triggerTypeDataDatetime: TriggerTypeData[] = [
      {
        type: 'fdm',
        instanceNode: mockedFdmInstanceNodeWithConnectionAndPropertiesDatetime
      }
    ];
    const result = traverseExpression(triggerTypeDataDatetime, [
      mockedExpressionFdmMappingDatetime
    ]);

    expect(result).toEqual([true]);
  });

  it('should handle "booleanExpression"', () => {
    const result = traverseExpression([triggerDataFDMBoolean], [mockedExpressionFdmMappingBoolean]);

    expect(result).toEqual([false]);
  });
});
