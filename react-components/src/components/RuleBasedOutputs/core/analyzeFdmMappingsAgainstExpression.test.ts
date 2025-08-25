/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { analyzeFdmMappingsAgainstExpression } from './analyzeFdmMappingsAgainstExpression';
import {
  mockedFdmInstanceNodeWithConnectionAndProperties,
  mockedExpressionFdmMappingBoolean,
  outputSelected
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('analyzeFdmMappingsAgainstExpression', () => {
  it('should analyze FDM mappings against expression and return styling group and style index', async () => {
    const result = await analyzeFdmMappingsAgainstExpression({
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      expression: mockedExpressionFdmMappingBoolean,
      outputSelected
    });

    expect(result).toBeDefined();
    expect(result.fdmStylingGroup.fdmAssetExternalIds).toEqual([
      { space: 'space-2', externalId: 'externalId-2' }
    ]);
  });
});
