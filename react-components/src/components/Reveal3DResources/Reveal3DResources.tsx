/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext, useState, useEffect } from 'react';
import { NodeAppearance, type Cognite3DViewer, PointCloudAppearance } from '@cognite/reveal';
import { ModelsLoadingStateContext } from './ModelsLoadingContext';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer } from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useReveal } from '../RevealContainer/RevealContext';
import {
  type AddReveal3DModelOptions,
  type AddImageCollection360Options,
  type TypedReveal3DModel,
  type AddResourceOptions
} from './types';
import { CogniteExternalId } from '@cognite/sdk';

export type AssetStylingGroup = {
  assetIds: CogniteExternalId[];
  style: { cad?: NodeAppearance; pointcloud?: PointCloudAppearance };
}

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  styling?: { groups?: AssetStylingGroup[], defaultStyle?: {cad?: NodeAppearance, pointcloud?: PointCloudAppearance } };
};

export const Reveal3DResources = ({ resources }: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);
  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
  }, [resources]);

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
        .filter(({ type }) => type === 'cad')
        .map((addModelOption, index) => {
          return (
            <CadModelContainer
              key={`${addModelOption.modelId}/${addModelOption.revisionId}/${index}`}
              addModelOptions={addModelOption}
              transform={addModelOption.transform}
              onLoad={onModelLoaded}
            />
          );
        })}
      {reveal3DModels
        .filter(({ type }) => type === 'pointcloud')
        .map((addModelOption, index) => {
          return (
            <PointCloudContainer
              key={`${addModelOption.modelId}/${addModelOption.revisionId}/${index}`}
              addModelOptions={addModelOption}
              transform={addModelOption.transform}
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
