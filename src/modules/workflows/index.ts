import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list as listFiles } from 'modules/files';
import {
  list as listAssets,
  listParallel as listAssetsParallel,
} from 'modules/assets';
import {
  workflowDiagramStatusSelector,
  workflowAllResourcesStatusSelector,
} from 'modules/workflows';
import { Status } from 'modules/sdk-builder/types';
import { ResourceSelection, WorkflowStep, WorkflowOptions } from './types';
import { getCountAction, getRetrieveAction } from './helpers';

interface WorkflowState {
  active: number;
  items: {
    [workflowId: number]: Workflow;
  };
  localStorage: any;
}
interface Workflow {
  diagrams?: ResourceSelection;
  resources?: ResourceSelection[];
  options: WorkflowOptions;
  step: WorkflowStep;
  status?: Status;
}

const initialState: WorkflowState = {
  active: -1,
  items: {},
  localStorage: { version: 1 },
};
const initialWorkflow: Workflow = {
  options: {
    partialMatch: false,
    grayscale: false,
    minTokens: 2,
  },
  step: 'diagramSelection',
};

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
      if (resourceType === 'files') {
        await dispatch(listFiles({ filter, all: loadAll }));
        return;
      }
      if (resourceType === 'assets') {
        if (loadAll) await dispatch(listAssetsParallel(filter));
        else await dispatch(listAssets(filter));
      }
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

    const loadResources = resources.map(async (resource: ResourceSelection) => {
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
    });
    Promise.all(loadResources);
  }
);

export const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setActiveWorkflowId: (state, action) => {
      const workflowId = action.payload;
      state.active = workflowId;
    },
    createNewWorkflow: (state, action) => {
      const workflowId = action.payload ?? Number(new Date());
      state.items[workflowId] = initialWorkflow;
      state.active = workflowId;
    },
    createSelection: (state, action) => {
      const { type, endpoint, query, filter = 'none' } = action.payload;
      const workflowId = state.active ?? Number(new Date());
      const { step } = state.items[workflowId];
      const selection = { type, endpoint, query, filter };
      if (step === 'diagramSelection') {
        state.items[workflowId].diagrams = selection;
      }
      if (step === 'resourceSelection') {
        const oldSelection = state.items[workflowId].resources ?? [];
        const resourceAlreadyExists = oldSelection.find(
          (old: any) => old.type === type
        );
        if (resourceAlreadyExists) {
          const mergedSelection = oldSelection.map((old: any) => {
            if (old.type === type) return selection;
            return old;
          });
          state.items[workflowId].resources = mergedSelection;
        } else state.items[workflowId].resources = [...oldSelection, selection];
      }
    },
    changeOptions: (state, action) => {
      const workflowId = state.active;
      const activeWorkflow = state.items[workflowId];
      const partialMatch =
        action.payload.partialMatch !== undefined
          ? action.payload.partialMatch
          : activeWorkflow.options.partialMatch;
      const grayscale =
        action.payload.grayscale !== undefined
          ? action.payload.grayscale
          : activeWorkflow.options.grayscale;
      const minTokens = action.payload.minTokens
        ? action.payload.minTokens
        : activeWorkflow.options.minTokens;
      state.items[workflowId].options = {
        partialMatch,
        grayscale,
        minTokens,
      };
    },
    moveToStep: (state, action) => {
      const step: WorkflowStep = action.payload;
      const workflowId = state.active;
      state.items[workflowId].step = step;
    },
    importLocalStorageContent: (state, action) => {
      const { items, version } = action.payload;
      if (version === CURRENT_LS_VERSION && Object.keys(items).length > 0)
        state.items = items;
      else state.localStorage.error = 'LS_DATA_IMCOMPATIBLE_OR_MISSING';
    },
  },
});

// -------------------------------------------------------------
// ---------------------- LOCAL STORAGE ------------------------
// -------------------------------------------------------------

export type LSSelection = {
  items: {
    [key: string]: ResourceSelection;
  };
  version: number;
};

const CURRENT_LS_VERSION = 1;

export function getLocalStorageContent(state: WorkflowState): LSSelection {
  return {
    // @ts-ignore
    items: state.items,
    version: CURRENT_LS_VERSION,
  };
}

export const { reducer } = workflowsSlice;
export const {
  setActiveWorkflowId,
  createNewWorkflow,
  createSelection,
  changeOptions,
  moveToStep,
  importLocalStorageContent,
} = workflowsSlice.actions;

export * from './selectors';
export * from './hooks';
export * from './types';
