/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CogniteModel,
  type Image360Collection,
  type Cognite3DViewer,
  CognitePointCloudModel,
  CogniteCadModel,
  Image360AnnotationAppearance
} from '@cognite/reveal';
import {
  AddImageCollection360Options,
  AddResourceOptions,
  AddReveal3DModelOptions,
  DefaultResourceStyling,
  InstanceStylingGroup
} from './types';
import { findNewAndOutdatedResources, is3dModelOptions } from './utils';
import {
  is360DataModelCollection,
  is360ImageCollectionOptions,
  isSameModel
} from '../../utilities/isSameModel';
import assert from 'assert';
import { applyCadStyling } from './applyCadStyling';
import { CogniteClient } from '@cognite/sdk';
import {
  StyledCadModelAddOptions,
  calculateCadStyling
} from '../../hooks/calculateCadModelsStyling';
import {
  StyledPointCloudModelAddOptions,
  calculatePointCloudStyling
} from '../../hooks/calculatePointCloudModelsStyling';
import { applyPointCloudStyling } from './applyPointCloudStyling';
import { modelExists } from '../../utilities/modelExists';
import { FdmNodeCache } from '../CacheProvider/FdmNodeCache';
import { AssetMappingCache } from '../CacheProvider/AssetMappingCache';
import {
  isAssetMappingStylingGroup,
  isCadAssetMappingStylingGroup
} from '../../utilities/StylingGroupUtils';
import { PointCloudAnnotationCache } from '../CacheProvider/PointCloudAnnotationCache';
import { Matrix4 } from 'three';
import { Image360StylingHandler } from './Image360StylingHandler';

export type Image360AnnotationStyleGroup = {
  assetIds: number[];
  style: Image360AnnotationAppearance;
};

export type StyledImage360CollectionAddOptions = {
  addOptions: AddImageCollection360Options;
  styleGroups: Image360AnnotationStyleGroup[];
  defaultStyle?: Image360AnnotationAppearance;
};

type CadAddOptionsWithModel = {
  type: 'cad';
  addOptions: AddReveal3DModelOptions;
  model: CogniteCadModel;
};

type PointCloudAddOptionsWithModel = {
  type: 'pointcloud';
  addOptions: AddReveal3DModelOptions;
  model: CognitePointCloudModel;
};

export type Image360AddOptionsWithModel = {
  type: 'image360';
  addOptions: AddImageCollection360Options;
  model: Image360Collection;
};

export type AddOptionsWithModel =
  | CadAddOptionsWithModel
  | PointCloudAddOptionsWithModel
  | Image360AddOptionsWithModel;

export type StyledAddModelOptions =
  | StyledCadModelAddOptions
  | StyledPointCloudModelAddOptions
  | StyledImage360CollectionAddOptions;

export class ResourceUpdater {
  private _pendingModelsPromise: Promise<Array<AddOptionsWithModel>> = Promise.resolve([]);

  private _runningCounter: number = 0;

  private readonly _viewer: Cognite3DViewer;
  private readonly _client: CogniteClient;

  private readonly _fdmNodeCache: FdmNodeCache;
  private readonly _assetMappingCache: AssetMappingCache;
  private readonly _pointCloudAnnotationCache: PointCloudAnnotationCache;

  private _instanceStyling: InstanceStylingGroup[] = [];
  private _defaultResourceStyling: DefaultResourceStyling = {};

  private _image360StylingHandler: Image360StylingHandler;

  private readonly _onModelLoaded: (() => void) | undefined;
  private readonly _onModelLoadedError:
    | ((addOptions: AddResourceOptions, error: any) => void)
    | undefined;

  constructor(
    viewer: Cognite3DViewer,
    client: CogniteClient,
    fdmNodeCache: FdmNodeCache,
    assetMappingCache: AssetMappingCache,
    pointCloudAnnotationCache: PointCloudAnnotationCache,
    onModelLoaded: () => void | undefined,
    onModelLoadedError: (addOptions: AddResourceOptions, error: any) => void | undefined
  ) {
    this._viewer = viewer;
    this._client = client;
    this._fdmNodeCache = fdmNodeCache;
    this._assetMappingCache = assetMappingCache;
    this._pointCloudAnnotationCache = pointCloudAnnotationCache;
    this._onModelLoaded = onModelLoaded;
    this._onModelLoadedError = onModelLoadedError;
    this._image360StylingHandler = new Image360StylingHandler(this._viewer);
  }

  public async sync(modelAddOptions: AddResourceOptions[]): Promise<void> {
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
      this.clearAllModels();
      currentlyAddedResources.splice(0);
    }

    const { newResources, outdatedResources } = findNewAndOutdatedResources(
      modelAddOptions,
      currentlyAddedResources.map((options) => options.addOptions)
    );

    const keptModelsWithOptions = this.removeResources(outdatedResources, currentlyAddedResources);
    this.updateKeptModels(keptModelsWithOptions, modelAddOptions);
    const newModelWithAddOptionsPromises = this.addResources(newResources);

    this._pendingModelsPromise = this.constructNewModelPromises(
      newModelWithAddOptionsPromises,
      keptModelsWithOptions
    );
  }

  public async updateCommonStyling(
    instanceStyling: InstanceStylingGroup[],
    defaultStyling: DefaultResourceStyling
  ) {
    this._defaultResourceStyling = defaultStyling;
    this._instanceStyling = instanceStyling;

    this._image360StylingHandler.setCommonStyling(defaultStyling.image360, instanceStyling);

    const models = await this._pendingModelsPromise;
    models.forEach((model) => this.applyStylingAndTransform(model));
  }

  private clearAllModels() {
    this._viewer.models.forEach((model) => this._viewer.removeModel(model));
    this._viewer
      .get360ImageCollections()
      .forEach((collection) => this._viewer.remove360ImageSet(collection));
  }

  private updateKeptModels(oldModels: AddOptionsWithModel[], newOptions: AddResourceOptions[]) {
    oldModels.forEach((oldModel) => {
      const correspondingNewOption = newOptions.find((newOption) =>
        isSameModel(oldModel.addOptions, newOption)
      );

      assert(correspondingNewOption !== undefined);
    });
  }

  private async constructNewModelPromises(
    newModelPromises: Promise<AddOptionsWithModel>[],
    keptModels: AddOptionsWithModel[]
  ): Promise<AddOptionsWithModel[]> {
    const allModels = (await Promise.all(newModelPromises)).concat(keptModels);

    await this._image360StylingHandler.setCollections(allModels);
    allModels.forEach((model) => this.applyStylingAndTransform(model));
    return allModels;
  }

  private removeResources(
    resources: AddResourceOptions[],
    currentModels: AddOptionsWithModel[]
  ): AddOptionsWithModel[] {
    const currentModelsSet = new Set(currentModels);
    resources.forEach((resourceAddOptions) => {
      const resourceAndModel = [...currentModelsSet].find((model) =>
        isSameModel(model.addOptions, resourceAddOptions)
      );

      assert(resourceAndModel !== undefined);

      currentModelsSet.delete(resourceAndModel);

      if (is3dModelOptions(resourceAddOptions)) {
        this._viewer.removeModel(resourceAndModel.model as CogniteModel);
      } else if (is360ImageCollectionOptions(resourceAddOptions)) {
        this._viewer.remove360ImageSet(resourceAndModel.model as Image360Collection);
      } else {
        throw Error('Tried to remove Model of unknown type');
      }
    });

    return [...currentModelsSet];
  }

  private addResources(resources: AddResourceOptions[]): Promise<AddOptionsWithModel>[] {
    return resources.map(async (addOptions) => {
      try {
        if (is3dModelOptions(addOptions)) {
          const addedModel = await this._viewer.addModel(addOptions);
          if (addedModel instanceof CogniteCadModel) {
            this._onModelLoaded?.();
            return { type: 'cad' as const, model: addedModel, addOptions };
          } else {
            this._onModelLoaded?.();
            return { type: 'pointcloud' as const, model: addedModel, addOptions };
          }
        } else {
          const addedCollection = await (() => {
            if (is360DataModelCollection(addOptions)) {
              return this._viewer.add360ImageSet('datamodels', {
                image360CollectionExternalId: addOptions.externalId,
                space: addOptions.space
              });
            } else {
              return this._viewer.add360ImageSet('events', {
                site_id: addOptions.siteId
              });
            }
          })();

          this._onModelLoaded?.();
          return {
            model: addedCollection,
            addOptions,
            type: 'image360' as const
          };
        }
      } catch (error: any) {
        this._onModelLoadedError?.(addOptions, error);
        throw error;
      }
    });
  }

  private async applyStylingAndTransform(model: AddOptionsWithModel): Promise<void> {
    if (model.type === 'cad') {
      if (!modelExists(model.model, this._viewer)) {
        return;
      }
      const [styling] = await this.computeCadModelsStyling([model.addOptions]);
      await applyCadStyling(this._client, model.model, styling);
    } else if (model.type === 'pointcloud') {
      if (!modelExists(model.model, this._viewer)) {
        return;
      }
      const [styling] = await this.computePointCloudModelsStyling([model.model]);
      applyPointCloudStyling(model.model, styling);
    } else {
      await this._image360StylingHandler.update360ImageStylingCallback(model.model);
    }

    const matrix = model.addOptions.transform ?? new Matrix4();
    model.model.setModelTransformation(matrix);
  }

  private async computeCadModelsStyling(
    models: AddReveal3DModelOptions[]
  ): Promise<StyledCadModelAddOptions[]> {
    return calculateCadStyling(
      models,
      this._instanceStyling?.filter(isCadAssetMappingStylingGroup) ?? [],
      this._fdmNodeCache,
      this._assetMappingCache,
      this._defaultResourceStyling
    );
  }

  private async computePointCloudModelsStyling(
    models: CognitePointCloudModel[]
  ): Promise<StyledPointCloudModelAddOptions[]> {
    return calculatePointCloudStyling(
      models as (CognitePointCloudModel & { type: 'pointcloud' })[],
      this._instanceStyling?.filter(isAssetMappingStylingGroup),
      this._defaultResourceStyling,
      this._pointCloudAnnotationCache
    );
  }
}
