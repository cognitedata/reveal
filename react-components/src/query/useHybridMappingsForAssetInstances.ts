import { AddModelOptions } from "@cognite/reveal";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DmsUniqueIdentifier } from "../data-providers";
import { ThreeDModelFdmMappings } from "../hooks";
import { queryKeys } from "../utilities/queryKeys";
import { UseHybridMappingsForAssetInstancesContext } from "./useHybridMappingsForAssetInstances.context";
import { useContext } from "react";

export const useHybridMappingsForAssetInstances = (
  models: AddModelOptions[],
  assetInstanceIds: DmsUniqueIdentifier[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const {
    useClassicCadAssetMappingCache,
  } = useContext(UseHybridMappingsForAssetInstancesContext);
  const hybridCache = useClassicCadAssetMappingCache();

  return useQuery({
    queryKey: queryKeys.hybridDmAssetMappingsForInstances(
      models.map((model) => `${model.modelId}-${model.revisionId}`),
      assetInstanceIds
    ),
    queryFn: async() => {
      const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
        if (assetInstanceIds.length === 0) {
          return { mappings: { items: [] }, model };
        }

        const mappings = await hybridCache.getNodesForInstanceIds(model.modelId, model.revisionId, assetInstanceIds);

        return { modelId: model.modelId, revisionId: model.revisionId, mappings };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      return currentPagesOfAssetMappings;
    },
    staleTime: Infinity
  });
};