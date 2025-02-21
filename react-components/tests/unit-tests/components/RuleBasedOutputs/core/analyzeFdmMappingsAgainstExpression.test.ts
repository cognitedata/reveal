import { describe, it, expect } from 'vitest';
import { analyzeFdmMappingsAgainstExpression } from '../../../../../src/components/RuleBasedOutputs/core/analyzeFdmMappingsAgainstExpression';
import {
  mockedExpressionFdmMappingBoolean,
  mockedFdmInstanceNodeWithConnectionAndProperties,
  outputSelected
} from '../../../fixtures/ruleBasedOutputs';

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
