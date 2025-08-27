import { expect } from 'vitest';
import { type Query } from '../../../src/data-providers/FdmSDK';

export function expectDmsQueryToBeValid(query: Query): void {
  const selectClauseExpressionNames = Object.keys(query.select);
  const withClauseExpressionNames = Object.keys(query.with);

  selectClauseExpressionNames.forEach((expressionName) => {
    expect(withClauseExpressionNames).toContain(expressionName);
  });
}
