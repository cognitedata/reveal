/*!
 * Copyright 2022 Cognite AS
 */

import { vi } from 'vitest';
import { Potree } from './Potree';
import { EptLoader } from './loading/EptLoader';
import type { ModelDataProvider, ModelIdentifier } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { PointCloudMaterial, PointCloudMaterialManager } from '@reveal/rendering';
import { MAX_NUM_NODES_LOADING } from '@reveal/rendering';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import type { EptJson } from './loading/EptJson';
import { createMockEptGeometry } from '../../../../test-utilities/src/createMockEptGeometry';
import { mockDMModelIdentifier as dmIdentifier } from '../../../../test-utilities/src/mockModelIdentifiers';

import { It, Mock } from 'moq.ts';

const mockModelDataProvider = new Mock<ModelDataProvider>().object();
const mockMaterialManager = new Mock<PointCloudMaterialManager>()
  .setup(p => p.getModelMaterial(It.IsAny()))
  .returns(new Mock<PointCloudMaterial>().object())
  .object();

const preloadedEptData: MetadataWithSignedFiles<EptJson> = {
  signedFiles: { items: [] },
  fileData: {} as Partial<EptJson> as EptJson
};

describe(Potree.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    expect(potreeInstance.maxNumNodesLoading).toEqual(MAX_NUM_NODES_LOADING);
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

  test.each<[string, ModelIdentifier, MetadataWithSignedFiles<EptJson> | undefined, 'load' | 'dmsLoad']>([
    ['DM model with preloaded data uses dmsLoad', dmIdentifier, preloadedEptData, 'dmsLoad'],
    ['DM model without preloaded data uses load', dmIdentifier, undefined, 'load'],
    ['classic model with preloaded data still uses load', new CdfModelIdentifier(10, 20), preloadedEptData, 'load']
  ])('loadPointCloud(): %s', async (_, modelIdentifier, data, expectedMethod) => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);
    const geometry = createMockEptGeometry();
    const loadSpy = vi.spyOn(EptLoader, 'load').mockResolvedValue(geometry);
    const dmsLoadSpy = vi.spyOn(EptLoader, 'dmsLoad').mockResolvedValue(geometry);

    const octree = await potreeInstance.loadPointCloud(
      'https://base',
      'ept.json',
      [],
      modelIdentifier,
      'https://signed',
      data
    );

    const [usedSpy, unusedSpy] = expectedMethod === 'dmsLoad' ? [dmsLoadSpy, loadSpy] : [loadSpy, dmsLoadSpy];
    expect(usedSpy).toHaveBeenCalledTimes(1);
    expect(unusedSpy).not.toHaveBeenCalled();
    expect(octree.pcoGeometry).toBe(geometry);
  });
});
