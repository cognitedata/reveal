/*!
 * Copyright 2022 Cognite AS
 */

import { Potree } from './Potree';
import { ModelDataProvider } from '@reveal/data-providers';
import { PointCloudMaterialManager } from '@reveal/rendering';

import { Mock } from 'moq.ts';

const mockModelDataProvider = new Mock<ModelDataProvider>().object();
const mockMaterialManager = new Mock<PointCloudMaterialManager>().object();

describe(Potree.name, () => {
  test('Setting and getting point budget works', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    const budgets = [10_000, 500_000, 2_000_000];

    for (const budget of budgets) {
      potreeInstance.pointBudget = budget;

      expect(potreeInstance.pointBudget).toEqual(budget);
    }
  });

  test('Max nodes loading is set from constant', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    expect(potreeInstance.maxNumNodesLoading).toBeGreaterThan(0);
    expect(potreeInstance.maxNumNodesLoading).toBeLessThanOrEqual(20);
  });

  test('LRU is initialized with point budget', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    expect(potreeInstance.lru.pointBudget).toBe(potreeInstance.pointBudget);
  });

  test('Changing point budget updates LRU budget', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    const newBudget = 1_000_000;
    potreeInstance.pointBudget = newBudget;

    expect(potreeInstance.lru.pointBudget).toBe(newBudget);
  });
});
