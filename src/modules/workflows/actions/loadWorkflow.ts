import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  list as listFiles,
  count as countFiles,
  retrieveItemsById as retrieveFiles,
} from 'modules/files';
import {
  list as listAssets,
  listParallel as listAssetsParallel,
  count as countAssets,
  retrieveItemsById as retrieveAssets,
} from 'modules/assets';
import {
  workflowDiagramStatusSelector,
  workflowAllResourcesStatusSelector,
} from 'modules/workflows';
import { ResourceSelection, ResourceType } from 'modules/types';

/**
 * Loads everything related to this particular workflow.
 */
export const loadWorkflow = createAsyncThunk(
  'workflows/load',
  async (
    { workflowId }: { workflowId: number },
    { dispatch, getState }: { dispatch: any; getState: () => any }
  ) => {
    const state = getState();
    const diagramsStatus = workflowDiagramStatusSelector(
      workflowId,
      true
    )(state);
    const resourcesStatus = workflowAllResourcesStatusSelector(
      workflowId,
      true
    )(state);

    if (!diagramsStatus.done && !diagramsStatus.loading) {
      dispatch(loadWorkflowDiagrams({ workflowId, loadAll: true }));
    }
    if (!resourcesStatus.done && !resourcesStatus.loading) {
      dispatch(loadWorkflowResources({ workflowId, loadAll: true }));
    }
  }
);

/**
 * Loads diagrams for the particular workflow.
 */
export const loadWorkflowDiagrams = createAsyncThunk(
  'workflows/load/diagrams',
  async (
    { workflowId, loadAll = true }: { workflowId: number; loadAll?: boolean },
    { dispatch, getState }: { dispatch: any; getState: () => any }
  ) => {
    const diagrams = getState().workflows.items[workflowId]?.diagrams;
    if (!diagrams) throw Error();

    const { type: resourceType, endpoint, filter } = diagrams;
    const retrieveAction = getRetrieveAction(resourceType);
    const countAction = getCountAction(resourceType);

    if (endpoint === 'retrieve') {
      await dispatch(retrieveAction({ ids: filter }));
      return;
    }
    if (endpoint === 'list') {
      dispatch(countAction(filter));
      await dispatch(listFiles({ filter, all: loadAll }));
    }
  }
);

/**
 * Loads ALL of the resources for the particular workflow.
 * Should be split to thunk that loads everything and thunk that loads by particular resource type.
 * */
export const loadWorkflowResources = createAsyncThunk(
  'workflows/load/resource',
  async (
    { workflowId, loadAll = true }: { workflowId: number; loadAll?: boolean },
    { dispatch, getState }: { dispatch: any; getState: () => any }
  ) => {
    const resources = getState().workflows.items[workflowId]?.resources;
    if (!resources) throw Error();

    return Promise.all(
      resources.map(async (resource: ResourceSelection) => {
        const { type: resourceType, endpoint, filter } = resource;
        const retrieveAction = getRetrieveAction(resourceType);
        const countAction = getCountAction(resourceType);

        if (endpoint === 'retrieve') {
          await dispatch(retrieveAction({ ids: filter }));
          return;
        }
        if (endpoint === 'list') {
          dispatch(countAction(filter));
          if (resourceType === 'files') {
            await dispatch(listFiles({ filter, all: loadAll }));
            return;
          }
          if (resourceType === 'assets') {
            if (loadAll) await dispatch(listAssetsParallel(filter));
            else await dispatch(listAssets(filter));
          }
        }
      })
    );
  }
);

// --------------------------
// ---------- UTILS ---------
// --------------------------

export function getCountAction(resourceType: ResourceType) {
  switch (resourceType) {
    case 'files':
      return countFiles;
    case 'assets':
      return countAssets;
    default:
      throw new Error(`Resource type '${resourceType}' not supported`);
  }
}

export function getRetrieveAction(resourceType: ResourceType) {
  switch (resourceType) {
    case 'files':
      return retrieveFiles;
    case 'assets':
      return retrieveAssets;
    default:
      throw new Error(`Resource type '${resourceType}' not supported`);
  }
}
