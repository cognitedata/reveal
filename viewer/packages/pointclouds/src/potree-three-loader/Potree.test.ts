/*!
 * Copyright 2022 Cognite AS
 */

import { Potree } from './Potree';

describe(Potree.name, () => {
  test('Setting and getting point budget works', () => {
    const potreeInstance = new Potree();

    const budgets = [10_000, 500_000, 2_000_000];

    for (const budget of budgets) {
      potreeInstance.pointBudget = budget;

      expect(potreeInstance.pointBudget).toEqual(budget);
    }
  });
});
