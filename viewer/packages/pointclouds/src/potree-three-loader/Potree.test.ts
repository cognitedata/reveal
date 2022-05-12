/*!
 * Copyright 2022 Cognite AS
 */

import { Potree } from './Potree';
import { ModelDataProvider } from '@reveal/modeldata-api';

import { Mock } from 'moq.ts';

const mockModelDataProvider = new Mock<ModelDataProvider>().object();

describe(Potree.name, () => {
  test('Setting and getting point budget works', () => {
    const potreeInstance = new Potree(mockModelDataProvider);

    const budgets = [10_000, 500_000, 2_000_000];

    for (const budget of budgets) {
      potreeInstance.pointBudget = budget;

      expect(potreeInstance.pointBudget).toEqual(budget);
    }
  });
});
