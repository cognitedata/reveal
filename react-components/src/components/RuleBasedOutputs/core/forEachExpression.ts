import { assertNever } from '../../../utilities/assertNever';
import { type Expression } from '../types';

export function forEachExpression(
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
