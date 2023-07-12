/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext, useState, useEffect, useMemo } from 'react';
import {
  type NodeAppearance,
  type Cognite3DViewer,
  type PointCloudAppearance
} from '@cognite/reveal';
import { ModelsLoadingStateContext } from './ModelsLoadingContext';
import {
  CadModelContainer,
  type CadModelStyling,
  type NodeStylingGroup
} from '../CadModelContainer/CadModelContainer';
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
import { type FdmAssetMappingsConfig, useFdmAssetMappings } from '../../hooks/useFdmAssetMappings';

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
  styling?: Reveal3DResourcesStyling;
};

export const Reveal3DResources = ({ resources, styling }: Reveal3DResourcesProps): ReactElement => {
  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);
  const [reveal3DModelsStyling, setReveal3DModelsStyling] = useState<
    Array<PointCloudModelStyling | CadModelStyling>
  >([]);

  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const viewer = useReveal();
  const numModelsLoaded = useRef(0);

  const stylingExternalIds = useMemo(
    () => styling?.groups?.flatMap((group) => group.fdmAssetExternalIds) ?? [],
    [styling]
  );
  const fdmAssetMappingSource: FdmAssetMappingsConfig = {
    source: {
      space: 'fdm-3d-test-savelii',
      version: '1',
      type: 'view',
      externalId: 'CDF_3D_Connection_Data'
    },
    assetFdmSpace: 'bark-corporation'
  };

  const { data: mappings } = useFdmAssetMappings(stylingExternalIds, fdmAssetMappingSource);

  useEffect(() => {
    getTypedModels(resources, viewer).then(setReveal3DModels).catch(console.error);
  }, [resources, viewer]);

  useEffect(() => {
    if (styling === undefined || reveal3DModels === undefined) return;

    const modelsStyling = reveal3DModels.map((model) => {
      let modelStyling: PointCloudModelStyling | CadModelStyling;

      switch (model.type) {
        case 'cad': {
          const modelNodeMappings = mappings?.find(
            (mapping) =>
              mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
          );

          const newStylingGroups: NodeStylingGroup[] | undefined =
            styling.groups !== null ? [] : undefined;

          styling.groups?.forEach((group) => {
            const connectedExternalIds = group.fdmAssetExternalIds.filter((externalId) =>
              modelNodeMappings?.mappings.some(
                (modelNodeMapping) => modelNodeMapping.externalId === externalId
              )
            );

            const newGroup: NodeStylingGroup = {
              style: group.style.cad,
              nodeIds: connectedExternalIds.map((externalId) => {
                const mapping = modelNodeMappings?.mappings.find(
                  (mapping) => mapping.externalId === externalId
                );
                return mapping?.nodeId ?? -1;
              })
            };

            if (connectedExternalIds.length > 0) newStylingGroups?.push(newGroup);
          });

          modelStyling = {
            defaultStyle: styling.defaultStyle?.cad,
            groups: newStylingGroups
          };
          break;
        }
        case 'pointcloud': {
          modelStyling = {
            defaultStyle: styling.defaultStyle?.pointcloud
          };
          break;
        }
        default: {
          modelStyling = {};
          console.warn(`Unknown model type: ${model.type}`);
          break;
        }
      }
      return modelStyling;
    });

    setReveal3DModelsStyling(modelsStyling);
  }, [mappings, styling, reveal3DModels, mappings]);

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
