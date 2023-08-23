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
import { useClickedNodeData } from '../..';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onNodeClick,
  onResourcesAdded
}: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);

  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
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
  const clickedNodeData = useClickedNodeData();

  useEffect(() => {
    if (clickedNodeData !== undefined) {
      onNodeClick?.(Promise.resolve(clickedNodeData));
    }
  }, [clickedNodeData, onNodeClick]);

  const image360CollectionAddOptions = resources.filter(
    (resource): resource is AddImageCollection360Options =>
      (resource as AddImageCollection360Options).siteId !== undefined
  );

  const onModelLoaded = (): void => {
    numModelsLoaded.current += 1;

    if (numModelsLoaded.current === resources.length && onResourcesAdded !== undefined) {
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
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        return (
          <Image360CollectionContainer
            key={`${addModelOption.siteId}`}
            siteId={addModelOption.siteId}
            onLoad={onModelLoaded}
          />
        );
      })}
    </>
  );
};

async function getTypedModels(
  resources: AddResourceOptions[],
  viewer: Cognite3DViewer
): Promise<TypedReveal3DModel[]> {
  return await Promise.all(
    resources
      .filter(
        (resource): resource is AddReveal3DModelOptions =>
          (resource as AddReveal3DModelOptions).modelId !== undefined &&
          (resource as AddReveal3DModelOptions).revisionId !== undefined
      )
      .map(async (addModelOptions) => {
        const type = await viewer.determineModelType(
          addModelOptions.modelId,
          addModelOptions.revisionId
        );
        if (type === '') {
          throw new Error(
            `Could not determine model type for modelId: ${addModelOptions.modelId} and revisionId: ${addModelOptions.revisionId}`
          );
        }
        const typedModel: TypedReveal3DModel = { ...addModelOptions, type };
        return typedModel;
      })
  );
}
