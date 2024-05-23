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
  type RuleWithOutputs,
  type TriggerTypeData,
  type TimeseriesAndDatapoints
} from './types';
import {
  type CogniteCadModel,
  TreeIndexNodeCollection,
  type NodeAppearance
} from '@cognite/reveal';
import { type AssetMapping3D, type Asset, type Datapoints } from '@cognite/sdk';
import { type AssetStylingGroup } from '../Reveal3DResources/types';
import { isDefined } from '../../utilities/isDefined';
import { assertNever } from '../../utilities/assertNever';
import { type AssetIdsAndTimeseries } from '../../utilities/types';

const checkStringExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: StringExpression
): boolean | undefined => {
  const { trigger, condition } = expression;

  let expressionResult: boolean | undefined = false;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );
  const assetTrigger =
    trigger?.type === 'metadata' &&
      currentTriggerData?.type === 'metadata' &&
      currentTriggerData?.asset !== undefined
      ? currentTriggerData?.asset[trigger.type]?.[trigger.key]
      : undefined;

  if (assetTrigger === undefined) return;

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

const getTriggerNumericData = (
  triggerTypeData: TriggerTypeData[],
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger
): number | undefined => {
  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  if (currentTriggerData === undefined) return;

  if (currentTriggerData.type === 'metadata' && trigger.type === 'metadata') {
    return Number(currentTriggerData.asset[trigger.type]?.[trigger.key]);
  } else if (currentTriggerData.type === 'timeseries' && trigger.type === 'timeseries') {
    return getTriggerTimeseriesNumericData(currentTriggerData, trigger);
  }
};

const getTriggerTimeseriesNumericData = (
  triggerTypeData: TriggerTypeData,
  trigger: TimeseriesRuleTrigger
): number | undefined => {
  if (trigger.type !== 'timeseries') return;
  if (triggerTypeData.type !== 'timeseries') return;

  const timeseriesWithDatapoints = triggerTypeData.timeseries.timeseriesWithDatapoints;

  const dataFound = timeseriesWithDatapoints.find((item) => item.externalId === trigger.externalId);

  const datapoint = dataFound?.datapoints[dataFound?.datapoints.length - 1]?.value;

  return Number(datapoint);
};

const checkNumericExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: NumericExpression
): boolean | undefined => {
  const trigger = expression.trigger;
  const condition = expression.condition;

  let expressionResult: boolean = false;

  const dataTrigger = getTriggerNumericData(triggerTypeData, trigger);

  if (dataTrigger === undefined) return;

  switch (condition.type) {
    case 'equals': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger === parameter;
      break;
    }
    case 'notEquals': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger !== parameter;
      break;
    }
    case 'lessThan': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger < parameter;
      break;
    }
    case 'greaterThan': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger > parameter;
      break;
    }
    case 'lessThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger <= parameter;
      break;
    }
    case 'greaterThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = dataTrigger >= parameter;
      break;
    }
    case 'within': {
      const lower = condition.lowerBoundInclusive;
      const upper = condition.upperBoundInclusive;
      const value = dataTrigger;
      expressionResult = lower < value && value < upper;
      break;
    }
    case 'outside': {
      const lower = condition.lowerBoundExclusive;
      const upper = condition.upperBoundExclusive;
      const value = dataTrigger;
      expressionResult = value <= lower && upper <= value;
      break;
    }
  }

  return expressionResult;
};

const getTimeseriesExternalIdFromNumericExpression = (
  expression: NumericExpression
): string[] | undefined => {
  const trigger = expression.trigger;

  if (isMetadataTrigger(trigger)) return undefined;

  return [trigger.externalId];
};

const traverseExpression = (
  triggerTypeData: TriggerTypeData[],
  expressions: Expression[]
): Array<boolean | undefined> => {
  let expressionResult: boolean | undefined = false;

  const expressionResults: Array<boolean | undefined> = [];

  expressions.forEach((expression) => {
    switch (expression.type) {
      case 'or': {
        const operatorResult = traverseExpression(triggerTypeData, expression.expressions);
        expressionResult = operatorResult.find((result) => result) ?? false;
        break;
      }
      case 'and': {
        const operatorResult = traverseExpression(triggerTypeData, expression.expressions);
        expressionResult = operatorResult.every((result) => result === true) ?? false;
        break;
      }
      case 'not': {
        const operatorResult = traverseExpression(triggerTypeData, [expression.expression]);
        expressionResult = operatorResult[0] !== undefined ? !operatorResult[0] : false;
        break;
      }
      case 'numericExpression': {
        expressionResult = checkNumericExpressionStatement(triggerTypeData, expression);
        break;
      }
      case 'stringExpression': {
        expressionResult = checkStringExpressionStatement(triggerTypeData, expression);
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

export const generateRuleBasedOutputs = async ({
  model,
  contextualizedAssetNodes,
  assetMappings,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  model: CogniteCadModel;
  contextualizedAssetNodes: Asset[];
  assetMappings: AssetMapping3D[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AssetStylingGroupAndStyleIndex[]> => {
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

        const outputSelected: ColorRuleOutput | undefined = getRuleOutputFromTypeSelected(
          outputs,
          outputType
        );

        if (outputSelected === undefined) return;

        return await analyzeNodesAgainstExpression({
          model,
          contextualizedAssetNodes,
          assetIdsAndTimeseries,
          timeseriesDatapoints,
          assetMappings,
          expression,
          outputSelected
        });
      })
    )
  ).filter(isDefined);
};

const getRuleOutputFromTypeSelected = (
  outputs: RuleOutput[],
  outputType: string
): ColorRuleOutput | undefined => {
  const outputFound = outputs.find((output: { type: string }) => output.type === outputType);

  if (outputFound?.type !== 'color') return;

  const outputSelected: ColorRuleOutput = {
    externalId: outputFound.externalId,
    type: 'color',
    fill: outputFound.fill,
    outline: outputFound.outline
  };

  return outputSelected;
};

const analyzeNodesAgainstExpression = async ({
  model,
  contextualizedAssetNodes,
  assetIdsAndTimeseries,
  timeseriesDatapoints,
  assetMappings,
  expression,
  outputSelected
}: {
  model: CogniteCadModel;
  contextualizedAssetNodes: Asset[];
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
  assetMappings: AssetMapping3D[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<AssetStylingGroupAndStyleIndex> => {
  const allTreeNodes = await Promise.all(
    contextualizedAssetNodes.map(async (contextualizedAssetNode) => {
      const triggerData: TriggerTypeData[] = [];

      const metadataTriggerData: TriggerTypeData = {
        type: 'metadata',
        asset: contextualizedAssetNode
      };

      triggerData.push(metadataTriggerData);

      const timeseriesDataForThisAsset = generateTimeseriesAndDatapointsFromTheAsset({
        contextualizedAssetNode,
        assetIdsAndTimeseries,
        timeseriesDatapoints
      });

      if (timeseriesDataForThisAsset.length > 0) {
        const timeseriesTriggerData: TriggerTypeData = {
          type: 'timeseries',
          timeseries: {
            timeseriesWithDatapoints: timeseriesDataForThisAsset,
            linkedAssets: contextualizedAssetNode
          }
        };

        triggerData.push(timeseriesTriggerData);
      }

      const finalGlobalOutputResult = traverseExpression(triggerData, [expression]);

      if (finalGlobalOutputResult[0] ?? false) {
        const nodesFromThisAsset = assetMappings.filter(
          (mapping) => mapping.assetId === contextualizedAssetNode.id
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

const generateTimeseriesAndDatapointsFromTheAsset = ({
  contextualizedAssetNode,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  contextualizedAssetNode: Asset;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): TimeseriesAndDatapoints[] => {
  const timeseriesLinkedToThisAsset = assetIdsAndTimeseries.filter(
    (item) => item.assetIds?.externalId === contextualizedAssetNode.externalId
  );

  const timeseries = timeseriesLinkedToThisAsset?.map((item) => item.timeseries).filter(isDefined);
  const datapoints = timeseriesDatapoints?.filter((datapoint) =>
    timeseries?.find((item) => item?.externalId === datapoint.externalId)
  );

  const timeseriesData: TimeseriesAndDatapoints[] = timeseries
    .map((item) => {
      const datapoint = datapoints?.find((datapoint) => datapoint.externalId === item.externalId);
      if (datapoint === undefined) return undefined;

      const content: TimeseriesAndDatapoints = {
        ...item,
        ...datapoint
      };
      return content;
    })
    .filter(isDefined);
  return timeseriesData;
};

export const traverseExpressionToGetTimeseries = (
  expressions: Expression[] | undefined
): string[] | undefined => {

  const timeseriesExternalIdResults = expressions
    ?.map((expression) => {
      let timeseriesExternalIdFound: string[] | undefined = [];
      switch (expression.type) {
        case 'or':
        case 'and': {
          timeseriesExternalIdFound = traverseExpressionToGetTimeseries(expression.expressions);
          break;
        }
        case 'not': {
          timeseriesExternalIdFound = traverseExpressionToGetTimeseries([expression.expression]);
          break;
        }
        case 'numericExpression': {
          timeseriesExternalIdFound = getTimeseriesExternalIdFromNumericExpression(expression);
          break;
        }
      }
      return timeseriesExternalIdFound?.filter(isDefined) ?? [];
    })
    .flat();
  return timeseriesExternalIdResults;
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
