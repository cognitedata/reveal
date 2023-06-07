import { WorkflowState, WorkflowStep } from 'modules/types';
import { CURRENT_LS_VERSION } from 'stringConstants';
import { defaultInitialWorkflow, defaultJobs, standardModelOptions } from '..';

type Action = {
  type: string;
  payload: any;
};

export const setActiveWorkflowIdReducer = (
  state: WorkflowState,
  action: Action
) => {
  const workflowId = action.payload;
  state.active = workflowId;
};

export const createNewWorkflowReducer = (
  state: WorkflowState,
  action: Action
) => {
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
};

export const changeOptionsReducer = (state: WorkflowState, action: Action) => {
  const workflowId = state.active;
  // Remove jobId to trigger new run
  state.items[workflowId].jobs = defaultJobs;
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
};

export const moveToStepReducer = (state: WorkflowState, action: Action) => {
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
};

export const importLocalStorageContentReducer = (
  state: WorkflowState,
  action: Action
) => {
  const { items, version } = action.payload;
  if (version === CURRENT_LS_VERSION && Object.keys(items).length > 0)
    state.items = items;
  else state.localStorage.error = 'LS_DATA_IMCOMPATIBLE_OR_MISSING';
};
