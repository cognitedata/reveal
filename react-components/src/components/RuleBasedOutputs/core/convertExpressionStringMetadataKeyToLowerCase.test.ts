/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Expression } from '../types';
import { convertExpressionStringMetadataKeyToLowerCase } from './convertExpressionStringMetadataKeyToLowerCase';
import { mockedExpressionFdmMappingString } from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('convertExpressionStringMetadataKeyToLowerCase', () => {
  it('should convert metadata key to lowercase for stringExpression type', () => {
    const expression: Expression = {
      type: 'stringExpression',
      trigger: {
        type: 'metadata',
        key: 'SomeKey'
      },
      condition: {
        type: 'contains',
        parameter: 'value'
      }
    };

    convertExpressionStringMetadataKeyToLowerCase(expression);

    expect(expression.trigger.key).toBe('somekey');
  });

  it('should not convert key for stringExpression with no metadata type', () => {
    convertExpressionStringMetadataKeyToLowerCase(mockedExpressionFdmMappingString);

    const dataResult =
      mockedExpressionFdmMappingString.type === 'stringExpression' &&
      mockedExpressionFdmMappingString.trigger.type === 'fdm'
        ? mockedExpressionFdmMappingString.trigger.key
        : undefined;

    expect(dataResult?.property).toBe('mockedProperty');
  });
});
