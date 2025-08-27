import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { type TriggerTypeData, type DatetimeExpression } from '../types';
import { getFdmPropertyTrigger } from './getFdmPropertyTrigger';

export const checkDatetimeExpressionStatement = (
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
