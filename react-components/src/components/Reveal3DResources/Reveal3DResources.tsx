/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useState, useEffect } from 'react';
import { type Cognite3DViewer } from '@cognite/reveal';
import { CadModelContainer, type CadModelStyling } from '../CadModelContainer/CadModelContainer';
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
  type DefaultResourceStyling
} from './types';
import { useCalculateModelsStyling } from '../../hooks/useCalculateModelsStyling';
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
    getTypedModels(resources, viewer)
      .then((models) => {
        models.forEach((model) => {
          setDefaultResourceStyling(model, defaultResourceStyling);
        });
        return models;
      })
      .then(setReveal3DModels)
      .catch(console.error);
  }, [resources, viewer]);

  const reveal3DModelsStyling = useCalculateModelsStyling(reveal3DModels, instanceStyling ?? []);
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
      {reveal3DModels
        .map((modelData, index) => ({
          ...modelData,
          styling: reveal3DModelsStyling[index] as CadModelStyling
        }))
        .filter(({ type }) => type === 'cad')
        .map((modelData, index) => {
          return (
            <CadModelContainer
              key={`${modelData.modelId}/${modelData.revisionId}/${index}`}
              addModelOptions={modelData}
              styling={modelData.styling}
              transform={modelData.transform}
              onLoad={onModelLoaded}
            />
          );
        })}
      {reveal3DModels
        .map((modelData, index) => ({
          ...modelData,
          styling: reveal3DModelsStyling[index] as PointCloudModelStyling
        }))
        .filter(({ type }) => type === 'pointcloud')
        .map((modelData, index) => {
          return (
            <PointCloudContainer
              key={`${modelData.modelId}/${modelData.revisionId}/${index}`}
              addModelOptions={modelData}
              styling={modelData.styling}
              transform={modelData.transform}
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

function setDefaultResourceStyling(
  model: TypedReveal3DModel,
  defaultResourceStyling?: DefaultResourceStyling
): void {
  if (model.styling !== undefined || defaultResourceStyling === undefined) {
    return;
  }

  if (model.type === 'cad') {
    model.styling = defaultResourceStyling.cad;
  } else if (model.type === 'pointcloud') {
    model.styling = defaultResourceStyling.pointcloud;
  }
}
