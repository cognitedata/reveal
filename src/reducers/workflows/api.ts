import { toast } from '@cognite/cogs.js';
import { nanoid } from '@reduxjs/toolkit';
import chartSlice, { Chart } from 'reducers/charts';
import ChartService from 'services/ChartService';
import WorkflowService from 'services/WorkflowService';
import { AppThunk } from 'store';
import workflowSlice from './slice';
import { Workflow } from './types';

export const fetchWorkflowsForChart = (
  workflowIds: string[]
): AppThunk => async (dispatch, getState) => {
  const { tenant } = getState().environment;

  if (!tenant) {
    // Must have tenant set
    return;
  }

  dispatch(workflowSlice.actions.startLoadingWorkflows());
  try {
    const workflowService = new WorkflowService(tenant);
    const workflows = await Promise.all(
      workflowIds.map((id) => workflowService.getWorkflowById(id))
    );

    dispatch(workflowSlice.actions.finishedLoadingWorkflows(workflows));
  } catch (e) {
    dispatch(workflowSlice.actions.failedLoadingWorkflows(e));
  }
};

export const createNewWorkflow = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const { tenant } = getState().environment;

  if (!tenant) {
    // Must have tenant set
    return;
  }

  const id = nanoid();
  const newWorkflow: Workflow = {
    id,
    name: `workflow-${id}`,
    nodes: [],
    connections: [],
  };

  dispatch(workflowSlice.actions.startStoringNewWorkflow());

  try {
    // Create the workflow
    const workflowService = new WorkflowService(tenant);
    workflowService.saveWorkflow(newWorkflow);

    // Attach this workflow to the current chart
    const nextWorkflowIds = [...(chart.workflowIds || []), newWorkflow.id];
    const chartService = new ChartService(tenant);
    chartService.setWorkflowsOnChart(chart.id, nextWorkflowIds);
    dispatch(workflowSlice.actions.storedNewWorkflow(newWorkflow));
    dispatch(
      chartSlice.actions.storedNewWorkflow({
        id: chart.id,
        changes: { workflowIds: nextWorkflowIds },
      })
    );
  } catch (e) {
    dispatch(workflowSlice.actions.failedStoringNewWorkflow(e));
  }
};

export const saveExistingWorkflow = (workflow: Workflow): AppThunk => async (
  _,
  getState
) => {
  const { tenant } = getState().environment;

  if (!tenant) {
    // Must have tenant set
    return;
  }

  try {
    // Create the workflow
    const workflowService = new WorkflowService(tenant);

    // Make sure we don't store the latest run details
    const workflowToSave = { ...workflow };
    delete workflowToSave.latestRun; // Firestore HATES undefined values, so lets remove it entirely.
    workflowService.saveWorkflow(workflowToSave);
    toast.success('Workflow saved!');
  } catch (e) {
    toast.error('Failed to save workflow');
  }
};
