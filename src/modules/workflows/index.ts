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
import { Workflow, ResourceSelection, WorkflowStep } from 'modules/types';
import { getCountAction, getRetrieveAction } from './helpers';

interface WorkflowState {
  active: number;
  items: {
    [workflowId: number]: Workflow;
  };
  localStorage: any;
}

export const standardModelOptions = {
  partialMatch: false,
  minTokens: 2,
  matchFields: {
    files: 'name',
    assets: 'name',
  },
};

const initialState: WorkflowState = {
  active: -1,
  items: {},
  localStorage: { version: 1 },
};
const defaultInitialWorkflow: Workflow = {
  options: standardModelOptions,
  steps: {
    current: 'diagramSelection',
    lastCompleted: 'diagramSelection',
  },
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

export const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setActiveWorkflowId: (state, action) => {
      const workflowId = action.payload;
      state.active = workflowId;
    },
    setJobId: (state, action) => {
      const { workflowId, jobId } = action.payload;
      state.items[workflowId] = {
        ...state.items[workflowId],
        jobId,
      };
    },
    createNewWorkflow: (state, action) => {
      const {
        workflowId = Number(new Date()),
        diagrams = undefined,
        resources = undefined,
        options = undefined,
      } = action.payload;
      const newWorkflow = {
        ...defaultInitialWorkflow,
        ...(options ? { options } : standardModelOptions),
        ...(diagrams ? { diagrams } : {}),
        ...(resources ? { resources } : {}),
      };
      state.items[workflowId] = newWorkflow;
      state.active = workflowId;
    },
    updateSelection: (state, action) => {
      const { type, endpoint, query, filter } = action.payload;

      const workflowId = state.active ?? Number(new Date());
      const { steps } = state.items[workflowId];
      const selection = {
        type,
        endpoint,
        query,
        filter,
      };

      // Remove jobId to trigger new run
      state.items[workflowId].jobId = undefined;

      if (steps.current === 'diagramSelection') {
        state.items[workflowId].diagrams = selection;
      }
      if (steps.current.startsWith('resourceSelection')) {
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
    removeSelection: (state, action) => {
      const type = action.payload;
      const workflowId = state.active ?? Number(new Date());
      // Remove jobId to trigger new run
      state.items[workflowId].jobId = undefined;
      const { steps } = state.items[workflowId];
      if (steps.current === 'diagramSelection') {
        delete state.items[workflowId].diagrams;
      }
      if (steps.current.startsWith('resourceSelection')) {
        const filteredResourceSelection =
          state.items[workflowId].resources?.filter(
            (resource) => resource.type !== type
          ) ?? [];
        if (filteredResourceSelection?.length)
          state.items[workflowId].resources = filteredResourceSelection;
        else delete state.items[workflowId].resources;
      }
    },
    changeOptions: (state, action) => {
      const workflowId = state.active;
      // Remove jobId to trigger new run
      state.items[workflowId].jobId = undefined;
      const activeWorkflow = state.items[workflowId];
      const partialMatch =
        action.payload.partialMatch ??
        activeWorkflow.options?.partialMatch ??
        standardModelOptions.partialMatch;
      const minTokens =
        action.payload.minTokens ??
        activeWorkflow.options?.minTokens ??
        standardModelOptions.minTokens;
      const matchFields =
        action.payload.matchFields ??
        activeWorkflow.options?.matchFields ??
        standardModelOptions.matchFields;
      state.items[workflowId].options = {
        partialMatch,
        minTokens,
        matchFields,
      };
    },
    moveToStep: (state, action) => {
      const {
        step,
        lastCompletedStep = undefined,
      }: {
        step: WorkflowStep;
        lastCompletedStep: WorkflowStep | undefined;
      } = action.payload;
      const workflowId = state.active;
      if (!state.items[workflowId]) return;
      state.items[workflowId].steps = {
        ...state.items[workflowId].steps,
        current: step,
        lastCompleted:
          lastCompletedStep ?? state.items[workflowId].steps.lastCompleted,
      };
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
  updateSelection,
  removeSelection,
  changeOptions,
  moveToStep,
  setJobId,
  importLocalStorageContent,
} = workflowsSlice.actions;

export * from './selectors';
export * from './helpers';
export * from './hooks';
export * from './types';
