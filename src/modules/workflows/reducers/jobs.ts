import { WorkflowState, Workflow } from 'modules/types';
import { updateSingleJobStatus } from '../utils';

type Action = {
  type: string;
  payload: any;
};

export const setJobStatusReducer = (state: WorkflowState, action: Action) => {
  const { status } = action.payload;
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  state.items[workflowId].jobs = {
    ...state.items[workflowId].jobs,
    status,
  };
};

export const setJobStartReducer = (state: WorkflowState, action: Action) => {
  const { started = false } = action.payload;
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  state.items[workflowId].jobs = {
    ...state.items[workflowId].jobs,
    started,
  };
};

export const createJobReducer = (state: WorkflowState, action: Action) => {
  const {
    initialValue: { jobId, status },
  } = action.payload;
  const workflowId = state.active;
  state.items[workflowId] = {
    ...state.items[workflowId],
    jobs: {
      ...state.items[workflowId].jobs,
      list: [...(state.items[workflowId]?.jobs?.list ?? []), { jobId, status }],
    },
  };
};

export const updateJobReducer = (state: WorkflowState, action: Action) => {
  const { jobId, ...fieldsToUpdate } = action.payload as {
    jobId: number;
    fieldsToUpdate: Workflow['jobs'];
  };
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  const update = updateSingleJobStatus(
    state.items[workflowId].jobs,
    jobId,
    fieldsToUpdate
  );
  state.items[workflowId].jobs = update;
};

export const rejectJobReducer = (state: WorkflowState, action: Action) => {
  const { jobId } = action.payload;
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  const update = updateSingleJobStatus(state.items[workflowId].jobs, jobId, {
    status: 'Failed',
  });
  state.items[workflowId].jobs = update;
};

// this is triggered when user tried to run a parsing job, but there is
// an early stage error and job ID does not even get generated yet.
export const rejectModelReducer = (state: WorkflowState, _action: Action) => {
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  state.items[workflowId].jobs = {
    ...state.items[workflowId].jobs,
    status: 'rejected',
    started: false,
  };
};

export const finishJobReducer = (state: WorkflowState, action: Action) => {
  const { jobId, ...fieldsToUpdate } = action.payload;
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  const update = updateSingleJobStatus(state.items[workflowId].jobs, jobId, {
    ...fieldsToUpdate,
    status: 'Completed',
  });
  state.items[workflowId].jobs = update;
};

export const resetWorkflowJobsReducer = (
  state: WorkflowState,
  _action: Action
) => {
  const workflowId = state.active;
  if (!state.items[workflowId]) return;
  state.items[workflowId].jobs = {
    ...state.items[workflowId].jobs,
    list: [],
    selectedDiagramIds: [],
  };
};
