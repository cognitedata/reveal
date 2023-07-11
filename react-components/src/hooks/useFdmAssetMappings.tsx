import React, { useEffect, useMemo, useState } from 'react';
import { CogniteExternalId } from '@cognite/sdk';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { Source } from '../utilities/FdmSdk';

export type FdmAssetMappingsConfig = {
    source: Source;
    assetFdmSpace: string;
}

export type ThreeDModelMappings = { modelId: number, revisionId: number, mappings: { nodeId: number, externalId: string }[] };

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (fdmAssetExternalIds: CogniteExternalId[], fdmConfig: FdmAssetMappingsConfig):
    Promise<ThreeDModelMappings []> => {
    const fdmSdk = useFdmSdk();

    if (!fdmSdk || fdmAssetExternalIds?.length === 0) {
        return new Promise(() => []);
    }

    const fdmAssetMappingFilter = {
        in: {
          property: ["edge", "startNode"],
            values: fdmAssetExternalIds.map((externalId) => ({ space: fdmConfig.assetFdmSpace, externalId }))
        }
    };
    
    const modelMappings = useMemo(async () => {
        const instances = await fdmSdk.filterInstances(fdmAssetMappingFilter, "edge", fdmConfig.source);

        const modelMappingsTemp: ThreeDModelMappings[] = [];

        instances.edges.forEach((instance) => {
            const mappingProperty = instance.properties[fdmConfig.source.space][`${fdmConfig.source.externalId}/${fdmConfig.source.version}`];

            const modelId = Number.parseInt(instance.endNode.externalId.slice(9));
            const revisionId = mappingProperty.RevisionId;

            const isAdded = modelMappingsTemp.some((mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId);

            if (!isAdded) {
                modelMappingsTemp.push({
                    modelId,
                    revisionId,
                    mappings: [{ nodeId: mappingProperty.NodeId, externalId: instance.startNode.externalId }]
                });
            } else {
                const modelMapping = modelMappingsTemp.find((mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId);

                modelMapping?.mappings.push({ nodeId: mappingProperty.NodeId, externalId: instance.startNode.externalId });
            }

        });

        return modelMappingsTemp;
        
    }, [fdmAssetExternalIds]);
  
    return modelMappings;

};