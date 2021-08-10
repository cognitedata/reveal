import { createSelector } from '@reduxjs/toolkit';
import { InternalId, Asset, FileInfo } from '@cognite/sdk';
import { RootState } from 'store';
import { ResourceType } from 'modules/sdk-builder/types';
import { ResourceSelection, ResourceObjectType, Workflow } from 'modules/types';

import {
  countSelector as countFileSelector,
  listSelector as listFileSelector,
  searchSelector as searchFileSelector,
} from '../files';
import {
  countSelector as countAssetSelector,
  listSelector as listAssetSelector,
  searchSelector as searchAssetSelector,
} from '../assets';

export const getActiveWorkflowId = createSelector(
  (state: RootState) => state.workflows.active,
  (workflowId: number) => workflowId
);

export const getActiveWorkflowSteps = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) => {
    const activeWorkflow = items[workflowId];
    return activeWorkflow?.steps;
  }
);

export const getActiveWorkflowItems = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) => {
    return {
      diagrams: items[workflowId]?.diagrams ?? undefined,
      resources: items[workflowId]?.resources ?? undefined,
    };
  }
);

export const getActiveWorkflowDiagrams = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) => {
    if (workflowId) return items[workflowId].diagrams;
    return undefined;
  }
);

export const getActiveWorkflowResources = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) => {
    if (workflowId) return items[workflowId].resources;
    return undefined;
  }
);

export const getActiveWorkflowResourcesByResourceType = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) =>
    (resourceType: ResourceType) => {
      if (workflowId) {
        const { resources } = items[workflowId];
        const resourceOfType = resources?.find(
          (resource: ResourceSelection) => resource.type === resourceType
        );
        return resourceOfType;
      }
      return undefined;
    }
);

export const getCountsSelector = createSelector(
  countAssetSelector,
  countFileSelector,
  (assetCounter, fileCounter) => (type: ResourceType) => {
    switch (type) {
      case 'files':
        return fileCounter;
      case 'assets':
        return assetCounter;
      default:
        throw new Error(`type '${type}' not supported`);
    }
  }
);

export const getItemsSearchSelector = createSelector(
  searchFileSelector,
  searchAssetSelector,
  (fileSearch, assetSearch) => (type: ResourceType) => {
    switch (type) {
      case 'assets':
        return assetSearch;
      case 'files':
        return fileSearch;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

export const getItemListSelector = createSelector(
  listFileSelector,
  listAssetSelector,
  (fileList, assetList) => (type: ResourceType) => {
    switch (type) {
      case 'assets':
        return assetList;
      case 'files':
        return fileList;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

// ----------------------------------------------------
// --------------------- FACTORIES --------------------
// ----------------------------------------------------

/**
 * Returns the number of diagrams that were successfully downloaded for the particular workflow.
 * @param workflowId - id of the workflow containing the downloaded diagrams
 * @param all - optional parameter for filter
 */
export const countOfLoadedDiagramsForWorkflowSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.diagrams,
    (state: RootState) => state.files.list,
    (state: RootState) => state.files.items.list,
    (
      diagrams: ResourceSelection | undefined,
      listItems,
      retrieveItems
    ): number => {
      if (!diagrams) return 0;
      const { endpoint, filter } = diagrams;
      if (endpoint === 'retrieve')
        return retrieveItemsLength(retrieveItems, filter);
      if (endpoint === 'list') return listItemsLength(listItems, filter, all);
      return 0;
    }
  );

/**
 * Returns the number of resources of all types that were successfully downloaded for the particular workflow.
 * @param workflowId - id of the workflow containing the downloaded diagrams
 * @param all - optional parameter for filter
 */
export const countOfLoadedResourcesForWorkflowSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.resources ?? [],
    (state: RootState) => state,
    (resources: ResourceSelection[], state: RootState) => {
      if (!resources) return undefined;
      const resourcesLengths: { [key: string]: number } = {};
      resources.forEach((resource: ResourceSelection) => {
        const { endpoint, filter, type } = resource;
        resourcesLengths[type] = 0;
        if (endpoint === 'retrieve') {
          const retrieveItems = state[type].items.list;
          resourcesLengths[type] = retrieveItemsLength(retrieveItems, filter);
        }
        if (endpoint === 'list') {
          const listItems = state[type].list;
          resourcesLengths[type] = listItemsLength(listItems, filter, all);
        }
      });
      return resourcesLengths;
    }
  );

/**
 * Returns the total number of diagrams that the particular workflow contains.
 * @param workflowId
 */
export const countOfTotalDiagramsForWorkflowSelector = (workflowId: number) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.diagrams,
    getCountsSelector,
    (diagrams: ResourceSelection | undefined, countSelector) => {
      if (!diagrams) return undefined;
      const { filter, endpoint } = diagrams;
      if (endpoint === 'list') {
        const fixedFilter = filter.filter ?? filter;
        return countSelector('files')(fixedFilter)?.count ?? 0;
      }
      if (endpoint === 'retrieve') return filter?.length ?? 0;
      return undefined;
    }
  );

/**
 * Returns the total number of resources of all types that the particular workflow contains.
 * @param workflowId
 */
export const countOfTotalResourcesForWorkflowSelector = (workflowId: number) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.resources,
    getCountsSelector,
    (resources: ResourceSelection[] | undefined, countSelector) => {
      if (!resources) return undefined;
      const resourcesCounts: { [key in ResourceType]?: number } = {};
      resources.forEach((resource: ResourceSelection) => {
        const { filter, endpoint, type } = resource;
        resourcesCounts[type] = undefined;
        if (endpoint === 'list') {
          const fixedFilter = filter.filter ?? filter;
          resourcesCounts[type] = countSelector(type)(fixedFilter)?.count ?? 0;
        }
        if (endpoint === 'retrieve')
          resourcesCounts[type] = filter?.length ?? 0;
      });
      return resourcesCounts;
    }
  );

/**
 * Returns diagrams for the specific workflow.
 * @param workflowId
 * @param all
 */
export const workflowDiagramsSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.diagrams,
    (state: RootState) => state.files.list,
    (state: RootState) => state.files.items.list,
    (
      diagrams: ResourceSelection | undefined,
      diagramsList: any,
      diagramsItems: any
    ): FileInfo[] => {
      if (!diagrams) return [];
      const { endpoint, filter } = diagrams;
      const key = JSON.stringify({ ...filter, all });
      if (endpoint === 'list')
        return listItems(diagramsList, diagramsItems, key);
      if (endpoint === 'retrieve') return retrieveItems(diagramsItems, filter);
      return [];
    }
  );

/**
 * Returns one resource type for the specific workflow.
 * @param workflowId
 * @param resourceType
 * @param all
 */
export const workflowResourceSelector = (
  workflowId: number,
  resourceType: ResourceType,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) =>
      state.workflows.items[workflowId]?.resources?.find(
        (resource: ResourceSelection) => resource.type === resourceType
      ),
    (state: RootState) => state[resourceType].list,
    (state: RootState) => state[resourceType].items.list,
    (
      resource: ResourceSelection | undefined,
      resourcesList: any,
      resourcesItems: any
    ): Asset[] | FileInfo[] | undefined => {
      if (!resource) return undefined;
      const { endpoint, filter } = resource;
      const key = JSON.stringify({ ...filter, all });
      if (endpoint === 'list')
        return listItems(resourcesList, resourcesItems, key);
      if (endpoint === 'retrieve') return retrieveItems(resourcesItems, filter);
      return [];
    }
  );

/**
 * Returns all resources for the specific workflow.
 * @param workflowId
 */
export const workflowAllResourcesSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.resources,
    (state: RootState) => state,
    (
      resources: ResourceSelection[] | undefined,
      state: RootState
    ): ResourceObjectType => {
      const allResources: ResourceObjectType = {};
      if (!resources) return {};
      const resourceTypes =
        resources?.map((resource: ResourceSelection) => resource.type) ?? [];
      if (!resourceTypes.includes('files')) resourceTypes.push('files');
      // eslint-disable-next-line consistent-return
      resourceTypes.forEach((resourceType: ResourceType) => {
        const resource = resources.find(
          (r: ResourceSelection) => r.type === resourceType
        );
        if (!resource) return { [resourceType]: [] };
        const { endpoint, filter } = resource;
        const key = JSON.stringify({ ...filter, all });
        const resourcesList = state[resourceType].list;
        const resourcesItems = state[resourceType].items.list;
        if (endpoint === 'list')
          allResources[resourceType] = listItems(
            resourcesList,
            resourcesItems,
            key
          );
        if (endpoint === 'retrieve')
          allResources[resourceType] = retrieveItems(resourcesItems, filter);
      });
      return allResources;
    }
  );

/**
 * Returns an array of all resource types (+files for diagrams) which are used in the particular workflow.
 * @param workflowId
 */
export const workflowResourceTypesSelector = (workflowId: number) =>
  createSelector(
    (state: RootState) => {
      const resourceTypes =
        state.workflows.items[workflowId]?.resources?.map(
          (resource: ResourceSelection) => resource.type
        ) ?? [];
      if (!resourceTypes.includes('files')) {
        return [...resourceTypes, 'files'] as ResourceType[];
      }
      return resourceTypes;
    },
    (resourceTypes: ResourceType[]) => resourceTypes
  );

/**
 *
 * @param workflowId
 * @param all
 */
export const workflowDiagramStatusSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.diagrams,
    (state: RootState) => state.files.list,
    (state: RootState) => state.files.items.retrieve.byId,
    (
      diagrams: ResourceSelection | undefined,
      diagramsList,
      diagramsRetrieve
    ) => {
      const defaultStatus = { done: false, loading: false, error: false };
      if (!diagrams) {
        return defaultStatus;
      }
      const { endpoint, filter } = diagrams;
      if (endpoint === 'list')
        return listItemsStatus(diagramsList, filter, all);
      if (endpoint === 'retrieve')
        return retrieveItemsStatus(diagramsRetrieve, filter);
      return defaultStatus;
    }
  );

/**
 * TODO
 * @param workflowId
 * @param all
 * @param resourceType
 */
export const workflowResourceStatusSelector = (
  workflowId: number,
  resourceType: ResourceType,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.resources,
    (state: RootState) => state,
    (resources: ResourceSelection[] | undefined, state: RootState) => {
      const defaultStatus = { done: false, loading: false, error: false };
      if (!resources) {
        return defaultStatus;
      }
      const resource = resources.find(
        (r: ResourceSelection) => r.type === resourceType
      );
      if (!resource) return defaultStatus;
      const { endpoint, filter } = resource;
      if (endpoint === 'list')
        return listItemsStatus(state[resourceType].list, filter, all);
      if (endpoint === 'retrieve')
        return retrieveItemsStatus(
          state[resourceType].items.retrieve.byId,
          filter
        );
      return defaultStatus;
    }
  );

/**
 *
 * @param workflowId
 * @param all
 */
export const workflowAllResourcesStatusSelector = (
  workflowId: number,
  all: boolean = false
) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId]?.resources,
    (state: RootState) => state,
    (resources: ResourceSelection[] | undefined, state: RootState) => {
      const defaultStatus = { done: false, loading: false, error: false };
      if (!resources) return defaultStatus;
      const resourceStatuses = resources.map((resource: ResourceSelection) => {
        const { endpoint, filter, type } = resource;
        if (endpoint === 'list')
          return listItemsStatus(state[type].list, filter, all);
        if (endpoint === 'retrieve')
          return retrieveItemsStatus(state[type].items.retrieve.byId, filter);
        return defaultStatus;
      });
      return {
        done:
          resourceStatuses.filter(
            (status: { done: boolean; loading: boolean; error: boolean }) =>
              status.done
          ).length > 0,
        loading:
          resourceStatuses.filter(
            (status: { done: boolean; loading: boolean; error: boolean }) =>
              status.loading
          ).length > 0,
        error:
          resourceStatuses.filter(
            (status: { done: boolean; loading: boolean; error: boolean }) =>
              status.error
          ).length > 0,
      };
    }
  );

/// -------------------------------------------
/// ------------------- UTILS -----------------
/// -------------------------------------------

/**
 *
 * @param itemsList
 * @param itemsData
 * @param filter
 * @param all
 */
const listItems = (itemsList: any, itemsData: any, key: string) => {
  const partitions = itemsList[key];
  const partitionedIds = Object.values(partitions ?? {});
  const ids = partitionedIds.reduce((idsArray: number[], partition: any) => {
    const idsValues: number[] = Object.values(partition?.ids ?? []) ?? [];
    return idsArray.concat(idsValues ?? []);
  }, [] as number[]);
  const mappedItems = ids.map((id: number) => itemsData[id]).filter(Boolean);
  return mappedItems;
};

/**
 *
 * @param itemsData
 * @param filter
 */
const retrieveItems = (itemsData: any, filter: any) => {
  const ids = filter
    .filter((item: any) => Boolean(item.id) === true)
    .map((item: any) => item.id ?? item.externalId);
  const mappedItems = ids.map((id: number) => itemsData[id]).filter(Boolean);
  return mappedItems;
};

/**
 *
 * @param items
 * @param filter
 * @param all
 */
const listItemsLength = (
  items: any,
  filter?: any,
  all: boolean = false
): number => {
  const key = JSON.stringify({ ...filter, all });
  const request = items[key] || {};
  const allIds = Object.values(request).map(
    (partition: any) => (partition?.ids ?? []).length
  );
  const lengthOfAllIds: number = allIds.reduce(
    (sum: number, idsLength: number) => sum + idsLength,
    0
  );
  return lengthOfAllIds;
};

/**
 *
 * @param items
 * @param filter
 */
const retrieveItemsLength = (items: any, filter?: any): number => {
  return (filter as InternalId[])
    .map((i) => i.id)
    .filter(Boolean)
    .filter((id: number) => items[id]).length;
};

/**
 *
 * @param items
 * @param filter
 * @param all
 */
const listItemsStatus = (items: any, filter: any, all: boolean = false) => {
  const key = JSON.stringify({ ...filter, all });
  const partitions = Object.values(items[key] || {});
  const done: boolean =
    partitions.length > 0
      ? partitions.reduce(
          (accl: boolean, p: any) => accl && p?.status === 'success',
          true
        )
      : false;
  const loading: boolean = partitions.reduce(
    (accl: boolean, p: any) => accl || p?.status === 'pending',
    false
  );
  const error: boolean = partitions.reduce(
    (accl: boolean, p: any) => accl || p?.status === 'error',
    false
  );
  return { done, loading, error };
};

/**
 *
 * @param items
 * @param filter
 */
const retrieveItemsStatus = (items: any, filter: any) => {
  const ids = Object.values(filter || {})
    .map((q: any) => q.id)
    .filter(Boolean);
  const done: boolean = ids.reduce(
    (accl, id) => accl && items[id]?.status === 'success',
    true
  );
  const loading: boolean = ids.reduce(
    (accl, id) => accl && items[id]?.status === 'pending',
    false
  );
  const error: boolean = ids.reduce(
    (accl, id) => accl || items[id]?.status === 'error',
    false
  );

  return { done, loading, error };
};
