import { WorkflowState } from 'modules/types';
import { defaultJobs } from '..';

type Action = {
  type: string;
  payload: any;
};

/**
 * Selects resources on the Selection page.
 * @param state
 * @param action
 */
export const updateSelectionReducer = (
  state: WorkflowState,
  action: Action
) => {
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
  state.items[workflowId].jobs = defaultJobs;

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
};

/**
 * Removes selection on the Selection page.
 * @param state
 * @param action
 */
export const removeSelectionReducer = (
  state: WorkflowState,
  action: Action
) => {
  const type = action.payload;
  const workflowId = state.active ?? Number(new Date());
  // Remove jobId to trigger new run
  state.items[workflowId].jobs = defaultJobs;
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
};

/**
 * Selects or deselects diagrams on the Results page.
 * @param state
 * @param action
 */
export const selectInteractiveDiagramsReducer = (
  state: WorkflowState,
  action: Action
) => {
  const { workflowId, diagramIds = [] } = action.payload;
  state.items[workflowId].jobs = {
    ...state.items[workflowId].jobs,
    selectedDiagramIds: diagramIds,
  };
};
