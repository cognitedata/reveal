/*!
 * Copyright 2025 Cognite AS
 */
import { assertNever } from '../../../utilities/assertNever';
import { type Expression, type TriggerType } from '../types';

export function getExpressionTriggerTypes(expression: Expression): TriggerType[] {
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
