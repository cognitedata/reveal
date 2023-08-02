/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, useMemo } from 'react';
import { type FdmAssetMappingsConfig } from './types';
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

    const flattenedMappings = mappings?.pages.flatMap((page) => page.items);

    const internalModelsStyling = models.map((model) => {
      let modelStyling: PointCloudModelStyling | CadModelStyling;

      switch (model.type) {
        case 'cad': {
          const modelNodeMappings = flattenedMappings
            ?.filter(
              (mapping) =>
                mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
            )
            .reduce(
              (acc, mapping) => {
                // reduce is added to avoid duplicate models from several pages.
                acc.mappings = acc.mappings.concat(mapping.mappings);
                return acc;
              },
              { modelId: model.modelId, revisionId: model.revisionId, mappings: [] }
            );

          const newStylingGroups: NodeStylingGroup[] | undefined =
            styling.groups !== null ? [] : undefined;

          styling.groups?.forEach((group) => {
            const connectedExternalIds = group.fdmAssetExternalIds.filter(
              (externalId) =>
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

    return internalModelsStyling;
  }, [mappings, styling, models, mappings]);

  return modelsStyling;
};
