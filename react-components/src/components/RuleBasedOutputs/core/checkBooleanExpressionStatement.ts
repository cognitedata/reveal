import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { type Expression, type TriggerTypeData } from '../types';
import { getFdmPropertyTrigger } from './getFdmPropertyTrigger';

export const checkBooleanExpressionStatement = (
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
    case 'equals': {
      expressionResult = propertyTrigger === true;
      break;
    }
    case 'notEquals': {
      expressionResult = propertyTrigger === false;
      break;
    }
  }
  return expressionResult;
};
