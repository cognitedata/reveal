/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewer, type CogniteModel, type Image360Collection } from '@cognite/reveal';
import { type AddImage360CollectionOptions, type TypedReveal3DModel } from './types';
import {
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions,
  is3dModelOptions
} from './typeGuards';
import { useEffect } from 'react';
import { isSameCadModel, isSamePointCloudModel } from '../../utilities/isSameModel';

export function useRemoveNonReferencedModels(
  addOptions: TypedReveal3DModel[],
  image360CollectionAddOptions: AddImage360CollectionOptions[],
  viewer: Cognite3DViewer
): void {
  useEffect(() => {
    const nonReferencedModels = findNonReferencedModels(addOptions, viewer);

    nonReferencedModels.forEach((model) => {
      viewer.removeModel(model);
    });

    const nonReferencedCollections = findNonReferencedCollections(
      image360CollectionAddOptions,
      viewer
    );

    nonReferencedCollections.forEach((collection) => {
      viewer.remove360ImageSet(collection);
    });
  }, [addOptions]);
}

function findNonReferencedModels(
  addOptions: TypedReveal3DModel[],
  viewer: Cognite3DViewer
): CogniteModel[] {
  const models = viewer.models;
  const addOptionsSet = new Set(addOptions);

  return models.filter((model) => {
    const correspondingAddOptions = (() => {
      for (const options of addOptionsSet) {
        if (!is3dModelOptions(options)) {
          continue;
        }

        const isCadAndSame =
          options.type === 'cad' &&
          isSameCadModel(options, {
            type: 'cad',
            modelId: model.modelId,
            revisionId: model.revisionId,
            transform: model.getModelTransformation()
          });

        const isPointCloudAndSame =
          options.type === 'pointcloud' &&
          isSamePointCloudModel(options, {
            type: 'pointcloud',
            modelId: model.modelId,
            revisionId: model.revisionId,
            transform: model.getModelTransformation()
          });

        if (isCadAndSame || isPointCloudAndSame) {
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
  image360CollectionAddOptions: AddImage360CollectionOptions[],
  viewer: Cognite3DViewer
): Image360Collection[] {
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
