import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { type StringExpression, type TriggerTypeData } from '../types';
import { getFdmPropertyTrigger } from './getFdmPropertyTrigger';

export const checkStringExpressionStatement = (
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

  const isFdmTrigger = trigger?.type === 'fdm' && currentTriggerData?.type === 'fdm';

  const assetTrigger = isMetadataAndAssetTrigger
    ? currentTriggerData?.asset[trigger.type]?.[trigger.key]
    : undefined;

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
