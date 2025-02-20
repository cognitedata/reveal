import { describe, it, expect } from 'vitest';
import { analyzeAssetMappingsAgainstExpression } from '../../../../../src/components/RuleBasedOutputs/core/analyzeAssetMappingsAgainstExpression';
import { type Expression } from '../../../../../src/components/RuleBasedOutputs/types';
import {
  contextualizedAssetNodes,
  assetIdsAndTimeseries,
  timeseriesDatapoints,
  assetMappings,
  outputSelected
} from '../../../fixtures/ruleBasedOutputs';

describe('analyzeAssetMappingsAgainstExpression', () => {
  it('should analyze asset mappings against numeric expression and return styling group and style index', async () => {
    const expression: Expression = {
      type: 'numericExpression',
      trigger: {
        type: 'metadata',
        key: 'mockedProperty2'
      },
      condition: {
        type: 'greaterThan',
        parameters: [10]
      }
    };

    const result = await analyzeAssetMappingsAgainstExpression({
      contextualizedAssetNodes,
      assetIdsAndTimeseries,
      timeseriesDatapoints,
      assetMappings,
      expression,
      outputSelected
    });

    expect(result).toBeDefined();
    expect(result.assetStylingGroup.assetIds).toEqual([1]);
  });

  it('should analyze asset mappings against string expression and return styling group and style index', async () => {
    const expression: Expression = {
      type: 'stringExpression',
      trigger: {
        type: 'metadata',
        key: 'mockedProperty1'
      },
      condition: {
        type: 'contains',
        parameter: 'valueB'
      }
    };

    const result = await analyzeAssetMappingsAgainstExpression({
      contextualizedAssetNodes,
      assetIdsAndTimeseries,
      timeseriesDatapoints,
      assetMappings,
      expression,
      outputSelected
    });

    expect(result).toBeDefined();
    expect(result.assetStylingGroup.assetIds).toEqual([2]);
  });

  it('should analyze asset mappings against timeseries data and return styling group and style index', async () => {
    const expression: Expression = {
      type: 'numericExpression',
      trigger: {
        type: 'timeseries',
        externalId: 'timeseries-1'
      },
      condition: {
        type: 'equals',
        parameters: [42]
      }
    };

    const result = await analyzeAssetMappingsAgainstExpression({
      contextualizedAssetNodes,
      assetIdsAndTimeseries,
      timeseriesDatapoints,
      assetMappings,
      expression,
      outputSelected
    });

    expect(result).toBeDefined();
    expect(result.assetStylingGroup.assetIds).toEqual([1, 2]);
  });
});
