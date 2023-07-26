/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext, useState, useEffect } from 'react';
import {
  type NodeAppearance,
  type Cognite3DViewer,
  type PointCloudAppearance
} from '@cognite/reveal';
import { ModelsLoadingStateContext } from './ModelsLoadingContext';
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
  type AddResourceOptions
} from './types';
import { type CogniteExternalId } from '@cognite/sdk';
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { useCalculateModelsStyling } from '../../hooks/useCalculateModelsStyling';

export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: CogniteExternalId[];
  style: { cad?: NodeAppearance; pointcloud?: PointCloudAppearance };
};

export type Reveal3DResourcesStyling = {
  defaultStyle?: { cad?: NodeAppearance; pointcloud?: PointCloudAppearance };
  groups?: FdmAssetStylingGroup[];
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  fdmAssetMappingConfig: FdmAssetMappingsConfig;
  styling?: Reveal3DResourcesStyling;
};

export const Reveal3DResources = ({
  resources,
  styling,
  fdmAssetMappingConfig
}: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);
  const [reveal3DModelsStyling, setReveal3DModelsStyling] = useState<
    Array<PointCloudModelStyling | CadModelStyling>
  >([]);

  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
  }, [resources, viewer]);

  const modelsStyling = useCalculateModelsStyling(fdmAssetMappingConfig, reveal3DModels, styling);

  useEffect(() => {
    setReveal3DModelsStyling(modelsStyling);
  }, [modelsStyling]);

  const image360CollectionAddOptions = resources.filter(
    (resource): resource is AddImageCollection360Options =>
      (resource as AddImageCollection360Options).siteId !== undefined
  );

  const onModelLoaded = (): void => {
    numModelsLoaded.current += 1;

    if (numModelsLoaded.current === resources.length) {
      setModelsAdded(true);
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
        const typedModel: TypedReveal3DModel = { ...addModelOptions, type };
        return typedModel;
      })
  );
}
