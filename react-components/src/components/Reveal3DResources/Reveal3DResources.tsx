/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext, useState, useEffect } from 'react';
import { type NodeAppearance, type Cognite3DViewer, type PointerEventData } from '@cognite/reveal';
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
  type AddResourceOptions,
  type NodeDataResult
} from './types';
import { queryMappedData } from './queryMappedData';
import { useFdmSdk, useSDK } from '../RevealContainer/SDKProvider';
import { useCalculateModelsStyling } from '../../hooks/useCalculateModelsStyling';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';

export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: DmsUniqueIdentifier[];
  style: { cad: NodeAppearance };
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  instanceStyling?: FdmAssetStylingGroup[];
  onNodeClick?: (node: Promise<NodeDataResult | undefined>) => void;
};

export const Reveal3DResources = ({
  resources,
  instanceStyling,
  onNodeClick
}: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);

  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const viewer = useReveal();
  const fdmSdk = useFdmSdk();
  const client = useSDK();
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
  }, [resources, viewer]);

  const reveal3DModelsStyling = useCalculateModelsStyling(reveal3DModels, instanceStyling ?? []);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      if (onNodeClick === undefined) return;
      const data = queryMappedData(viewer, client, fdmSdk, event);
      onNodeClick(data);
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer, client, fdmSdk, onNodeClick]);

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
