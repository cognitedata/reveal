import { Expression, TriggerTypeData } from "../types";
import { checkBooleanExpressionStatement } from "./checkBooleanExpressionStatement";
import { checkDatetimeExpressionStatement } from "./checkDatetimeExpressionStatement";
import { checkNumericExpressionStatement } from "./checkNumericExpressionStatement";
import { checkStringExpressionStatement } from "./checkStringExpressionStatement";

export const traverseExpression = (
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
