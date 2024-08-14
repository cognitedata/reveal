/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import {
  type StringExpression,
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
  type DatetimeExpression
} from './types';
import { NumericRange, TreeIndexNodeCollection, type NodeAppearance } from '@cognite/reveal';
import { type AssetMapping3D, type Asset, type Datapoints } from '@cognite/sdk';
import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type FdmPropertyType
} from '../Reveal3DResources/types';
import { isDefined } from '../../utilities/isDefined';
import { assertNever } from '../../utilities/assertNever';
import {
  type FdmInstanceNodeWithConnectionAndProperties,
  type AssetIdsAndTimeseries
} from '../../data-providers/types';

const checkStringExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: StringExpression
): boolean | undefined => {
  const { trigger, condition } = expression;

  let expressionResult: boolean | undefined = false;

  let propertyTrigger: string | undefined;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  const isMetadataAndAssetTrigger =
    trigger?.type === 'metadata' &&
    currentTriggerData?.type === 'metadata' &&
    currentTriggerData?.asset !== undefined;

  const assetTrigger = isMetadataAndAssetTrigger
    ? currentTriggerData?.asset[trigger.type]?.[trigger.key]
    : undefined;

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  const fdmItemsTrigger =
    isFdmTrigger && currentTriggerData.instanceNode.items[0] !== undefined
      ? currentTriggerData.instanceNode.items[0]
      : undefined;

  const fdmPropertyTrigger = isFdmTrigger
    ? (fdmItemsTrigger?.properties as FdmPropertyType<unknown>)
    : undefined;

  if (isMetadataAndAssetTrigger) {
    propertyTrigger = assetTrigger;
  } else if (isFdmTrigger) {
    propertyTrigger = getFdmPropertyTrigger<string>(fdmPropertyTrigger, trigger);
  }

  switch (condition.type) {
    case 'equals': {
      expressionResult = propertyTrigger === condition.parameter;
      break;
    }
    case 'notEquals': {
      expressionResult = propertyTrigger !== condition.parameter;
      break;
    }
    case 'contains': {
      expressionResult = propertyTrigger?.includes(condition.parameter);
      break;
    }
    case 'startsWith': {
      expressionResult = propertyTrigger?.startsWith(condition.parameter);
      break;
    }
    case 'endsWith': {
      expressionResult = propertyTrigger?.endsWith(condition.parameter);
      break;
    }
  }

  return expressionResult;
};

const getTriggerNumericData = (
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
  const { trigger, condition } = expression;

  let expressionResult: boolean = false;
  let propertyTrigger: number | undefined;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  const dataTrigger = getTriggerNumericData(triggerTypeData, trigger);

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  const fdmItemsTrigger =
    isFdmTrigger && currentTriggerData.instanceNode.items[0] !== undefined
      ? currentTriggerData.instanceNode.items[0]
      : undefined;

  const fdmPropertyTrigger = isFdmTrigger
    ? (fdmItemsTrigger?.properties as FdmPropertyType<unknown>)
    : undefined;

  if (dataTrigger === undefined && fdmPropertyTrigger === undefined) return;

  if (isFdmTrigger) {
    propertyTrigger = getFdmPropertyTrigger<number>(fdmPropertyTrigger, trigger);
  } else {
    propertyTrigger = dataTrigger;
  }

  if (propertyTrigger === undefined) return;

  switch (condition.type) {
    case 'equals': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger === parameter;
      break;
    }
    case 'notEquals': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger !== parameter;
      break;
    }
    case 'lessThan': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger < parameter;
      break;
    }
    case 'greaterThan': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger > parameter;
      break;
    }
    case 'lessThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger <= parameter;
      break;
    }
    case 'greaterThanOrEquals': {
      const parameter = condition.parameters[0];
      expressionResult = propertyTrigger >= parameter;
      break;
    }
    case 'within': {
      const lower = condition.lowerBoundInclusive;
      const upper = condition.upperBoundInclusive;
      expressionResult = lower < propertyTrigger && propertyTrigger < upper;
      break;
    }
    case 'outside': {
      const lower = condition.lowerBoundExclusive;
      const upper = condition.upperBoundExclusive;
      expressionResult = propertyTrigger <= lower && upper <= propertyTrigger;
      break;
    }
  }

  return expressionResult;
};

const checkDatetimeExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: DatetimeExpression
): boolean | undefined => {
  const { trigger, condition } = expression;

  let expressionResult: boolean | undefined = false;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  if (isFdmTrigger && currentTriggerData.instanceNode.items.length === 0) return;

  const fdmItemsTrigger =
    isFdmTrigger && currentTriggerData.instanceNode.items[0] !== undefined
      ? currentTriggerData.instanceNode.items[0]
      : undefined;

  const fdmPropertyTrigger = isFdmTrigger
    ? (fdmItemsTrigger?.properties as FdmPropertyType<unknown>)
    : undefined;

  const propertyTrigger = new Date(
    getFdmPropertyTrigger<string>(fdmPropertyTrigger, trigger) ?? ''
  );

  switch (condition.type) {
    case 'before': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger < conditionValue : false;
      break;
    }
    case 'notBefore': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger >= conditionValue : false;
      break;
    }
    case 'onOrBefore': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger <= conditionValue : false;
      break;
    }
    case 'between': {
      const lowerBound = new Date(condition.lowerBound);
      const upperBound = new Date(condition.upperBound);
      expressionResult =
        propertyTrigger !== undefined
          ? lowerBound < propertyTrigger && propertyTrigger < upperBound
          : false;
      break;
    }
    case 'notBetween': {
      const lowerBound = new Date(condition.lowerBound);
      const upperBound = new Date(condition.upperBound);
      expressionResult =
        propertyTrigger !== undefined
          ? !(lowerBound < propertyTrigger && propertyTrigger < upperBound)
          : false;
      break;
    }
    case 'after': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger > conditionValue : false;
      break;
    }
    case 'notAfter': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger <= conditionValue : false;
      break;
    }
    case 'onOrAfter': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger >= conditionValue : false;
      break;
    }
    case 'on': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger === conditionValue : false;
      break;
    }
    case 'notOn': {
      const conditionValue = new Date(condition.parameter);
      expressionResult = propertyTrigger !== undefined ? propertyTrigger !== conditionValue : false;
      break;
    }
  }

  return expressionResult;
};

const checkBooleanExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: Expression
): boolean | undefined => {
  const condition = expression.type === 'booleanExpression' ? expression.condition : undefined;
  const trigger = expression.type === 'booleanExpression' ? expression.trigger : undefined;

  let expressionResult: boolean | undefined = false;

  if (condition === undefined || trigger === undefined) return;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  if (isFdmTrigger && currentTriggerData.instanceNode.items.length === 0) return;

  const fdmItemsTrigger =
    isFdmTrigger && currentTriggerData.instanceNode.items[0] !== undefined
      ? currentTriggerData.instanceNode.items[0]
      : undefined;

  const fdmPropertyTrigger = isFdmTrigger
    ? (fdmItemsTrigger?.properties as FdmPropertyType<unknown>)
    : undefined;

  const propertyTrigger = getFdmPropertyTrigger<boolean>(fdmPropertyTrigger, trigger);

  switch (condition.type) {
    case 'true': {
      expressionResult = propertyTrigger === true;
      break;
    }
    case 'false': {
      expressionResult = propertyTrigger === false;
      break;
    }
  }
  return expressionResult;
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
  const allAssetMappingsTreeNodes = await Promise.all(
    contextualizedAssetNodes.map(async (contextualizedAssetNode) => {
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

        return nodesFromThisAsset;
      }
    })
  );

  const filteredAllAssetMappingsTreeNodes = allAssetMappingsTreeNodes.flat().filter(isDefined);
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
  treeNodes?.forEach((node) => {
    const range = new NumericRange(node.treeIndex, node.subtreeSize);
    nodeIndexSet.addRange(range);
  });
  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

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

const applyFdmMappingsNodeStyles = (
  treeNodes: FdmInstanceNodeWithConnectionAndProperties[],
  outputSelected: ColorRuleOutput
): FdmStylingGroupAndStyleIndex => {
  const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
    styleIndex: new TreeIndexNodeCollection(),
    ruleOutputParams: outputSelected
  };

  const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
  nodeIndexSet.clear();
  treeNodes?.forEach((node) => {
    if (node.cadNode === undefined) return;
    const range = new NumericRange(node.cadNode.treeIndex, node.cadNode.subtreeSize);
    nodeIndexSet.addRange(range);
  });
  ruleOutputAndStyleIndex.styleIndex.updateSet(nodeIndexSet);

  const nodeAppearance: NodeAppearance = {
    color: new Color(outputSelected.fill)
  };
  const fdmStylingGroup: FdmAssetStylingGroup = {
    fdmAssetExternalIds:
      treeNodes
        .map((node) => {
          if (node.connection === undefined) return undefined;
          return {
            space: node.connection?.instance.space,
            externalId: node.connection?.instance.externalId
          };
        })
        .filter(isDefined) ?? [],
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

function getFdmPropertyTrigger<T>(
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
