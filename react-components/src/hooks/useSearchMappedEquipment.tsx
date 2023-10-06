import { CogniteClient } from "@cognite/sdk/dist/src";
import { useMemo } from "react";
import { EdgeItem, NodeItem, FdmSDK, Source, ViewItem } from "../utilities/FdmSDK";
import { useSDK } from "../components/RevealContainer/SDKProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { SYSTEM_3D_EDGE_SOURCE, SYSTEM_3D_NODE_TYPE } from "../utilities/globalDataModels";
import { AddModelOptions } from "@cognite/reveal";
import { last } from "lodash";

type SeachResultsWithView = { view: Source, instances: NodeItem[] };

export const useSearchMappedEquipmentFDM = (query: string, spacesToSearch: string[], limit?: number, userSdk?: CogniteClient) => {
    const sdk = useSDK(userSdk);
    
    const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

    const viewsToSearchPromise: Promise<Source[]> = useMemo(async () => {
        
        const viewsPromises = spacesToSearch.map(async (space, index) => {
            const isUnique = spacesToSearch.findIndex((spaceToSearch) => spaceToSearch === space) === index;

            if (!isUnique) {
                return [];
            }

            const viewsInSpace = await fdmSdk.listViews(space);

            const mapped3DViews = viewsInSpace.views.filter((view) => {
                const isImplementing3DEntity = (view.implements).some((view) => view.externalId === SYSTEM_3D_NODE_TYPE.externalId);

                return isImplementing3DEntity;
            });

            return convertViewItemsToSource(mapped3DViews);
        });

        const views = await Promise.all(viewsPromises);
        
        return views.flat();
    }, [spacesToSearch]);

    return useQuery(['search-mapped-equipment', query, viewsToSearchPromise], async () => {
        const viewsToSearch = await viewsToSearchPromise;

        const searchResults: SeachResultsWithView[] = [];
        
        for (const view of viewsToSearch) {
            const result = await fdmSdk.searchInstances(view, query, 'node', limit);

            searchResults.push({ view, instances: result.instances });
        }
        
        const filteredSearchResults = filterSearchResultsByMappedTo3D(fdmSdk, searchResults);

        return filteredSearchResults;
    }, { staleTime: Infinity });
}

export const useSearchMappedEquipmentAssetMappings = (query: string, models: AddModelOptions[], limit?: number, userSdk?: CogniteClient) => {
    const sdk = useSDK(userSdk);

    return useInfiniteQuery(['search-mapped-equipment-asset-mappings', query], async ({ pageParam = models.map((model) => ({cursor: 'start', model}))}) => {
        console.log('pageParam', pageParam);
        const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
            const nextCursors = pageParam as { cursor: string | 'start' | undefined, model: AddModelOptions }[];

            const nextCursor = nextCursors.find((nextCursor) => nextCursor.model.modelId === model.modelId && nextCursor.model.revisionId === model.revisionId)?.cursor;

            if (nextCursor === undefined) {
                return { mappings: { items: []}, model };
            }
            
            const mappings = await sdk.assetMappings3D.list(model.modelId, model.revisionId, { cursor: nextCursor === 'start' ? undefined : nextCursor, limit: 1000});
            
            return {mappings, model}
        })

        const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

        return currentPagesOfAssetMappings;

    }, {
        staleTime: Infinity,
        getNextPageParam: (lastPage) =>
            lastPage.map(({mappings, model}) => ({ cursor: mappings.nextCursor, model}))
    });

};

function convertViewItemsToSource(viewItems: ViewItem[]): Source[] {
    return viewItems.map((viewItem) => ({ space: viewItem.space, type: 'view', version: viewItem.version, externalId: viewItem.externalId }));
}

function createMappedEquipmentMap(mappedEdges: EdgeItem[]) {
    const mappedEquipmentMap: Record<string, boolean> = {}

    mappedEdges.forEach((edge) => {
        const { space, externalId } = edge.startNode;
        const key = `${space}/${externalId}`;

        mappedEquipmentMap[key] = true;
    });

    return mappedEquipmentMap;
}

function createIsMappedFilter(instances: NodeItem[]) {
    return {
        in: {
            property: ['edge', 'startNode'],
            values: instances.map((instance) => ({ space: instance.space, externalId: instance.externalId }))
        }
    };
}

async function filterSearchResultsByMappedTo3D(fdmSdk: FdmSDK, searchResults: SeachResultsWithView[]) {
    const filteredSearchResults: SeachResultsWithView[] = []; 

    for (const searchResult of searchResults) {
        if (searchResult.instances.length === 0) {
            continue;
        }

        const isMappedFilter = createIsMappedFilter(searchResult.instances);
        const mappedEdges = await fdmSdk.filterAllInstances(isMappedFilter, 'edge', SYSTEM_3D_EDGE_SOURCE);

        const mappedEquipmentMap = createMappedEquipmentMap(mappedEdges.instances);
        const filteredInstances = searchResult.instances.filter((instance) => {
            const key = `${instance.space}/${instance.externalId}`;
            return mappedEquipmentMap.hasOwnProperty(key);
        });

        filteredSearchResults.push({view: searchResult.view, instances: filteredInstances});
    }

    return filteredSearchResults;
}