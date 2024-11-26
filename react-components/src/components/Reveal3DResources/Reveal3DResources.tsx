/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useState, useEffect, useMemo } from 'react';
import {
  type DataSourceType,
  type Cognite3DViewer,
  type AddModelOptions,
  type ClassicDataSourceType,
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer } from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type TypedReveal3DModel,
  type AddResourceOptions,
  type Reveal3DResourcesProps,
  type CadModelOptions
} from './types';
import { useCalculatePointCloudStyling } from './hooks/useCalculatePointCloudStyling';
import { EMPTY_ARRAY } from '../../utilities/constants';
import {
  isAssetMappingStylingGroup,
  isImage360AssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { type ImageCollectionModelStyling } from '../Image360CollectionContainer/useApply360AnnotationStyling';
import { is360ImageAddOptions, isClassicIdentifier } from './typeGuards';
import { useRemoveNonReferencedModels } from './hooks/useRemoveNonReferencedModels';
import { useCalculateCadStyling } from './hooks/useCalculateCadStyling';
import { useReveal3DResourcesStylingLoadingSetter } from './Reveal3DResourcesInfoContext';
import { type CadModelStyling } from '../CadModelContainer/types';
import { type PointCloudModelStyling } from '../PointCloudContainer/types';
import { type Image360PolygonStylingGroup } from '../Image360CollectionContainer';
import { useAssetMappedNodesForRevisions } from '../CacheProvider';
import {
  useGenerateAssetMappingCachePerItemFromModelCache,
  useGenerateNode3DCache
} from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { useCadOrPointCloudResources } from './hooks/useCadOrPointCloudResources';
import { useClassicModelOptions } from './hooks/useClassicModelOptions';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError,
  onResourceIsLoaded,
  image360Settings
}: Reveal3DResourcesProps): ReactElement => {
  const viewer = useReveal();
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);
  const numModelsLoaded = useRef(0);

  useRemoveNonReferencedModels(resources, viewer);

  const cadOrPointCloudResources = useCadOrPointCloudResources(resources);
  const classicModelOptions = useClassicModelOptions(cadOrPointCloudResources);

  useEffect(() => {
    const fetchTypedModels = async (): Promise<void> => {
      const typedModels = await getTypedModels(
        classicModelOptions,
        viewer,
        cadOrPointCloudResources,
        onResourceLoadError
      );
      setReveal3DModels(typedModels);
    };

    void fetchTypedModels();
  }, [classicModelOptions.length, cadOrPointCloudResources, viewer, onResourceLoadError]);

  const image360CollectionAddOptions = useMemo(() => {
    return resources
      .filter(is360ImageAddOptions)
      .map((options) => ({ ...image360Settings, ...options }));
  }, [resources, image360Settings]);

  const cadModelOptions = useMemo(
    () => reveal3DModels.filter((model): model is CadModelOptions => model.type === 'cad'),
    [reveal3DModels]
  );

  const { data: assetMappings } = useAssetMappedNodesForRevisions(cadModelOptions);

  useGenerateAssetMappingCachePerItemFromModelCache(cadModelOptions, assetMappings);
  useGenerateNode3DCache(cadModelOptions, assetMappings);

  const instanceStylingWithAssetMappings =
    instanceStyling?.filter(isAssetMappingStylingGroup) ?? EMPTY_ARRAY;

  const { styledModels: styledCadModelOptions, isModelMappingsLoading } = useCalculateCadStyling(
    cadModelOptions,
    instanceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const setModel3DStylingLoading = useReveal3DResourcesStylingLoadingSetter();

  useEffect(() => {
    setModel3DStylingLoading(isModelMappingsLoading);
  }, [isModelMappingsLoading]);

  const styledPointCloudModelOptions = useCalculatePointCloudStyling(
    reveal3DModels,
    instanceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const image360StyledGroup =
    instanceStyling
      ?.filter(isImage360AssetStylingGroup)
      .map((group) => {
        return { assetIds: group.assetIds, style: group.style.image360 };
      })
      .filter(
        (group): group is Image360PolygonStylingGroup & { assetIds: number[] } =>
          group.style !== undefined
      ) ?? EMPTY_ARRAY;

  const onModelLoaded = (
    model:
      | CogniteCadModel
      | CognitePointCloudModel<DataSourceType>
      | Image360Collection<DataSourceType>
  ): void => {
    onModelFailOrSucceed();
    onResourceIsLoaded?.(model);
  };

  const onModelLoadedError = (addOptions: AddResourceOptions, error: any): void => {
    onResourceLoadError?.(addOptions, error);
    onModelFailOrSucceed();
  };

  const onModelFailOrSucceed = (): void => {
    numModelsLoaded.current += 1;

    const expectedTotalLoadCount = reveal3DModels.length + image360CollectionAddOptions.length;

    if (numModelsLoaded.current === expectedTotalLoadCount && onResourcesAdded !== undefined) {
      onResourcesAdded();
    }
  };

  return (
    <>
      {styledCadModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.cad?.default;
        const cadStyling: CadModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        return (
          <CadModelContainer
            key={`${model.modelId}/${model.revisionId}/${index}`}
            addModelOptions={model}
            styling={cadStyling}
            transform={model.transform}
            onLoad={onModelLoaded}
            onLoadError={onResourceLoadError}
          />
        );
      })}
      {styledPointCloudModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.pointcloud?.default;
        const pcStyling: PointCloudModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        let key;
        if (isClassicIdentifier(model)) {
          key = `${model.modelId}/${model.revisionId}/${index}`;
        } else {
          key = `${model.revisionExternalId}/${model.revisionSpace}/${index}`;
        }
        return (
          <PointCloudContainer
            key={key}
            addModelOptions={model}
            styling={pcStyling}
            transform={model.transform}
            onLoad={onModelLoaded}
            onLoadError={onModelLoadedError}
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        const image360Styling: ImageCollectionModelStyling = {
          defaultStyle: defaultResourceStyling?.image360?.default,
          groups: image360StyledGroup
        };
        let key;
        if ('siteId' in addModelOption) {
          key = `${addModelOption.siteId}`;
        } else if ('externalId' in addModelOption) {
          key = `${addModelOption.externalId}`;
        }

        if ('externalId' in addModelOption || 'siteId' in addModelOption) {
          return (
            <Image360CollectionContainer
              key={key}
              addImage360CollectionOptions={addModelOption}
              styling={image360Styling}
              onLoad={onModelLoaded}
              onLoadError={onModelLoadedError}
            />
          );
        }
        return <></>;
      })}
    </>
  );
};

async function getTypedModels(
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>,
  viewer: Cognite3DViewer<DataSourceType>,
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>>,
  onLoadFail?: (resource: AddResourceOptions, error: any) => void
): Promise<TypedReveal3DModel[]> {
  const errorFunction = onLoadFail ?? defaultLoadFailHandler;

  const modelTypePromises = classicModelOptions.map(async (classicModelOptions, index) => {
    const { modelId, revisionId } = classicModelOptions;
    const type = await viewer.determineModelType(modelId, revisionId).catch((error) => {
      errorFunction(classicModelOptions, error);
      return '';
    });

    const typedModel = {
      ...addModelOptionsArray[index],
      type,
      ...(type === 'cad' && { modelId, revisionId })
    };
    return typedModel;
  });

  const resourceLoadResults = await Promise.all(modelTypePromises);
  const successfullyLoadedResources = resourceLoadResults.filter(
    (p): p is TypedReveal3DModel => p.type === 'cad' || p.type === 'pointcloud'
  );

  return successfullyLoadedResources;
}

function defaultLoadFailHandler(resource: AddResourceOptions, error: any): void {
  console.warn(`Could not load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`);
}
