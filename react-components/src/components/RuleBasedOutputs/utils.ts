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
  type Rule,
  type TimeseriesRuleTrigger,
  type RuleAndStyleIndex
} from './types';
import { type CogniteCadModel, TreeIndexNodeCollection } from '@cognite/reveal';
import { type AssetMapping3D, type Asset } from '@cognite/sdk';
import { type FdmPropertyType } from '../Reveal3DResources/types';
import { filterUndefined } from '../../utilities/filterUndefined';

const checkStringExpressionStatement = (
  asset: Asset,
  expression: StringExpression
): boolean | undefined => {
  const { trigger, condition } = expression;

  let expressionResult: boolean | undefined = false;

  const assetTrigger = asset[trigger.type]?.[trigger.key];

  switch (condition.type) {
    case 'equals': {
      expressionResult = assetTrigger === condition.parameter;
      break;
    }
    case 'notEquals': {
      expressionResult = assetTrigger !== condition.parameter;
      break;
    }
    case 'contains': {
      expressionResult = assetTrigger?.includes(condition.parameter) ?? undefined;
      break;
    }
    case 'startsWith': {
      expressionResult = assetTrigger?.startsWith(condition.parameter) ?? undefined;
      break;
    }
    case 'endsWith': {
      expressionResult = assetTrigger?.endsWith(condition.parameter) ?? undefined;
      break;
    }
  }

  return expressionResult;
};
const checkNumericExpressionStatement = (
  asset: Asset,
  expression: NumericExpression
): boolean | undefined => {
  if (!isMetadataTrigger(expression.trigger)) return undefined;

  const trigger = expression.trigger;
  const condition = expression.condition;

  let expressionResult: boolean = false;

  const assetTrigger = Number(asset[trigger.type]?.[trigger.key]);

  switch (condition.type) {
    case 'equals': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger === parameter;
      break;
    }
    case 'notEquals': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger !== parameter;
      break;
    }
    case 'lessThan': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger < parameter;
      break;
    }
    case 'greaterThan': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger > parameter;
      break;
    }
    case 'lessThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger <= parameter;
      break;
    }
    case 'greaterThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = assetTrigger >= parameter;
      break;
    }
    case 'within': {
      const lower = condition.lowerBoundInclusive;
      const upper = condition.upperBoundInclusive;
      const value = assetTrigger;
      expressionResult = lower < value && value < upper;
      break;
    }
    case 'outside': {
      const lower = condition.lowerBoundExclusive;
      const upper = condition.upperBoundExclusive;
      const value = assetTrigger;
      expressionResult = value <= lower && upper <= value;
      break;
    }
  }

  return expressionResult;
};

const traverseExpression = (
  asset: Asset,
  expressions: Expression[]
): Array<boolean | undefined> => {
  let expressionResult: boolean | undefined = false;

  const expressionResults: Array<boolean | undefined> = [];

  expressions.forEach((expression) => {
    switch (expression.type) {
      case 'or': {
        const operatorResult = traverseExpression(asset, expression.expressions);
        expressionResult = operatorResult.find((result) => result) ?? false;
        break;
      }
      case 'and': {
        const operatorResult = traverseExpression(asset, expression.expressions);
        expressionResult = operatorResult.every((result) => result === true) ?? false;
        break;
      }
      case 'not': {
        const operatorResult = traverseExpression(asset, [expression.expression]);
        expressionResult = operatorResult[0] !== undefined ? !operatorResult[0] : false;
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
  ruleSet: RuleOutputSet | Record<string, any> | FdmPropertyType<Record<string, any>>
): void => {
  const outputType = 'color'; // for now it only supports colors as the output

  const ruleWithOutputs = ruleSet?.rulesWithOutputs;

  ruleWithOutputs?.forEach(async (ruleWithOutput: { rule: Rule; outputs: RuleOutput[] }) => {
    const { rule, outputs } = ruleWithOutput;
    // Starting Expression
    const expression = rule.expression;

    const outputSelected = outputs.find(
      (output: { type: string }) => output.type === outputType
    ) as ColorRuleOutput;

    if (outputSelected === undefined) return;

    await analyzeNodesAgainstExpression({
      model,
      contextualizedAssetNodes,
      assetMappings,
      expression,
      outputSelected
    });
  });
};

const analyzeNodesAgainstExpression = async ({
  model,
  contextualizedAssetNodes,
  assetMappings,
  expression,
  outputSelected
}: {
  model: CogniteCadModel;
  contextualizedAssetNodes: Asset[];
  assetMappings: AssetMapping3D[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<void> => {
  const allTreeNodes = await Promise.all(
    contextualizedAssetNodes.map(async (assetNode) => {
      const finalGlobalOutputResult = traverseExpression(assetNode, [expression]);

      if (finalGlobalOutputResult[0] ?? false) {
        const nodesFromThisAsset = assetMappings.filter(
          (mapping) => mapping.assetId === assetNode.id
        );

        // get the 3d nodes linked to the asset and with treeindex and subtreeRange
        const nodesAndRange: NodeAndRange[] = await getThreeDNodesFromAsset(
          nodesFromThisAsset,
          model
        );

        return nodesAndRange;
      }
    })
  );

  const filteredAllTreeNodes = filterUndefined(allTreeNodes.flat());
  applyNodeStyles(filteredAllTreeNodes, outputSelected, model);
};

const getThreeDNodesFromAsset = async (
  nodesFromThisAsset: AssetMapping3D[],
  model: CogniteCadModel
): Promise<NodeAndRange[]> => {
  return await Promise.all(
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
};

const applyNodeStyles = (
  treeNodes: NodeAndRange[],
  outputSelected: ColorRuleOutput,
  model: CogniteCadModel
): void => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  treeNodes.forEach((node) => {
    nodeIndexSet.addRange(node.subtreeRange);
  });

  // assign the style with the color from the condition
  model.assignStyledNodeCollection(ruleOutputAndStyleIndex.styleIndex, {
    color: new Color(outputSelected.fill)
  });
};

const isMetadataTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger
): trigger is MetadataRuleTrigger => {
  return trigger.type === 'metadata';
};
