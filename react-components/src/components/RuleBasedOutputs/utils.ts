/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import {
  type ColorRuleOutput,
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
  type TimeseriesAndDatapoints,
  type EmptyRuleForSelection,
  type RuleAndEnabled,
  type FdmStylingGroupAndStyleIndex,
  type AllMappingStylingGroupAndStyleIndex,
  type FdmRuleTrigger,
  type FdmInstanceNodeWithConnectionAndProperties
} from './types';
import { NumericRange, TreeIndexNodeCollection, type NodeAppearance } from '@cognite/reveal';
import {
  type AssetMapping3D,
  type Asset,
  type Datapoints,
  type RelationshipResourceType,
  type CogniteClient
} from '@cognite/sdk';
import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type FdmPropertyType
} from '../Reveal3DResources/types';
import { isDefined } from '../../utilities/isDefined';
import { assertNever } from '../../utilities/assertNever';
import {
  type ExtendedRelationshipWithSourceAndTarget,
  type AssetIdsAndTimeseries
} from '../../data-providers/types';
import { uniq } from 'lodash';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { checkNumericExpressionStatement } from './core/checkNumericExpressionStatement';
import { checkStringExpressionStatement } from './core/checkStringExpressionStatement';
import { checkDatetimeExpressionStatement } from './core/checkDatetimeExpressionStatement';
import { checkBooleanExpressionStatement } from './core/checkBooleanExpressionStatement';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { useMemo } from 'react';
import { getRelationships } from '../../hooks/network/getRelationships';

export const getTriggerNumericData = (
  triggerTypeData: TriggerTypeData[],
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
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

export const getTriggerTimeseriesNumericData = (
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

const getTimeseriesExternalIdFromNumericExpression = (
  expression: NumericExpression
): string[] | undefined => {
  const trigger = expression.trigger;

  if (isMetadataTrigger(trigger)) return;

  if (isFdmTrigger(trigger)) return;

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
      case 'datetimeExpression': {
        expressionResult = checkDatetimeExpressionStatement(triggerTypeData, expression);
        break;
      }
      case 'booleanExpression': {
        expressionResult = checkBooleanExpressionStatement(triggerTypeData, expression);
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
    case 'datetimeExpression':
    case 'booleanExpression':
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
  } else if (
    expression.type === 'numericExpression' ||
    expression.type === 'stringExpression' ||
    expression.type === 'datetimeExpression' ||
    expression.type === 'booleanExpression'
  ) {
    return [expression.trigger.type];
  } else {
    assertNever(expression);
  }
}

export const generateRuleBasedOutputs = async ({
  contextualizedAssetNodes,
  assetMappings,
  fdmMappings,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  contextualizedAssetNodes: Asset[];
  assetMappings: AssetMapping3D[];
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AllMappingStylingGroupAndStyleIndex[]> => {
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

        const assetMappingsStylingGroups = await analyzeAssetMappingsAgainstExpression({
          contextualizedAssetNodes,
          assetIdsAndTimeseries,
          timeseriesDatapoints,
          assetMappings,
          expression,
          outputSelected
        });

        const fdmMappingsStylingGroups = await analyzeFdmMappingsAgainstExpression({
          fdmMappings,
          expression,
          outputSelected
        });

        const allStyling: AllMappingStylingGroupAndStyleIndex = {
          assetMappingsStylingGroupAndIndex: assetMappingsStylingGroups,
          fdmStylingGroupAndStyleIndex: fdmMappingsStylingGroups
        };

        return allStyling;
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

const analyzeAssetMappingsAgainstExpression = async ({
  contextualizedAssetNodes,
  assetIdsAndTimeseries,
  timeseriesDatapoints,
  assetMappings,
  expression,
  outputSelected
}: {
  contextualizedAssetNodes: Asset[];
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
  assetMappings: AssetMapping3D[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<AssetStylingGroupAndStyleIndex> => {
  const allAssetMappingsTreeNodes: AssetMapping3D[][] = [];

  for (const contextualizedAssetNode of contextualizedAssetNodes) {
    const triggerData: TriggerTypeData[] = [];

    const metadataTriggerData: TriggerTypeData = {
      type: 'metadata',
      asset: contextualizedAssetNode
    };

    triggerData.push(metadataTriggerData);

    if (
      timeseriesDatapoints !== undefined &&
      timeseriesDatapoints.length > 0 &&
      assetIdsAndTimeseries !== undefined &&
      assetIdsAndTimeseries.length > 0
    ) {
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
    }

    const finalGlobalOutputResult = traverseExpression(triggerData, [expression]);

    if (finalGlobalOutputResult[0] ?? false) {
      const nodesFromThisAsset = assetMappings.filter(
        (item) => item.assetId === contextualizedAssetNode.id
      );

      allAssetMappingsTreeNodes.push(nodesFromThisAsset);
    }
  }

  const filteredAllAssetMappingsTreeNodes = allAssetMappingsTreeNodes.flat();
  return applyAssetMappingsNodeStyles(filteredAllAssetMappingsTreeNodes, outputSelected);
};

const analyzeFdmMappingsAgainstExpression = async ({
  fdmMappings,
  expression,
  outputSelected
}: {
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<FdmStylingGroupAndStyleIndex> => {
  const allFdmtMappingsTreeNodes = await Promise.all(
    fdmMappings.map(async (mapping) => {
      const triggerData: TriggerTypeData[] = [];

      const fdmTriggerData: TriggerTypeData = {
        type: 'fdm',
        instanceNode: mapping
      };

      triggerData.push(fdmTriggerData);

      const finalGlobalOutputResult = traverseExpression(triggerData, [expression]);

      if (finalGlobalOutputResult[0] ?? false) {
        return mapping;
      }
    })
  );

  const filteredAllFdmMappingsTreeNodes = allFdmtMappingsTreeNodes.flat().filter(isDefined);
  return applyFdmMappingsNodeStyles(filteredAllFdmMappingsTreeNodes, outputSelected);
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

  const datapoints = timeseriesDatapoints?.filter((datapoint) =>
    timeseriesLinkedToThisAsset?.find(
      (item) => item?.timeseries?.externalId === datapoint.externalId
    )
  );

  const timeseriesData: TimeseriesAndDatapoints[] = timeseriesLinkedToThisAsset
    .map((item) => {
      if (item.timeseries === undefined) return undefined;
      const datapoint = datapoints?.find(
        (datapoint) => datapoint.externalId === item.timeseries?.externalId
      );
      if (datapoint === undefined) return undefined;

      const content: TimeseriesAndDatapoints = {
        ...item.timeseries,
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
  return uniq(timeseriesExternalIdResults);
};

const applyAssetMappingsNodeStyles = (
  treeNodes: AssetMapping3D[],
  outputSelected: ColorRuleOutput
): AssetStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  nodeIndexSet.clear();

  const assetIds: number[] = [];

  for (const node of treeNodes) {
    const range = new NumericRange(node.treeIndex, node.subtreeSize);
    nodeIndexSet.addRange(range);

    assetIds.push(node.assetId);
  }
  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

  const nodeAppearance: NodeAppearance = {
    color: new Color(outputSelected.fill)
  };

  const assetStylingGroup: AssetStylingGroup = {
    assetIds,
    style: { cad: nodeAppearance }
  };

  const stylingGroup: AssetStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    assetStylingGroup
  };
  return stylingGroup;
};

const applyFdmMappingsNodeStyles = (
  treeNodes: FdmInstanceNodeWithConnectionAndProperties[],
  outputSelected: ColorRuleOutput
): FdmStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeAppearance: NodeAppearance = {
    color: new Color(outputSelected.fill)
  };

  const fdmAssetExternalIds: DmsUniqueIdentifier[] = [];

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  nodeIndexSet.clear();

  for (const node of treeNodes) {
    if (node.cadNode === undefined) continue;

    const range = new NumericRange(node.cadNode.treeIndex, node.cadNode.subtreeSize);
    nodeIndexSet.addRange(range);

    if (node.connection === undefined) continue;
    fdmAssetExternalIds.push({
      space: node.connection?.instance.space,
      externalId: node.connection?.instance.externalId
    });
  }

  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

  const fdmStylingGroup: FdmAssetStylingGroup = {
    fdmAssetExternalIds,
    style: { cad: nodeAppearance }
  };

  const stylingGroup: FdmStylingGroupAndStyleIndex = {
    styleIndex: ruleOutputAndStyleIndex.styleIndex,
    fdmStylingGroup
  };
  return stylingGroup;
};

const isMetadataTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
): trigger is MetadataRuleTrigger => {
  return trigger.type === 'metadata';
};

const isFdmTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
): trigger is FdmRuleTrigger => {
  return trigger.type === 'fdm';
};

const convertExpressionStringMetadataKeyToLowerCase = (expression: Expression): void => {
  if (
    expression.type !== 'stringExpression' ||
    (expression.type === 'stringExpression' && expression.trigger.type === 'fdm')
  )
    return;

  expression.trigger.key =
    expression.trigger.type === 'metadata'
      ? expression.trigger.key.toLowerCase()
      : expression.trigger.key;
};

export const generateEmptyRuleForSelection = (name: string): EmptyRuleForSelection => {
  const emptySelection: EmptyRuleForSelection = {
    rule: {
      properties: {
        id: undefined,
        name,
        isNoSelection: true
      }
    },
    isEnabled: false
  };
  return emptySelection;
};

export const getRuleBasedById = (
  id: string | undefined,
  ruleInstances: RuleAndEnabled[] | undefined
): RuleAndEnabled | undefined => {
  return ruleInstances?.find((item) => item.rule.properties.id === id);
};

export function getFdmPropertyTrigger<T>(
  fdmPropertyTrigger: FdmPropertyType<unknown> | undefined,
  trigger: FdmRuleTrigger
): T | undefined {
  if (fdmPropertyTrigger === undefined) return;

  const space = fdmPropertyTrigger[trigger.key.space];
  const instanceProperties = space?.[
    `${trigger.key.view.externalId}/${trigger.key.view.version}`
  ] as FdmPropertyType<unknown>;
  const property = instanceProperties?.[trigger.key.property] as T;

  return property;
}
