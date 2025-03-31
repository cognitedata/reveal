import { expect } from 'vitest';
import { type Query } from '../../../src/data-providers/FdmSDK';

export function expectWithExpressionClausesToHaveLimit(query: Query, limit: number): void {
  const withExpressionClauses = Object.values(query.with);

  withExpressionClauses.forEach((clause) => {
    expect(clause.limit).toEqual(limit);
  });
}
