/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CogniteModel,
  type Image360Collection,
  type Cognite3DViewer,
  CognitePointCloudModel,
  CogniteCadModel,
  Image360EnteredDelegate,
  Image360AnnotationAppearance,
  Image360,
  Image360Revision
} from '@cognite/reveal';
import { AddImageCollection360Options, AddResourceOptions } from './types';
import { findNewAndOutdatedResources, is3dModelOptions } from './utils';
import {
  is360DataModelCollection,
  is360ImageCollectionOptions,
  isSameModel
} from '../../utilities/isSameModel';
import assert from 'assert';
import { Matrix4 } from 'three';
import { applyCadStyling } from './applyCadStyling';
import { AnnotationsCogniteAnnotationTypesImagesAssetLink, CogniteClient } from '@cognite/sdk';
import { StyledCadModelAddOptions } from '../../hooks/useCalculateModelsStyling';
import { StyledPointCloudModelAddOptions } from '../../hooks/useCalculatePointCloudModelsStyling';
import { applyPointCloudStyling } from './applyPointCloudStyling';
import { modelExists } from '../../utilities/modelExists';

export type StyledImage360CollectionAddOptions = {
  addOptions: AddImageCollection360Options;
  styleGroups: { assetIds: number[]; style: Image360AnnotationAppearance }[];
  defaultStyle?: Image360AnnotationAppearance;
};

type CadAddOptionsWithModel = {
  type: 'cad';
  styledAddOptions: StyledCadModelAddOptions;
  model: CogniteCadModel;
};

type PointCloudAddOptionsWithModel = {
  type: 'pointcloud';
  styledAddOptions: StyledPointCloudModelAddOptions;
  model: CognitePointCloudModel;
};

type Image360AddOptionsWithModel = {
  type: 'image360';
  styledAddOptions: StyledImage360CollectionAddOptions;
  model: Image360Collection;
};

type AddOptionsWithModel =
  | CadAddOptionsWithModel
  | PointCloudAddOptionsWithModel
  | Image360AddOptionsWithModel;

export type StyledAddModelOptions =
  | StyledCadModelAddOptions
  | StyledPointCloudModelAddOptions
  | StyledImage360CollectionAddOptions;

export class ResourceContainerClass {
  private _pendingModelsPromise: Promise<Array<AddOptionsWithModel>> = Promise.resolve([]);

  private _runningCounter: number = 0;

  private readonly _previousImage360StylingCallbacks = new Map<
    string,
    (image: Image360, imageRevision: Image360Revision) => void
  >();

  private readonly _viewer: Cognite3DViewer;
  private readonly _client: CogniteClient;

  private readonly _onModelLoaded: (() => void) | undefined;
  private readonly _onModelLoadedError:
    | ((addOptions: AddResourceOptions, error: any) => void)
    | undefined;

  constructor(
    viewer: Cognite3DViewer,
    client: CogniteClient,
    onModelLoaded: () => void | undefined,
    onModelLoadedError: (addOptions: AddResourceOptions, error: any) => void | undefined
  ) {
    this._viewer = viewer;
    this._client = client;
    this._onModelLoaded = onModelLoaded;
    this._onModelLoadedError = onModelLoadedError;
  }

  public async sync(modelAddOptions: StyledAddModelOptions[]): Promise<void> {
    this._runningCounter++;
    const cachedRunningCounter = this._runningCounter;

    const currentlyAddedResources = await this._pendingModelsPromise;

    const isLatestSyncRun = this._runningCounter === cachedRunningCounter;
    if (!isLatestSyncRun) {
      return;
    }

    if (
      currentlyAddedResources.length !==
      this._viewer.models.length + this._viewer.get360ImageCollections().length
    ) {
      this._viewer.models.forEach((model) => this._viewer.removeModel(model));
      this._viewer
        .get360ImageCollections()
        .forEach((collection) => this._viewer.remove360ImageSet(collection));

      currentlyAddedResources.splice(0);
    }

    const { newResources, outdatedResources } = findNewAndOutdatedResources(
      modelAddOptions,
      currentlyAddedResources.map((options) => options.styledAddOptions)
    );

    const keptModelsWithOptions = this.removeResources(outdatedResources, currentlyAddedResources);
    this.updateKeptModels(keptModelsWithOptions, modelAddOptions);
    const newModelWithAddOptionsPromises = this.addResources(newResources);

    this._pendingModelsPromise = this.constructNewModelPromises(
      newModelWithAddOptionsPromises,
      keptModelsWithOptions
    );
  }

  private updateKeptModels(oldModels: AddOptionsWithModel[], newOptions: StyledAddModelOptions[]) {
    oldModels.forEach((oldModel) => {
      const correspondingNewOption = newOptions.find((newOption) =>
        isSameModel(oldModel.styledAddOptions.addOptions, newOption.addOptions)
      );

      assert(correspondingNewOption !== undefined);
      oldModel.styledAddOptions = correspondingNewOption;
    });
  }

  private async constructNewModelPromises(
    newModelPromises: Promise<AddOptionsWithModel>[],
    keptModels: AddOptionsWithModel[]
  ): Promise<AddOptionsWithModel[]> {
    const allModels = (await Promise.all(newModelPromises)).concat(keptModels);

    this.removeAllImage360Callbacks(allModels);
    allModels.forEach((model) => this.applyStyling(model, this._client));

    return allModels;
  }

  private removeAllImage360Callbacks(newModels: AddOptionsWithModel[]) {
    const collections = newModels.filter((model): model is Image360AddOptionsWithModel =>
      is360ImageCollectionOptions(model.styledAddOptions.addOptions)
    );
    collections.forEach((collection) => {
      const prevCallback = this._previousImage360StylingCallbacks.get(collection.model.id);
      if (prevCallback !== undefined) {
        collection.model.off('image360Entered', prevCallback);
      }
    });

    this._previousImage360StylingCallbacks.clear();
  }

  private removeResources(
    resources: StyledAddModelOptions[],
    currentModels: AddOptionsWithModel[]
  ): AddOptionsWithModel[] {
    const currentModelsSet = new Set(currentModels);
    resources.forEach((resourceAddOptions) => {
      const resourceAndModel = [...currentModelsSet].find((model) =>
        isSameModel(model.styledAddOptions.addOptions, resourceAddOptions.addOptions)
      );

      assert(resourceAndModel !== undefined);

      currentModelsSet.delete(resourceAndModel);

      if (is3dModelOptions(resourceAddOptions.addOptions)) {
        this._viewer.removeModel(resourceAndModel.model as CogniteModel);
      } else if (is360ImageCollectionOptions(resourceAddOptions.addOptions)) {
        this._viewer.remove360ImageSet(resourceAndModel.model as Image360Collection);
      } else {
        throw Error('Tried to remove Model of unknown type');
      }
    });

    return [...currentModelsSet];
  }

  private addResources(resources: StyledAddModelOptions[]): Promise<AddOptionsWithModel>[] {
    return resources
      .map((addOptions) => {
        if (is3dModelOptions(addOptions.addOptions)) {
          let addModelPromise: Promise<CogniteModel>;
          if (addOptions.addOptions.type === 'cad') {
            addModelPromise = this._viewer.addCadModel(addOptions.addOptions);
          } else {
            addModelPromise = this._viewer.addPointCloudModel(addOptions.addOptions);
          }
          addModelPromise
            .catch((error) => this._onModelLoadedError?.(addOptions.addOptions, error))
            .then(this._onModelLoaded);

          return addModelPromise;
        } else if (is360DataModelCollection(addOptions.addOptions)) {
          const addCollectionPromise = this._viewer.add360ImageSet('datamodels', {
            image360CollectionExternalId: addOptions.addOptions.externalId,
            space: addOptions.addOptions.space
          });

          addCollectionPromise
            .catch((error) => this._onModelLoadedError?.(addOptions.addOptions, error))
            .then(this._onModelLoaded);
          return addCollectionPromise;
        } else {
          const addCollectionPromise = this._viewer.add360ImageSet('events', {
            site_id: addOptions.addOptions.siteId
          });
          addCollectionPromise
            .catch((error) => this._onModelLoadedError?.(addOptions.addOptions, error))
            .then(this._onModelLoaded);

          return addCollectionPromise;
        }
      })
      .map(async (modelPromise, ind) => {
        const model = await modelPromise;

        model.setModelTransformation(resources[ind].addOptions.transform ?? new Matrix4());
        const modelType = getModelType(model);
        return { type: modelType, model, styledAddOptions: resources[ind] } as AddOptionsWithModel;
      });
  }

  private applyStyling(model: AddOptionsWithModel, client: CogniteClient): void {
    if (model.type === 'pointcloud') {
      if (!modelExists(model.model, this._viewer)) {
        return;
      }
      applyPointCloudStyling(model.model, model.styledAddOptions);
    } else if (model.type === 'cad') {
      if (!modelExists(model.model, this._viewer)) {
        return;
      }
      void applyCadStyling(client, model.model, model.styledAddOptions);
    } else {
      void this.update360ImageStylingCallback(model);
    }
  }

  private async update360ImageStylingCallback(
    collection: Image360AddOptionsWithModel
  ): Promise<void> {
    const collectionStyleGroupsWithSet = collection.styledAddOptions.styleGroups.map((group) => ({
      styling: group.style,
      assetIdSet: new Set(group.assetIds)
    }));

    const newStylingCallback: Image360EnteredDelegate = async (_image, imageRevision) => {
      const annotations = await imageRevision.getAnnotations();
      annotations.forEach((annotation) => {
        annotation.setColor(collection.styledAddOptions.defaultStyle?.color);
        annotation.setVisible(collection.styledAddOptions.defaultStyle?.visible);

        const assetRefId = (
          annotation.annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink
        )?.assetRef?.id;

        if (assetRefId === undefined) {
          return;
        }

        collectionStyleGroupsWithSet.forEach((groupWithSets) => {
          if (assetRefId !== undefined && groupWithSets.assetIdSet.has(assetRefId)) {
            if (groupWithSets.styling.color !== undefined) {
              annotation.setColor(groupWithSets.styling.color);
            }

            if (groupWithSets.styling.visible !== undefined) {
              annotation.setVisible(groupWithSets.styling.visible);
            }
          }
        });
      });
    };

    collection.model.on('image360Entered', newStylingCallback);

    const collectionId = collection.model.id;
    this._previousImage360StylingCallbacks.set(collectionId, newStylingCallback);
  }
}

function getModelType(model: CogniteModel | Image360Collection): 'cad' | 'pointcloud' | 'image360' {
  if (model instanceof CogniteCadModel || model instanceof CognitePointCloudModel) {
    return model.type;
  }

  return 'image360';
}
