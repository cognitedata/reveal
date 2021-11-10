import { createSlice } from '@reduxjs/toolkit';
import { Workflow, WorkflowState, ResourceSelection } from 'modules/types';
import { CURRENT_LS_VERSION } from 'stringConstants';
import { startPnidParsingWorkflow, startPnidParsingJob } from './actions';
import {
  setJobStatusReducer,
  setJobStartReducer,
  rejectModelReducer,
  resetWorkflowJobsReducer,
  createJobReducer,
  updateJobReducer,
  rejectJobReducer,
  finishJobReducer,
  changeOptionsReducer,
  moveToStepReducer,
  importLocalStorageContentReducer,
  setActiveWorkflowIdReducer,
  createNewWorkflowReducer,
  updateSelectionReducer,
  removeSelectionReducer,
  selectInteractiveDiagramsReducer,
} from './reducers';

export const standardModelOptions = {
  partialMatch: false,
  minTokens: 2,
  matchFields: {
    files: 'name',
    assets: 'name',
  },
};

export const defaultJobs: Workflow['jobs'] = {
  list: [],
  started: false,
  status: 'incomplete',
  selectedDiagramIds: [],
};
export const defaultInitialWorkflow: Workflow = {
  options: standardModelOptions,
  jobs: defaultJobs,
  steps: {
    current: 'diagramSelection',
    lastCompleted: 'diagramSelection',
  },
};

const initialState: WorkflowState = {
  active: -1,
  items: {},
  localStorage: { version: 1 },
};

export const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setActiveWorkflowId: setActiveWorkflowIdReducer,
    createNewWorkflow: createNewWorkflowReducer,
    updateSelection: updateSelectionReducer,
    removeSelection: removeSelectionReducer,
    changeOptions: changeOptionsReducer,
    moveToStep: moveToStepReducer,
    importLocalStorageContent: importLocalStorageContentReducer,
    setJobStatus: setJobStatusReducer,
    setJobStart: setJobStartReducer,
    rejectModel: rejectModelReducer,
    resetWorkflowJobs: resetWorkflowJobsReducer,
    createJob: createJobReducer,
    updateJob: updateJobReducer,
    rejectJob: rejectJobReducer,
    finishJob: finishJobReducer,
    selectInteractiveDiagrams: selectInteractiveDiagramsReducer,
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        startPnidParsingWorkflow.action.fulfilled,
        startPnidParsingWorkflow.fulfilled
      )
      .addCase(
        startPnidParsingWorkflow.action.rejected,
        startPnidParsingWorkflow.rejected
      );
  },
});

export type LSSelection = {
  items: Record<string, ResourceSelection>;
  version: number;
};

export function getLocalStorageContent(state: WorkflowState): LSSelection {
  return {
    // @ts-ignore
    items: state.items,
    version: CURRENT_LS_VERSION,
  };
}

export const { reducer } = workflowsSlice;
export { startPnidParsingWorkflow, startPnidParsingJob };
export const {
  setJobStatus,
  setJobStart,
  rejectModel,
  createJob,
  updateJob,
  rejectJob,
  finishJob,
  resetWorkflowJobs,
  setActiveWorkflowId,
  createNewWorkflow,
  changeOptions,
  moveToStep,
  importLocalStorageContent,
  updateSelection,
  removeSelection,
  selectInteractiveDiagrams,
} = workflowsSlice.actions;

export * from './selectors';
export * from './actions';
export * from './utils';
export * from './hooks';
export * from './types';
