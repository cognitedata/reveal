/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, useMemo } from 'react';
import { type ThreeDModelMappings, type FdmAssetMappingsConfig } from './types';
import { type Reveal3DResourcesStyling } from '../components/Reveal3DResources/Reveal3DResources';
import { type TypedReveal3DModel } from '../components/Reveal3DResources/types';
import { useFdmAssetMappings } from './useFdmAssetMappings';
import { type PointCloudModelStyling } from '../components/PointCloudContainer/PointCloudContainer';
import {
  type CadModelStyling,
  type NodeStylingGroup
} from '../components/CadModelContainer/CadModelContainer';

/**
 * Calculates the styling for the models based on the styling configuration and the mappings.
 * @param models Models to calculate styling for.
 * @param styling Styling configuration.
 * @param fdmAssetMappingConfig Configuration for the FDM asset mappings.
 * @returns
 */
export const useCalculateModelsStyling = (
  models?: TypedReveal3DModel[],
  styling?: Reveal3DResourcesStyling,
  fdmAssetMappingConfig?: FdmAssetMappingsConfig
): Array<PointCloudModelStyling | CadModelStyling> => {
  const stylingExternalIds = useMemo(
    () => styling?.groups?.flatMap((group) => group.fdmAssetExternalIds) ?? [],
    [styling]
  );

  const {
    data: mappings,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useFdmAssetMappings(stylingExternalIds, fdmAssetMappingConfig);

  useEffect(() => {
    if (hasNextPage !== undefined && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const modelsStyling = useMemo(() => {
    if (styling === undefined || models === undefined) return [];

    const allPagesMappings = mappings?.pages.flatMap((page) => page.items);

    const internalModelsStyling = models.map((model) => {
      let modelStyling: PointCloudModelStyling | CadModelStyling;

      switch (model.type) {
        case 'cad': {
          modelStyling = calculateCadModelStyling(styling, allPagesMappings, model);
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

    return internalModelsStyling;
  }, [mappings, styling, models, mappings]);

  return modelsStyling;
};

function getModelMappings(
  mappings: ThreeDModelMappings[] | undefined,
  model: TypedReveal3DModel
): ThreeDModelMappings | undefined {
  return mappings
    ?.filter(
      (mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
    )
    .reduce(
      (acc, mapping) => {
        // reduce is added to avoid duplicate models from several pages.
        acc.mappings = acc.mappings.concat(mapping.mappings);
        return acc;
      },
      { modelId: model.modelId, revisionId: model.revisionId, mappings: [] }
    );
}

function calculateCadModelStyling(
  styling: Reveal3DResourcesStyling,
  mappings: ThreeDModelMappings[] | undefined,
  model: TypedReveal3DModel
): CadModelStyling {
  const modelMappings = getModelMappings(mappings, model);

  const resourcesStylingGroups = styling?.groups;
  const modelStylingGroups: NodeStylingGroup[] | undefined =
    resourcesStylingGroups !== null ? [] : undefined;

  resourcesStylingGroups?.forEach((group) => {
    const modelMappedNodeIds = group.fdmAssetExternalIds
      .map((externalId) => {
        const mapping = modelMappings?.mappings.find(
          (mapping) => mapping.externalId === externalId
        );

        return mapping?.nodeId ?? -1;
      })
      .filter((nodeId) => nodeId !== -1);

    const newGroup: NodeStylingGroup = {
      style: group.style.cad,
      nodeIds: modelMappedNodeIds
    };

    if (modelMappedNodeIds.length > 0) modelStylingGroups?.push(newGroup);
  });

  return {
    defaultStyle: styling.defaultStyle?.cad,
    groups: modelStylingGroups
  };
}
