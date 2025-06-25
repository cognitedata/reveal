import { uniq } from 'lodash';
import { isDefined } from '../../../utilities/isDefined';
import { type Expression } from '../types';
import { getTimeseriesExternalIdFromNumericExpression } from './getTimeseriesExternalIdFromNumericExpression';

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
