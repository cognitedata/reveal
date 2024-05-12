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
  type RuleAndStyleIndex,
  type AssetStylingGroupAndStyleIndex,
  type TriggerType,
  type RuleWithOutputs
} from './types';
import {
  type CogniteCadModel,
  TreeIndexNodeCollection,
  type NodeAppearance
} from '@cognite/reveal';
import { type AssetMapping3D, type Asset } from '@cognite/sdk';
import { type AssetStylingGroup } from '../Reveal3DResources/types';
import { isDefined } from '../../utilities/isDefined';
import { assertNever } from '../../utilities/assertNever';

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

function forEachExpression(
  expression: Expression,
  callback: (expression: Expression) => void
): void {
  callback(expression);
  switch (expression.type) {
    case 'or':
    case 'and': {
      expression.expressions.forEach((childExpression) => {
        forEachExpression(childExpression, callback);
      });
      return;
    }
    case 'not': {
      forEachExpression(expression.expression, callback);
      return;
    }
    case 'numericExpression':
    case 'stringExpression':
      return;
    default:
      assertNever(expression);
  }
}

export function getRuleTriggerTypes(ruleWithOutput: RuleWithOutputs): TriggerType[] | undefined {
  if (ruleWithOutput.rule.expression === undefined) return;
  return getExpressionTriggerTypes(ruleWithOutput.rule.expression);
}

function getExpressionTriggerTypes(expression: Expression): TriggerType[] {
  if (expression.type === 'and' || expression.type === 'or') {
    return expression.expressions.flatMap(getExpressionTriggerTypes);
  } else if (expression.type === 'not') {
    return getExpressionTriggerTypes(expression.expression);
  } else if (expression.type === 'numericExpression' || expression.type === 'stringExpression') {
    return [expression.trigger.type];
  } else {
    assertNever(expression);
  }
}

export const generateRuleBasedOutputs = async (
  model: CogniteCadModel,
  contextualizedAssetNodes: Asset[],
  assetMappings: AssetMapping3D[],
  ruleSet: RuleOutputSet
): Promise<AssetStylingGroupAndStyleIndex[]> => {
  const outputType = 'color'; // for now it only supports colors as the output

  const ruleWithOutputs = ruleSet?.rulesWithOutputs;
  return (
    await Promise.all(
      ruleWithOutputs?.map(async (ruleWithOutput: { rule: Rule; outputs: RuleOutput[] }) => {
        const { rule, outputs } = ruleWithOutput;
        // Starting Expression
        const expression = rule.expression;

        if (expression === undefined) return;

        forEachExpression(expression, convertExpressionStringMetadataKeyToLowerCase);

        const outputFound = outputs.find((output: { type: string }) => output.type === outputType);

        if (outputFound?.type !== 'color') return;

        const outputSelected: ColorRuleOutput = {
          externalId: outputFound.externalId,
          type: 'color',
          fill: outputFound.fill,
          outline: outputFound.outline
        };

        return await analyzeNodesAgainstExpression({
          model,
          contextualizedAssetNodes,
          assetMappings,
          expression,
          outputSelected
        });
      })
    )
  ).filter(isDefined);
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
}): Promise<AssetStylingGroupAndStyleIndex> => {
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

  const filteredAllTreeNodes = allTreeNodes.flat().filter(isDefined);
  return applyNodeStyles(filteredAllTreeNodes, outputSelected);
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
        subtreeRange,
        assetId: nodeFromAsset.assetId
      };
      return node;
    })
  );
};

const applyNodeStyles = (
  treeNodes: NodeAndRange[],
  outputSelected: ColorRuleOutput
): AssetStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  treeNodes.forEach((node) => {
    nodeIndexSet.addRange(node.subtreeRange);
  });

  // assign the style with the color from the condition

  const nodeAppearance: NodeAppearance = {
    color: new Color(outputSelected.fill)
  };
  const assetStylingGroup: AssetStylingGroup = {
    assetIds: treeNodes.map((node) => node.assetId),
    style: { cad: nodeAppearance }
  };

  const stylingGroup: AssetStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    assetStylingGroup
  };
  return stylingGroup;
};

const isMetadataTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger
): trigger is MetadataRuleTrigger => {
  return trigger.type === 'metadata';
};

const convertExpressionStringMetadataKeyToLowerCase = (expression: Expression): void => {
  if (expression.type !== 'stringExpression') {
    return;
  }

  expression.trigger.key = expression.trigger.key.toLowerCase();
};
