/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewer, type CogniteModel, type Image360Collection } from '@cognite/reveal';
import { AddResourceOptions } from './types';
import {
  is360ImageAddOptions,
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions,
  is3dModelOptions
} from './typeGuards';
import { useEffect } from 'react';
import { isSame3dModel } from '../../utilities/isSameModel';

export function useRemoveNonReferencedModels(
  addOptions: AddResourceOptions[],
  viewer: Cognite3DViewer
): void {
  useEffect(() => {
    const nonReferencedModels = findNonReferencedModels(addOptions, viewer);

    nonReferencedModels.forEach((model) => {
      viewer.removeModel(model);
    });

    const nonReferencedCollections = findNonReferencedCollections(addOptions, viewer);

    nonReferencedCollections.forEach((collection) => {
      viewer.remove360ImageSet(collection);
    });
  }, [addOptions]);
}

function findNonReferencedModels(
  addOptions: AddResourceOptions[],
  viewer: Cognite3DViewer
): CogniteModel[] {
  const models = viewer.models;
  const addOptionsSet = new Set(addOptions.filter(is3dModelOptions));

  return models.filter((model) => {
    const correspondingAddOptions = (() => {
      for (const options of addOptionsSet) {
        if (!is3dModelOptions(options)) {
          continue;
        }

        const isSameModel = isSame3dModel(options, {
          modelId: model.modelId,
          revisionId: model.revisionId,
          transform: model.getModelTransformation()
        });

        if (isSameModel) {
          return options;
        }
      }
      return undefined;
    })();

    if (correspondingAddOptions !== undefined) {
      addOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}

function findNonReferencedCollections(
  addOptions: AddResourceOptions[],
  viewer: Cognite3DViewer
): Image360Collection[] {
  const image360CollectionAddOptions = addOptions.filter(is360ImageAddOptions);

  const collections = viewer.get360ImageCollections();
  const collectionAddOptionsSet = new Set(image360CollectionAddOptions);

  return collections.filter((collection) => {
    const correspondingAddOptions = (() => {
      for (const options of collectionAddOptionsSet) {
        const isDataModelCollectionAndSame =
          is360ImageDataModelAddOptions(options) && collection.id === options.externalId;
        const isEventCollectionAndSame =
          is360ImageEventsAddOptions(options) && collection.id === options.siteId;

        if (isDataModelCollectionAndSame || isEventCollectionAndSame) {
          return options;
        }
      }
      return undefined;
    })();

    if (correspondingAddOptions !== undefined) {
      collectionAddOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}
