/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type NumericExpression } from '../types';
import { getTimeseriesExternalIdFromNumericExpression } from './getTimeseriesExternalIdFromNumericExpression';
import {
  mockedExpressionAssetMappingNumericTimeseries,
  mockedExpressionFdmMappingNumeric
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('getTimeseriesExternalIdFromNumericExpression', () => {
  it('should return undefined if trigger is a metadata trigger', () => {
    const expression: NumericExpression = {
      type: 'numericExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'greaterThan', parameters: [10] }
    };

    const result = getTimeseriesExternalIdFromNumericExpression(expression);

    expect(result).toBeUndefined();
  });

  it('should return undefined if trigger is an FDM trigger', () => {
    const result = getTimeseriesExternalIdFromNumericExpression(mockedExpressionFdmMappingNumeric);

    expect(result).toBeUndefined();
  });

  it('should return the externalId if trigger is not a metadata or FDM trigger', () => {
    const result = getTimeseriesExternalIdFromNumericExpression(
      mockedExpressionAssetMappingNumericTimeseries
    );

    expect(result).toEqual(['timeseries-1']);
  });
});
