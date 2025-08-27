import { type Expression } from '../types';

export const convertExpressionStringMetadataKeyToLowerCase = (expression: Expression): void => {
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
