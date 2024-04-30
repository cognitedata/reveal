/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useState, useEffect, useMemo } from 'react';
import { type Cognite3DViewer } from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type AddReveal3DModelOptions,
  type TypedReveal3DModel,
  type AddResourceOptions,
  type Reveal3DResourcesProps,
  type CadModelOptions,
  type PointCloudModelOptions
} from './types';
import { useCalculateCadStyling } from '../../hooks/useCalculateModelsStyling';
import { useCalculatePointCloudStyling } from '../../hooks/useCalculatePointCloudModelsStyling';
import { EMPTY_ARRAY } from '../../utilities/constants';
import {
  isAssetMappingStylingGroup,
  isCadAssetMappingStylingGroup,
  isImage360AssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import {
  ResourceContainerClass,
  StyledAddModelOptions,
  StyledImage360CollectionAddOptions
} from './ResourceContainerClass';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { is360ImageCollectionOptions } from '../../utilities/isSameModel';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);

  const viewer = useReveal();
  const sdk = useSDK();

  const onModelFailOrSucceed = (): void => {
    numModelsLoaded.current += 1;

    const expectedTotalLoadCount = resources.length;

    if (numModelsLoaded.current === expectedTotalLoadCount && onResourcesAdded !== undefined) {
      onResourcesAdded();
    }
  };

  const onModelLoaded = (): void => {
    onModelFailOrSucceed();
  };

  const onModelLoadedError = (addOptions: AddResourceOptions, error: any): void => {
    onResourceLoadError?.(addOptions, error);
    onModelFailOrSucceed();
  };

  const revealHandler = useRef<ResourceContainerClass>(
    new ResourceContainerClass(viewer, sdk, onModelLoaded, onModelLoadedError)
  );
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    void getTypedModels(resources, viewer, onResourceLoadError).then(setReveal3DModels);
  }, [resources, viewer]);

  const cadModelOptions = useMemo(() => {
    const cadModels = reveal3DModels.filter(
      (model): model is CadModelOptions => model.type === 'cad'
    );
    return cadModels;
  }, [reveal3DModels]);

  const pointCloudModelOptions = useMemo(
    () =>
      reveal3DModels.filter(
        (model): model is PointCloudModelOptions => model.type === 'pointcloud'
      ),
    [reveal3DModels]
  );

  const styledCadModelOptions = useCalculateCadStyling(
    cadModelOptions,
    instanceStyling?.filter(isCadAssetMappingStylingGroup) ?? EMPTY_ARRAY,
    defaultResourceStyling
  );

  const styledPointCloudModelOptions = useCalculatePointCloudStyling(
    pointCloudModelOptions,
    instanceStyling?.filter(isAssetMappingStylingGroup) ?? EMPTY_ARRAY,
    defaultResourceStyling
  );

  const image360CollectionAddOptions = resources.filter(is360ImageCollectionOptions);
  const image360StyledGroups =
    instanceStyling?.filter(isImage360AssetStylingGroup).map((group) => {
      return { assetIds: group.assetIds, style: group.style.image360 };
    }) ?? EMPTY_ARRAY;

  const styledImage360CollectionOptions: StyledImage360CollectionAddOptions[] =
    image360CollectionAddOptions.map((collectionAddOptions) => {
      return {
        addOptions: collectionAddOptions,
        styleGroups: image360StyledGroups
      };
    });

  useEffect(() => {
    revealHandler.current.sync(
      ([] as StyledAddModelOptions[])
        .concat(styledCadModelOptions)
        .concat(styledPointCloudModelOptions)
        .concat(styledImage360CollectionOptions)
    );
  }, [styledCadModelOptions, styledPointCloudModelOptions, styledImage360CollectionOptions]);

  return <></>;
};

async function getTypedModels(
  resources: AddResourceOptions[],
  viewer: Cognite3DViewer,
  onLoadFail?: (resource: AddResourceOptions, error: any) => void
): Promise<TypedReveal3DModel[]> {
  const errorFunction = onLoadFail ?? defaultLoadFailHandler;

  const modelTypePromises = resources
    .filter(
      (resource): resource is AddReveal3DModelOptions =>
        (resource as AddReveal3DModelOptions).modelId !== undefined &&
        (resource as AddReveal3DModelOptions).revisionId !== undefined
    )
    .map(async (addModelOptions) => {
      const type = await viewer
        .determineModelType(
          (addModelOptions.localPath as unknown as number) ?? addModelOptions.modelId,
          addModelOptions.revisionId
        )
        .catch((error) => {
          errorFunction(addModelOptions, error);
          return '';
        });
      const typedModel = { ...addModelOptions, type };
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
