import { Cognite3DViewer, CogniteModel, Image360Collection } from '@cognite/reveal';
import { AddImageCollection360Options, TypedReveal3DModel } from './types';
import { is360ImageDataModelAddOptions, is3dModelOptions } from './typeGuards';
import { useEffect } from 'react';
import { isSameCadModel, isSamePointCloudModel } from '../../utilities/isSameModel';

export function useRemoveNonReferencedModels(
  addOptions: TypedReveal3DModel[],
  image360CollectionAddOptions: AddImageCollection360Options[],
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
    const correspondingAddOptions = [...addOptionsSet.values()].find((options) => {
      if (!is3dModelOptions(options)) {
        return false;
      }

      if (options.type === 'cad') {
        return isSameCadModel(options, {
          type: 'cad',
          modelId: model.modelId,
          revisionId: model.revisionId,
          transform: model.getModelTransformation()
        });
      } else {
        return isSamePointCloudModel(options, {
          type: 'pointcloud',
          modelId: model.modelId,
          revisionId: model.revisionId,
          transform: model.getModelTransformation()
        });
      }
    });

    if (correspondingAddOptions !== undefined) {
      addOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}

function findNonReferencedCollections(
  image360CollectionAddOptions: AddImageCollection360Options[],
  viewer: Cognite3DViewer
): Image360Collection[] {
  const collections = viewer.get360ImageCollections();
  const collectionAddOptionsSet = new Set(image360CollectionAddOptions);

  return collections.filter((collection) => {
    const correspondingAddOptions = [...collectionAddOptionsSet.values()].find((options) => {
      if (is360ImageDataModelAddOptions(options)) {
        return collection.id === options.externalId;
      } else {
        return collection.id === options.siteId;
      }
    });

    if (correspondingAddOptions !== undefined) {
      collectionAddOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}
