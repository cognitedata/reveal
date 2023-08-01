import { useQuery } from "@tanstack/react-query";
import { FdmAssetMappingsConfig } from "..";
import { useFdmSdk } from "../components/RevealContainer/SDKProvider";

export const useMappedEquipmentBy3DModelsList = (Default3DFdmConfig: FdmAssetMappingsConfig, modelsList: { modelId: number, revisionId: number }[] = []) => {
    const fdmClient = useFdmSdk();

    return useQuery(['reveal', 'react-components', ...modelsList], async () => {
        const filter = {
            in: {
                property: ['edge', 'endNode'],
                values: modelsList.map(({ modelId }) => ({
                    space: Default3DFdmConfig.global3dSpace,
                    externalId: 'model_3d_' + modelId,
                }))
            }
        };

        let mappings = await fdmClient.filterInstances(filter, 'edge', Default3DFdmConfig.source);

        while (mappings.nextCursor) {
            const nextMappings = await fdmClient.filterInstances(filter, 'edge', Default3DFdmConfig.source, mappings.nextCursor);

            mappings = {
                edges: [...mappings.edges, ...nextMappings.edges],
                nextCursor: nextMappings.nextCursor
            }
        }

        return mappings.edges.map((edge) => edge.startNode.externalId);
    }, { staleTime: Infinity });
};
