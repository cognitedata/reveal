/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext, useState, useEffect, useMemo } from 'react';
import { NodeAppearance, type Cognite3DViewer, PointCloudAppearance, CogniteCadModel, CognitePointCloudModel, Image360Collection } from '@cognite/reveal';
import { ModelsLoadingStateContext } from './ModelsLoadingContext';
import { CadModelContainer, CadModelStyling } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer, PointCloudModelStyling } from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useReveal } from '../RevealContainer/RevealContext';
import {
  type AddReveal3DModelOptions,
  type AddImageCollection360Options,
  type TypedReveal3DModel,
  type AddResourceOptions
} from './types';
import { CogniteExternalId } from '@cognite/sdk';
import { useSDK } from '../RevealContainer/SDKProvider';
import { FdmAssetMappingsConfig, useFdmAssetMappings } from '../../hooks/useFdmAssetMappings';


export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: CogniteExternalId[];
  style: { cad?: NodeAppearance; pointcloud?: PointCloudAppearance };
}

export type Reveal3DResourcesStyling = {
  defaultStyle?: { cad?: NodeAppearance, pointcloud?: PointCloudAppearance }
  groups?: FdmAssetStylingGroup[],
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  styling?: Reveal3DResourcesStyling;
};

export const Reveal3DResources = ({ resources, styling }: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);
  const [reveal3DModelsStyling, setReveal3DModelsStyling] = useState<(PointCloudModelStyling | CadModelStyling)[]>([]);

  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  const stylingExternalIds = useMemo(() => styling?.groups?.flatMap((group) => group.fdmAssetExternalIds) ?? [], [styling]);
  const fdmAssetMappingSource: FdmAssetMappingsConfig = {
    source: {
      space: 'fdm-3d-test-savelii',
      version: '1',
      type: 'view',
      externalId: 'CDF_3D_Connection_Data',
    },
    assetFdmSpace: 'bark-corporation'
  };
    
  const mappings = useFdmAssetMappings(stylingExternalIds, fdmAssetMappingSource);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
  }, [resources, viewer]);
  
  
  useEffect(() => {
    if (styling === undefined || reveal3DModels === undefined) return;  

    const modelsStyling = reveal3DModels.map((model) => {
      let modelStyling: PointCloudModelStyling | CadModelStyling;
      switch (model.type) {
        case 'cad':
          modelStyling = {
            defaultStyle: styling.defaultStyle?.cad,
          };
          break;
        case 'pointcloud':
          modelStyling = {
            defaultStyle: styling.defaultStyle?.pointcloud,
          };
          break;
        default:
          modelStyling = {};
          console.warn(`Unknown model type: ${model.type}`);
          break;
      }

      return modelStyling;
    });

    mappings.then((modelMappings) => {
      const newModelsStyling = modelsStyling.map((modelStyling, index) => {
        const model = reveal3DModels[index];
        if (model.type === 'cad') {
          const modelNodeMappings = modelMappings.find((mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId);
          const nodeStyling = styling?.groups?.find((group) => 
            group.fdmAssetExternalIds.filter((externalId) =>
              modelNodeMappings?.mappings.some((modelNodeMapping) =>
                modelNodeMapping.externalId === externalId))
            .length > 0
          );

          if (modelNodeMappings && styling?.groups) {
            (modelStyling as CadModelStyling).groups = [...((modelStyling as CadModelStyling)?.groups ?? []), {style: nodeStyling?.style?.cad!, nodeIds: modelNodeMappings.mappings.map((mapping) => mapping.nodeId)}]
          }

          return modelStyling;
        } else if (model.type === 'pointcloud') {
          return modelStyling;
        }

        return modelStyling;
      });

      setReveal3DModelsStyling(newModelsStyling);
    });

  }, [mappings, styling, reveal3DModels]);

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
        .map((modelData, index) => ({...modelData, styling: reveal3DModelsStyling[index] as CadModelStyling}))
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
        .map((modelData, index) => ({...modelData, styling: reveal3DModelsStyling[index] as PointCloudModelStyling}))
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
