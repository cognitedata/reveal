/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CogniteModel,
  type Image360Collection,
  type Cognite3DViewer,
  type CognitePointCloudModel,
  CogniteCadModel
} from '@cognite/reveal';
import {
  type AddOptionsWithModel,
  type AddResourceOptions,
  type AddReveal3DModelOptions,
  type DefaultResourceStyling,
  type InstanceStylingGroup
} from './types';
import { findNewAndOutdatedResources, is3dModelOptions } from './utils';
import {
  is360DataModelCollection,
  is360ImageCollectionOptions,
  isSameModel
} from '../../utilities/isSameModel';
import assert from 'assert';
import { applyCadStyling } from './applyCadStyling';
import { type CogniteClient } from '@cognite/sdk';
import { type StyledCadModelAddOptions, calculateCadStyling } from './calculateCadModelsStyling';
import {
  type StyledPointCloudModelAddOptions,
  calculatePointCloudStyling
} from './calculatePointCloudModelsStyling';
import { applyPointCloudStyling } from './applyPointCloudStyling';
import { image360CollectionExists, modelExists } from '../../utilities/modelExists';
import { type FdmNodeCache } from '../CacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../CacheProvider/AssetMappingCache';
import {
  isAssetMappingStylingGroup,
  isCadAssetMappingStylingGroup
} from '../../utilities/StylingGroupUtils';
import { type PointCloudAnnotationCache } from '../CacheProvider/PointCloudAnnotationCache';
import { Matrix4 } from 'three';
import { Image360StylingHandler } from './Image360StylingHandler';

export class ResourceUpdater {
  private _pendingModelsPromise: Promise<AddOptionsWithModel[]> = Promise.resolve([]);

  private _runningCounter: number = 0;

  private readonly _viewer: Cognite3DViewer;
  private readonly _client: CogniteClient;

  private readonly _fdmNodeCache: FdmNodeCache;
  private readonly _assetMappingCache: AssetMappingCache;
  private readonly _pointCloudAnnotationCache: PointCloudAnnotationCache;

  private _instanceStyling: InstanceStylingGroup[] = [];
  private _defaultResourceStyling: DefaultResourceStyling = {};

  private readonly _image360StylingHandler: Image360StylingHandler;

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
    onModelLoaded: (() => void) | undefined,
    onModelLoadedError: ((addOptions: AddResourceOptions, error: any) => void) | undefined
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

  public async updateModels(modelAddOptions: AddResourceOptions[]): Promise<void> {
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
  ): Promise<void> {
    this._defaultResourceStyling = defaultStyling;
    this._instanceStyling = instanceStyling;

    this._image360StylingHandler.setCommonStyling(defaultStyling.image360, instanceStyling);

    const models = await this._pendingModelsPromise;
    models.forEach(async (model) => {
      await this.applyStylingAndTransform(model);
    });
  }

  private clearAllModels(): void {
    this._viewer.models.forEach((model) => {
      this._viewer.removeModel(model);
    });
    this._viewer.get360ImageCollections().forEach((collection) => {
      this._viewer.remove360ImageSet(collection);
    });
  }

  private updateKeptModels(
    oldModels: AddOptionsWithModel[],
    newOptions: AddResourceOptions[]
  ): void {
    oldModels.forEach((oldModel) => {
      const correspondingNewOption = newOptions.find((newOption) =>
        isSameModel(oldModel.addOptions, newOption)
      );

      assert(correspondingNewOption !== undefined);
    });
  }

  private async constructNewModelPromises(
    newModelPromises: Array<Promise<AddOptionsWithModel>>,
    keptModels: AddOptionsWithModel[]
  ): Promise<AddOptionsWithModel[]> {
    const allModels = (await Promise.all(newModelPromises)).concat(keptModels);

    await this._image360StylingHandler.setCollections(allModels);
    allModels.forEach(async (model) => {
      await this.applyStylingAndTransform(model);
    });
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

  private addResources(resources: AddResourceOptions[]): Array<Promise<AddOptionsWithModel>> {
    return resources.map(async (addOptions) => {
      try {
        const addedModel = await this.addResourceToViewer(addOptions);

        this._onModelLoaded?.();
        return addedModel;
      } catch (error: any) {
        this._onModelLoadedError?.(addOptions, error);
        throw error;
      }
    });
  }

  private async addResourceToViewer(addOptions: AddResourceOptions): Promise<AddOptionsWithModel> {
    if (is3dModelOptions(addOptions)) {
      const addedModel = await this._viewer.addModel(addOptions);
      if (addedModel instanceof CogniteCadModel) {
        addedModel.setDefaultNodeAppearance({ visible: false });
        return { type: 'cad' as const, model: addedModel, addOptions };
      } else {
        addedModel.setDefaultPointCloudAppearance({ visible: false });
        return { type: 'pointcloud' as const, model: addedModel, addOptions };
      }
    }

    const addedCollection = await (async () => {
      if (is360DataModelCollection(addOptions)) {
        return await this._viewer.add360ImageSet('datamodels', {
          image360CollectionExternalId: addOptions.externalId,
          space: addOptions.space
        });
      } else {
        return await this._viewer.add360ImageSet('events', {
          site_id: addOptions.siteId
        });
      }
    })();

    addedCollection.setDefaultAnnotationStyle({ visible: false });
    return {
      model: addedCollection,
      addOptions,
      type: 'image360' as const
    };
  }

  private async applyStylingAndTransform(model: AddOptionsWithModel): Promise<void> {
    if (model.type === 'cad') {
      if (!modelExists(model.model, this._viewer)) {
        return;
      }
      const [styling] = await this.computeCadModelsStyling([model.addOptions]);

      await applyCadStyling(model.model, styling, this._viewer, this._client);
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
    if (
      (model.type === 'image360' && !image360CollectionExists(model.model, this._viewer)) ||
      (model.type !== 'image360' && !modelExists(model.model, this._viewer))
    )
      return;
    model.model.setModelTransformation(matrix);
  }

  private async computeCadModelsStyling(
    models: AddReveal3DModelOptions[]
  ): Promise<StyledCadModelAddOptions[]> {
    return await calculateCadStyling(
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
    return await calculatePointCloudStyling(
      models as Array<CognitePointCloudModel & { type: 'pointcloud' }>,
      this._instanceStyling?.filter(isAssetMappingStylingGroup),
      this._defaultResourceStyling,
      this._pointCloudAnnotationCache
    );
  }
}
