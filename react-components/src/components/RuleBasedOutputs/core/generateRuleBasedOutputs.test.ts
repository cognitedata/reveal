/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Rule, type RuleOutputSet } from '../types';
import { generateRuleBasedOutputs } from './generateRuleBasedOutputs';
import {
  assetIdsAndTimeseries,
  contextualizedAssetNodes,
  mockedAssetMappings,
  mockedExpressionFdmMappingBoolean,
  mockedFdmInstanceNodeWithConnectionAndProperties,
  outputSelected,
  timeseriesDatapoints
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';
import { Color } from 'three';

describe('generateRuleBasedOutputs', () => {
  it('should generate rule based outputs for asset mappings and timeseries and its output color should be #ffff00', async () => {
    const mockedRuleSetMultipeAssetAndTimeseries: RuleOutputSet = {
      rulesWithOutputs: [
        {
          rule: {
            expression: {
              type: 'and',
              expressions: [
                {
                  type: 'stringExpression',
                  trigger: {
                    type: 'metadata',
                    key: 'mockedProperty1'
                  },
                  condition: {
                    type: 'equals',
                    parameter: 'valueA'
                  }
                },
                {
                  type: 'numericExpression',
                  trigger: {
                    type: 'timeseries',
                    externalId: 'timeseries-1'
                  },
                  condition: {
                    type: 'equals',
                    parameters: [42]
                  }
                }
              ]
            },
            type: 'rule',
            id: '1',
            name: 'rule1'
          },
          outputs: [outputSelected]
        }
      ],
      id: '',
      name: '',
      createdAt: 0,
      createdBy: ''
    };

    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: mockedRuleSetMultipeAssetAndTimeseries,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].assetMappingsStylingGroupAndIndex.assetStylingGroup.assetIds).toEqual([1]);
    expect(
      result[0].assetMappingsStylingGroupAndIndex.assetStylingGroup.style.cad?.color?.getHex()
    ).toBe(new Color('#ffff00').getHex());
  });

  it('should generate rule based outputs for fdm mappings and its output color should be #ffff00', async () => {
    const mockedRuleSet: RuleOutputSet = {
      rulesWithOutputs: [
        {
          rule: {
            expression: {
              type: 'and',
              expressions: [
                {
                  type: 'booleanExpression',
                  trigger: {
                    type: 'fdm',
                    key: {
                      property: 'mockedProperty',
                      space: 'space-1',
                      externalId: 'externalId-1',
                      view: {
                        type: 'view',
                        version: '1',
                        space: 'space-1',
                        externalId: 'externalId-property'
                      },
                      typing: {}
                    }
                  },
                  condition: {
                    type: 'equals',
                    parameter: true
                  }
                }
              ]
            },
            type: 'rule',
            id: '1',
            name: 'rule1'
          },
          outputs: [outputSelected]
        }
      ],
      id: '',
      name: '',
      createdAt: 0,
      createdBy: ''
    };

    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: mockedRuleSet,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].fdmStylingGroupAndStyleIndex.fdmStylingGroup.fdmAssetExternalIds).toEqual([
      { space: 'space-1', externalId: 'externalId-1' }
    ]);
    expect(result[0].fdmStylingGroupAndStyleIndex.fdmStylingGroup.style.cad?.color?.getHex()).toBe(
      new Color('#ffff00').getHex()
    );
  });

  it('should return an empty array if ruleSet is not set', async () => {
    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: {} as unknown as RuleOutputSet,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if no rulesWithOutputs in ruleSet', async () => {
    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: {
        rulesWithOutputs: [],
        id: '',
        name: '',
        createdAt: 0,
        createdBy: ''
      },
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if no expression in rule', async () => {
    const ruleSetWithoutExpression: RuleOutputSet = {
      rulesWithOutputs: [
        {
          rule: {
            expression: undefined,
            type: 'rule',
            id: '',
            name: ''
          },
          outputs: [outputSelected]
        }
      ],
      id: '',
      name: '',
      createdAt: 0,
      createdBy: ''
    };

    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: ruleSetWithoutExpression,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });

  it('should return an empty array if no outputSelected', async () => {
    const mockedRuleSetEmptyOutput: RuleOutputSet = {
      rulesWithOutputs: [
        {
          rule: {
            expression: mockedExpressionFdmMappingBoolean,
            type: 'rule',
            id: 'mockedId',
            name: 'ruleName'
          } satisfies Rule,
          outputs: []
        }
      ],
      id: '',
      name: '',
      createdAt: 0,
      createdBy: 'mockingtest'
    };

    const result = await generateRuleBasedOutputs({
      contextualizedAssetNodes,
      assetMappings: mockedAssetMappings,
      fdmMappings: mockedFdmInstanceNodeWithConnectionAndProperties,
      ruleSet: mockedRuleSetEmptyOutput,
      assetIdsAndTimeseries,
      timeseriesDatapoints
    });

    expect(result).toEqual([]);
  });
});
