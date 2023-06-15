import { describe, expect, test } from '@jest/globals';

import { getSelectedModel } from './fdm';
import { FlattenedDataModel } from './transformation';

describe('getSelectedModel', () => {
  test('returns correct model if two spaces has models with same external id', () => {
    const selectedModelDescription = 'selected model';
    const selectedModelExternalId = 'Movie';
    const selectedModelSpace = 'selectedspace';

    const mockFlattenedDataModels: FlattenedDataModel[] = [
      {
        externalId: selectedModelExternalId,
        space: 'foo',
        versions: [],
      },
      {
        description: selectedModelDescription,
        externalId: selectedModelExternalId,
        space: selectedModelSpace,
        versions: [],
      },
    ];

    const selectedModel = getSelectedModel(mockFlattenedDataModels, {
      externalId: selectedModelExternalId,
      space: selectedModelSpace,
    });

    expect(selectedModel?.description).toBe(selectedModelDescription);
  });
});
