/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import {
  type StringExpression,
  type ColorRuleOutput,
  type NodeAndRange,
  type RuleOutput,
  type NumericExpression,
  type MetadataRuleTrigger,
  type Expression,
  type RuleOutputSet,
  type Rule
} from './types';
import { type CogniteCadModel, TreeIndexNodeCollection } from '@cognite/reveal';
import { type AssetMapping3D, type Asset } from '@cognite/sdk';

const checkStringExpressionStatement = (asset: Asset, expression: StringExpression): boolean => {
  const { trigger, condition } = expression;

  let expressionResult: boolean = false;

  switch (condition.type) {
    case 'equals': {
      expressionResult = asset[trigger.type]?.[trigger.key] === condition.parameter;
      break;
    }
    case 'notEquals': {
      expressionResult = asset[trigger.type]?.[trigger.key] !== condition.parameter;
      break;
    }
    case 'contains': {
      expressionResult = asset[trigger.type]?.[trigger.key].includes(condition.parameter) ?? false;
      break;
    }
    case 'startsWith': {
      expressionResult =
        asset[trigger.type]?.[trigger.key].startsWith(condition.parameter) ?? false;
      break;
    }
    case 'endsWith': {
      expressionResult = asset[trigger.type]?.[trigger.key].endsWith(condition.parameter) ?? false;
      break;
    }
  }

  return expressionResult;
};
const checkNumericExpressionStatement = (asset: Asset, expression: NumericExpression): boolean => {
  const trigger = expression.trigger as MetadataRuleTrigger;
  const condition = expression.condition;

  let expressionResult: boolean = false;

  switch (condition.type) {
    case 'equals': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) === parameter;
      break;
    }
    case 'notEquals': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) !== parameter;
      break;
    }
    case 'lessThan': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) < parameter;
      break;
    }
    case 'greaterThan': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) > parameter;
      break;
    }
    case 'lessThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) <= parameter;
      break;
    }
    case 'greaterThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = Number(asset[trigger.type]?.[trigger.key]) >= parameter;
      break;
    }
    case 'within': {
      const lower = condition.lowerBoundInclusive;
      const upper = condition.upperBoundInclusive;
      const value = Number(asset[trigger.type]?.[trigger.key]);
      expressionResult = lower < value && value < upper;
      break;
    }
    case 'outside': {
      const lower = condition.lowerBoundExclusive;
      const upper = condition.upperBoundExclusive;
      const value = Number(asset[trigger.type]?.[trigger.key]);
      expressionResult = value <= lower && upper <= value;
      break;
    }
  }

  return expressionResult;
};

const traverseExpression = (asset: Asset, expressions: Expression[]): boolean[] => {
  let expressionResult: boolean = false;

  const expressionResults: boolean[] = [];

  expressions.forEach((expression) => {
    switch (expression.type) {
      case 'or': {
        const operatorResult = traverseExpression(asset, expression.expressions);
        expressionResult = operatorResult.find((result) => result) ?? false;
        break;
      }
      case 'and': {
        const operatorResult = traverseExpression(asset, expression.expressions);
        expressionResult = operatorResult.find((result) => !result) ?? false;
        break;
      }
      case 'not': {
        const operatorResult = traverseExpression(asset, [expression.expression]);
        expressionResult = !operatorResult[0]; // TODO: make the not operator
        break;
      }
      case 'numericExpression': {
        expressionResult = checkNumericExpressionStatement(asset, expression);
        break;
      }
      case 'stringExpression': {
        expressionResult = checkStringExpressionStatement(asset, expression);
        break;
      }
    }
    expressionResults.push(expressionResult);
  });

  return expressionResults;
};

export const generateRuleBasedOutputs = (
  model: CogniteCadModel,
  contextualizedAssetNodes: Asset[],
  assetMappings: AssetMapping3D[],
  ruleSet: RuleOutputSet
): void => {
  const outputType = 'color'; // for now it only supports colors as the output

  type RuleAndStyleIndex = {
    styleIndex: TreeIndexNodeCollection;
    ruleOutputParams: RuleOutput;
  };

  const ruleWithOutputs = ruleSet?.rulesWithOutputs;

  ruleWithOutputs?.forEach((ruleWithOutput: { rule: Rule; outputs: RuleOutput[] }) => {
    const { rule, outputs } = ruleWithOutput;
    // Starting Expression
    const expression = rule.expression;

    const outputSelected = outputs.find(
      (output: { type: string }) => output.type === outputType
    ) as ColorRuleOutput;

    if (outputSelected === undefined) return;

    const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
      styleIndex: new TreeIndexNodeCollection(),
      ruleOutputParams: outputSelected
    };

    // ======== OUTPUT - COLOR IN 3D
    void Promise.all(
      contextualizedAssetNodes.map(async (assetNode) => {
        const finalGlobalOutputResult = traverseExpression(
          assetNode,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          [expression]
        );

        if (finalGlobalOutputResult[0]) {
          const nodesFromThisAsset = assetMappings.filter(
            (mapping) => mapping.assetId === assetNode.id
          );

          // get the 3d nodes linked to the asset and with treeindex and subtreeRange
          const treeNodes: NodeAndRange[] = await Promise.all(
            nodesFromThisAsset.map(async (nodeFromAsset) => {
              const subtreeRange = await model.getSubtreeTreeIndices(nodeFromAsset.treeIndex);
              const node: NodeAndRange = {
                nodeId: nodeFromAsset.nodeId,
                treeIndex: nodeFromAsset.treeIndex,
                subtreeRange
              };
              return node;
            })
          );
          const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
          treeNodes.forEach((node) => {
            nodeIndexSet.addRange(node.subtreeRange);
          });

          // assign the style with the color from the condition
          model.assignStyledNodeCollection(ruleOutputAndStyleIndex.styleIndex, {
            color: new Color(outputSelected.fill)
          });
        }
        // debug
        // console.log(' ASSET ', assetNode, finalGlobalOutputResult);
      })
    );

    // =================================
  });
};
