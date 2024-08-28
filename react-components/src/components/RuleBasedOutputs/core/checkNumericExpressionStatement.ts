/*!
 * Copyright 2024 Cognite AS
 */

import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { type NumericExpression, type TriggerTypeData } from '../types';
import { getFdmPropertyTrigger, getTriggerNumericData } from '../utils';

export const checkNumericExpressionStatement = (
  triggerTypeData: TriggerTypeData[],
  expression: NumericExpression
): boolean | undefined => {
  const { trigger, condition } = expression;

  let expressionResult: boolean = false;
  let propertyTrigger: number | undefined;

  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  const assetOrTimeseriesDataTrigger = !isFdmTrigger
    ? getTriggerNumericData(triggerTypeData, trigger)
    : undefined;

  const fdmItemsTrigger =
    isFdmTrigger && currentTriggerData.instanceNode.items[0] !== undefined
      ? currentTriggerData.instanceNode.items[0]
      : undefined;

  const fdmPropertyTrigger = isFdmTrigger
    ? (fdmItemsTrigger?.properties as FdmPropertyType<unknown>)
    : undefined;

  if (assetOrTimeseriesDataTrigger === undefined && fdmPropertyTrigger === undefined) return;

  if (isFdmTrigger) {
    propertyTrigger = getFdmPropertyTrigger<number>(fdmPropertyTrigger, trigger);
  } else {
    propertyTrigger = assetOrTimeseriesDataTrigger;
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
