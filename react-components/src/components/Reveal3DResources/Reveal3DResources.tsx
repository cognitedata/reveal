/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useState, useEffect, useMemo } from 'react';
import { type Cognite3DViewer } from '@cognite/reveal';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { type CadModelStyling } from '../CadModelContainer/useApplyCadModelStyling';
import {
  PointCloudContainer,
  type PointCloudModelStyling
} from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useReveal } from '../RevealContainer/RevealContext';
import {
  type AddReveal3DModelOptions,
  type AddImageCollection360Options,
  type TypedReveal3DModel,
  type AddResourceOptions,
  type Reveal3DResourcesProps,
  type CadModelOptions,
  type PointCloudModelOptions
} from './types';
import { useCalculateCadStyling } from '../../hooks/useCalculateModelsStyling';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);

  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    void getTypedModels(resources, viewer, onResourceLoadError).then(setReveal3DModels);
  }, [resources, viewer]);

  const cadModelOptions = useMemo(
    () => reveal3DModels.filter((model): model is CadModelOptions => model.type === 'cad'),
    [reveal3DModels]
  );

  const pointCloudModelOptions = useMemo(
    () =>
      reveal3DModels.filter(
        (model): model is PointCloudModelOptions => model.type === 'pointcloud'
      ),
    [reveal3DModels]
  );

  const styledCadModelOptions = useCalculateCadStyling(
    cadModelOptions,
    instanceStyling ?? [],
    defaultResourceStyling
  );

  const image360CollectionAddOptions = resources.filter(
    (resource): resource is AddImageCollection360Options =>
      (resource as AddImageCollection360Options).siteId !== undefined
  );

  const onModelLoaded = (): void => {
    onModelFailOrSucceed();
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
      {pointCloudModelOptions.map((pointCloudModelOptions, index) => {
        const { modelId, revisionId, transform, styling } = pointCloudModelOptions;
        const defaultStyle = styling?.default ?? defaultResourceStyling?.pointcloud?.default;
        const pcStyling: PointCloudModelStyling = {
          defaultStyle
        };
        return (
          <PointCloudContainer
            key={`${modelId}/${revisionId}/${index}`}
            addModelOptions={pointCloudModelOptions}
            styling={pcStyling}
            transform={transform}
            onLoad={onModelLoaded}
            onLoadError={onModelLoadedError}
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        return (
          <Image360CollectionContainer
            key={`${addModelOption.siteId}`}
            siteId={addModelOption.siteId}
            onLoad={onModelLoaded}
            onLoadError={onModelLoadedError}
          />
        );
      })}
    </>
  );
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
        .determineModelType(addModelOptions.modelId, addModelOptions.revisionId)
        .catch((error) => {
          errorFunction(addModelOptions, error);
          return '';
        });
      const typedModel = { ...addModelOptions, type };
      return typedModel;
    });

  const resourceLoadResults = await Promise.all(modelTypePromises);
  const successfullyLoadedResources = resourceLoadResults.filter(
    (p): p is TypedReveal3DModel => p.type !== ''
  );

  return successfullyLoadedResources;
}

function defaultLoadFailHandler(resource: AddResourceOptions, error: any): void {
  console.warn(`Could not load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`);
}
